import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  profiles,
  chatMessages,
  sessionReviews,
  vodNotes,
  customTournaments,
  rankHistory,
  weaknessRatings,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { buildCoachMemory, type CoachMemory } from "@/lib/memory-builder";
import type { OnboardingData, SkillRating } from "@/lib/types";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.sessionId, sessionId));
    if (profileRows.length === 0) {
      return NextResponse.json({ memory: null });
    }

    const profile = profileRows[0];

    // Recent messages
    const recentMsgs = await db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.profileId, profile.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);

    // Session reviews
    const reviews = await db
      .select()
      .from(sessionReviews)
      .where(eq(sessionReviews.profileId, profile.id))
      .orderBy(desc(sessionReviews.createdAt))
      .limit(5);

    // VOD deaths
    const deaths = await db
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
      .limit(20);

    // Tournaments
    const tournaments = await db
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
      .limit(10);

    // Rank history
    const ranks = await db
      .select({
        mode: rankHistory.mode,
        rank: rankHistory.rank,
        recordedAt: rankHistory.recordedAt,
      })
      .from(rankHistory)
      .where(eq(rankHistory.profileId, profile.id))
      .orderBy(desc(rankHistory.recordedAt))
      .limit(20);

    // Weakness ratings
    const ratings = await db
      .select()
      .from(weaknessRatings)
      .where(eq(weaknessRatings.profileId, profile.id));

    const onboarding: OnboardingData = {
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

    const memory: CoachMemory = buildCoachMemory({
      onboarding,
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

    return NextResponse.json({ memory });
  } catch (err) {
    console.error("Coach memory error:", err);
    return NextResponse.json({ memory: null });
  }
}
