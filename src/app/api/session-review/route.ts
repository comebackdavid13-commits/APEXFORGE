import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, sessionReviews, chatMessages, weaknessRatings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateCoachResponse } from "@/lib/coach-engine";
import type { OnboardingData, SkillRating } from "@/lib/types";

// GET session reviews
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
    return NextResponse.json({ reviews: [] });
  }

  const profileId = profileRows[0].id;
  const reviews = await db
    .select()
    .from(sessionReviews)
    .where(eq(sessionReviews.profileId, profileId))
    .orderBy(desc(sessionReviews.createdAt));

  return NextResponse.json({ reviews });
}

// POST create session review + feed AI coach
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    winRate,
    focusLevel,
    mechanicalConsistency,
    decisionQuality,
    tiltLevel,
    oneGoal,
    whatWentWell,
    whatWentWrong,
    biggestMistake,
  } = body;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileRows[0];

  // Save the review
  const saved = await db
    .insert(sessionReviews)
    .values({
      profileId: profile.id,
      winRate,
      focusLevel,
      mechanicalConsistency,
      decisionQuality,
      tiltLevel,
      oneGoal,
      whatWentWell,
      whatWentWrong,
      biggestMistake,
    })
    .returning();

  // Get current ratings for context
  const ratings = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profile.id));

  const skillRatings: SkillRating[] = ratings.map((r) => ({
    category: r.category,
    skill: r.skill,
    rating: r.rating,
  }));

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

  // Generate personalized coach insight based on this review
  const reviewContext = `**Session Review just submitted:**
- Win Rate: ${winRate}
- Focus Level: ${focusLevel}
- Mechanical Consistency: ${mechanicalConsistency}
- Decision Quality: ${decisionQuality}
- Tilt Level: ${tiltLevel}/5
- Goal: ${oneGoal}
- What went well: ${whatWentWell}
- What went wrong: ${whatWentWrong}
- Biggest mistake: ${biggestMistake}

Based on this, what is your #1 priority right now?`;

  const coachInsight = generateCoachResponse(reviewContext, {
    onboarding: onboardingData,
    ratings: skillRatings,
    planGenerated: true,
  });

  // Save a coach message with this insight
  await db.insert(chatMessages).values({
    profileId: profile.id,
    role: "assistant",
    content: coachInsight,
  });

  return NextResponse.json({
    review: saved[0],
    coachInsight,
  });
}
