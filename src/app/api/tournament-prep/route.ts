import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, customTournaments, chatMessages, weaknessRatings, sessionReviews } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { prepGuides } from "@/lib/tournament-data";
import { generateCoachResponse } from "@/lib/coach-engine";
import type { OnboardingData, SkillRating } from "@/lib/types";

// GET custom tournaments for user
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
    return NextResponse.json({ tournaments: [] });
  }

  const profileId = profileRows[0].id;
  const rows = await db
    .select()
    .from(customTournaments)
    .where(eq(customTournaments.profileId, profileId))
    .orderBy(customTournaments.startDate);

  return NextResponse.json({ tournaments: rows });
}

// POST create custom tournament + generate AI prep plan
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    name,
    mode,
    startDate,
    endDate,
    maxGames,
    isCash,
    isPR,
    targetPlacement,
    notes,
  } = body;

  const { startLocalIso, endLocalIso } = body;

  if (!sessionId || !name || !mode || !startDate || !endDate) {
    return NextResponse.json(
      { error: "sessionId, name, mode, startDate, and endDate required" },
      { status: 400 }
    );
  }

  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileRows[0];
  // startDate/endDate come from datetime-local inputs (user's local wall-clock time)
  // new Date("2026-07-29T19:00") is parsed as LOCAL by JS engines, so this represents
  // the exact moment the user selected — displayed back in their local timezone.
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Save tournament
  const saved = await db
    .insert(customTournaments)
    .values({
      profileId: profile.id,
      name,
      mode,
      startDate: start,
      endDate: end,
      maxGames: maxGames || 10,
      isCash: !!isCash,
      isPR: !!isPR,
      targetPlacement: targetPlacement || 50,
      notes: notes || null,
      startLocalIso: startLocalIso || null,
      endLocalIso: endLocalIso || null,
    })
    .returning();

  // Fetch context for AI
  const ratings = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profile.id));

  const skillRatings: SkillRating[] = ratings.map((r) => ({
    category: r.category,
    skill: r.skill,
    rating: r.rating,
  }));

  const recentReviews = await db
    .select()
    .from(sessionReviews)
    .where(eq(sessionReviews.profileId, profile.id))
    .orderBy(desc(sessionReviews.createdAt));

  const latestReview = recentReviews[0] || null;

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

  // Map mode to guide
  const modeGuide = prepGuides[mode] || prepGuides["duo"];
  const generalGuide = prepGuides["general"];

  // Calculate time until tournament
  const now = new Date();
  const msUntil = start.getTime() - now.getTime();
  const hoursUntil = Math.max(0, Math.floor(msUntil / (1000 * 60 * 60)));
  const daysUntil = Math.floor(hoursUntil / 24);
  const formatStart = start.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  const formatEnd = end.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  // Build per-day prep plan
  const weakest = skillRatings
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 4)
    .map((s) => s.skill);

  const prepTasks: string[] = [];
  if (daysUntil >= 2) {
    prepTasks.push("**Day 1:** Full warm-up + mechanics foundation. Hit your weaknesses hard.");
  }
  if (daysUntil >= 1) {
    prepTasks.push("**Day 2:** Mode-specific scrims/practice. Practice your ENTIRE tournament drop at least 3x.");
  }

  prepTasks.push("**Morning of:** 30-min full warm-up routine, no ranked after.");

  const lastMistake = latestReview
    ? ` Your biggest recent mistake was: "${latestReview.biggestMistake}".`
    : "";

  const coachContext = `You just registered for **${name}** running ${formatStart} → ${formatEnd}.

**Tournament details:**
- Mode: ${mode.toUpperCase()}
- Duration: ${maxGames || 10} games
- Target: Top ${targetPlacement || 50}
${isCash ? "- Cash prizes available\n" : "- No cash prizes (practice/value event)\n"}${isPR ? "- PR earned based on placement\n" : ""}${lastMistake}

**You have ${daysUntil} day${daysUntil !== 1 ? "s" : ""} (${hoursUntil} hours) until it starts.**

**Mode-specific prep for ${mode}:**
Focus: ${modeGuide.focus}
${modeGuide.tips.map((t) => `• ${t}`).join("\n")}

**Your weakest skills:** ${weakest.join(", ")}.

**General tournament prep:**
${generalGuide.tips.map((t) => `• ${t}`).join("\n")}

**Your personalized prep timeline:**
${prepTasks.map((t, i) => `${t}`).join("\n")}

Lock in. The tournament starts in less than ${daysUntil || hoursUntil} days. You have time for exactly the right amount of prep — no more, no less. Execute.`;

  const coachInsight = generateCoachResponse(coachContext, {
    onboarding: onboardingData,
    ratings: skillRatings,
    planGenerated: true,
  });

  // Save as a coach message
  await db.insert(chatMessages).values({
    profileId: profile.id,
    role: "assistant",
    content: coachInsight,
  });

  return NextResponse.json({
    tournament: saved[0],
    prepPlan: coachInsight,
    daysUntil,
    hoursUntil,
  });
}

// PUT log result for a finished tournament
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    tournamentId,
    finalPlacement,
    pointsEarned,
    killsEarned,
    cashEarned,
    prEarned,
    resultNotes,
  } = body;

  if (!sessionId || !tournamentId) {
    return NextResponse.json(
      { error: "sessionId and tournamentId required" },
      { status: 400 }
    );
  }

  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profileId = profileRows[0].id;

  // Verify the tournament belongs to this user
  const tourneyRows = await db
    .select()
    .from(customTournaments)
    .where(
      and(
        eq(customTournaments.id, tournamentId),
        eq(customTournaments.profileId, profileId)
      )
    );
  if (tourneyRows.length === 0) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const updated = await db
    .update(customTournaments)
    .set({
      finalPlacement: finalPlacement ?? null,
      pointsEarned: pointsEarned ?? null,
      killsEarned: killsEarned ?? null,
      cashEarned: cashEarned != null ? Math.round(cashEarned * 100) : null, // store cents
      prEarned: prEarned ?? null,
      resultNotes: resultNotes || null,
      completedAt: new Date(),
    })
    .where(eq(customTournaments.id, tournamentId))
    .returning();

  return NextResponse.json({ tournament: updated[0] });
}

// DELETE custom tournament
export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const id = req.nextUrl.searchParams.get("id");

  if (!sessionId || !id) {
    return NextResponse.json(
      { error: "sessionId and id required" },
      { status: 400 }
    );
  }

  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await db.delete(customTournaments).where(eq(customTournaments.id, id));
  return NextResponse.json({ success: true });
}
