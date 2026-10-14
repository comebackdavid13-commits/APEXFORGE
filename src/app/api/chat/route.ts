import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  profiles,
  weaknessRatings,
  chatMessages,
  sessionReviews,
  vodNotes,
  customTournaments,
  rankHistory,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateCoachResponse, getInitialCoachMessage } from "@/lib/coach-engine";
import type { OnboardingData, SkillRating } from "@/lib/types";

// GET chat history
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ messages: [] });
  }

  const msgs = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.profileId, profileRows[0].id));

  return NextResponse.json({ messages: msgs });
}

// POST send a message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, message, isInitial } = body as {
    sessionId: string;
    message?: string;
    isInitial?: boolean;
  };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // Get profile
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileRows[0];

  // Get weakness ratings
  const ratings = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profile.id));

  const onboardingData: OnboardingData = {
    epicName: profile.epicName || "",
    reloadRank: profile.reloadRank || "",
    brRank: profile.brRank || "",
    peakReloadRank: profile.peakReloadRank || "",
    peakBrRank: profile.peakBrRank || "",
    inputDevice: (profile.inputDevice as "kbm" | "controller") || "kbm",
    playtimeHoursPerDay: profile.playtimeHoursPerDay || 2,
    playtimeDaysPerWeek: profile.playtimeDaysPerWeek || 5,
    goals: (profile.goals as string[]) || [],
  };

  const skillRatings: SkillRating[] = ratings.map((r) => ({
    category: r.category,
    skill: r.skill,
    rating: r.rating,
  }));

  // ── Build full memory for the coach ──
  const { buildCoachMemory } = await import("@/lib/memory-builder");
  // ── Also fetch live meta (cached) so coach knows about latest buffs/nerfs ──
  let liveMetaContext = "";
  try {
    const { fetchLiveMeta } = await import("@/lib/live-meta");
    const liveMeta = await fetchLiveMeta();
    if (liveMeta?.weaponUpdates?.length > 0) {
      liveMetaContext = `\n**Latest meta changes (from ${liveMeta.activeSeason}):**\n` +
        liveMeta.weaponUpdates
          .map((u) => `- ${u.weaponName}: ${u.status.toUpperCase()} (${u.reason.slice(0, 80)})`)
          .join("\n");
    } else if (liveMeta?.activeSeason) {
      liveMetaContext = `\n**Current season:** ${liveMeta.activeSeason}.`;
    }
  } catch (err) {
    // silent — live meta is best-effort
  }

  let memory: ReturnType<typeof buildCoachMemory> | null = null;
  try {
    const [recentMsgs, reviews, deaths, tournaments, ranks] =
      await Promise.all([
        db
          .select({
            role: chatMessages.role,
            content: chatMessages.content,
            createdAt: chatMessages.createdAt,
          })
          .from(chatMessages)
          .where(eq(chatMessages.profileId, profile.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(50),
        db
          .select()
          .from(sessionReviews)
          .where(eq(sessionReviews.profileId, profile.id))
          .orderBy(desc(sessionReviews.createdAt))
          .limit(5),
        db
          .select({
            deathReason: vodNotes.deathReason,
            situation: vodNotes.situation,
            notes: vodNotes.notes,
            aiAnalysis: vodNotes.aiAnalysis,
            createdAt: vodNotes.createdAt,
          })
          .from(vodNotes)
          .where(eq(vodNotes.profileId, profile.id))
          .orderBy(desc(vodNotes.createdAt))
          .limit(20),
        db
          .select({
            name: customTournaments.name,
            mode: customTournaments.mode,
            finalPlacement: customTournaments.finalPlacement,
            prEarned: customTournaments.prEarned,
            cashEarned: customTournaments.cashEarned,
            killsEarned: customTournaments.killsEarned,
            pointsEarned: customTournaments.pointsEarned,
            completedAt: customTournaments.completedAt,
          })
          .from(customTournaments)
          .where(eq(customTournaments.profileId, profile.id))
          .orderBy(desc(customTournaments.completedAt))
          .limit(10),
        db
          .select({
            mode: rankHistory.mode,
            rank: rankHistory.rank,
            recordedAt: rankHistory.recordedAt,
          })
          .from(rankHistory)
          .where(eq(rankHistory.profileId, profile.id))
          .orderBy(desc(rankHistory.recordedAt))
          .limit(20),
      ]);

    memory = buildCoachMemory({
      onboarding: onboardingData,
      ratings: skillRatings,
      recentMessages: recentMsgs.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: m.createdAt?.toISOString() || new Date().toISOString(),
      })),
      lastSessionReview: reviews[0]
        ? {
            biggestMistake: reviews[0].biggestMistake,
            whatWentWrong: reviews[0].whatWentWrong,
            focusLevel: reviews[0].focusLevel,
            mechanicalConsistency: reviews[0].mechanicalConsistency,
            decisionQuality: reviews[0].decisionQuality,
            tiltLevel: reviews[0].tiltLevel,
            when: reviews[0].createdAt?.toISOString() || "",
          }
        : null,
      recentDeaths: deaths.map((d) => ({
        deathReason: d.deathReason,
        situation: d.situation,
        notes: d.notes,
        aiAnalysis: d.aiAnalysis,
        when: d.createdAt?.toISOString() || "",
      })),
      tournaments: tournaments.map((t) => ({
        name: t.name,
        mode: t.mode,
        finalPlacement: t.finalPlacement,
        prEarned: t.prEarned,
        cashEarned: t.cashEarned,
        killsEarned: t.killsEarned,
        pointsEarned: t.pointsEarned,
        completedAt: t.completedAt?.toISOString() || null,
      })),
      rankHistory: ranks.map((r) => ({
        mode: r.mode,
        rank: r.rank,
        when: r.recordedAt?.toISOString() || "",
      })),
    });
  } catch (err) {
    console.error("Memory build error:", err);
  }

  const context = {
    onboarding: onboardingData,
    ratings: skillRatings,
    planGenerated: true,
    memory,
  };

  if (isInitial) {
    const coachMsg = getInitialCoachMessage(context);
    const saved = await db
      .insert(chatMessages)
      .values({
        profileId: profile.id,
        role: "assistant",
        content: coachMsg,
      })
      .returning();

    return NextResponse.json({ message: saved[0] });
  }

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  // Save user message
  await db.insert(chatMessages).values({
    profileId: profile.id,
    role: "user",
    content: message,
  });

  // Generate memory-enriched coach response (with live meta context appended)
  const coachResponse = generateCoachResponse(
    liveMetaContext ? message + liveMetaContext : message,
    context
  );

  // Save coach response
  const saved = await db
    .insert(chatMessages)
    .values({
      profileId: profile.id,
      role: "assistant",
      content: coachResponse,
    })
    .returning();

  return NextResponse.json({ message: saved[0] });
}
