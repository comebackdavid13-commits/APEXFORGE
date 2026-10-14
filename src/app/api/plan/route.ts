import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, weaknessRatings, trainingPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateTrainingPlan } from "@/lib/plan-generator";
import type { OnboardingData, SkillRating } from "@/lib/types";

// GET training plan for a profile
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
    return NextResponse.json({ plan: null });
  }

  const profileId = profileRows[0].id;
  const plans = await db
    .select()
    .from(trainingPlans)
    .where(eq(trainingPlans.profileId, profileId));

  if (plans.length === 0) {
    return NextResponse.json({ plan: null });
  }

  return NextResponse.json({ plan: plans[plans.length - 1].planData });
}

// POST generate a new training plan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, onboarding: bodyOnboarding, ratings: bodyRatings } = body as {
      sessionId?: string;
      onboarding?: OnboardingData;
      ratings?: SkillRating[];
    };

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    let onboardingData: OnboardingData | null = null;
    let skillRatings: SkillRating[] = [];
    let profileId: string | null = null;

    // Try DB first
    try {
      const profileRows = await db
        .select()
        .from(profiles)
        .where(eq(profiles.sessionId, sessionId));

      if (profileRows.length > 0) {
        const profile = profileRows[0];
        profileId = profile.id;
        onboardingData = {
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

        const ratings = await db
          .select()
          .from(weaknessRatings)
          .where(eq(weaknessRatings.profileId, profile.id));
        skillRatings = ratings.map((r) => ({
          category: r.category,
          skill: r.skill,
          rating: r.rating,
        }));
      }
    } catch {
      // DB unavailable — fall through to body-provided data
    }

    // Fallback to body-provided context (works even if profile save failed earlier)
    if (!onboardingData && bodyOnboarding) onboardingData = bodyOnboarding;
    if (skillRatings.length === 0 && Array.isArray(bodyRatings) && bodyRatings.length > 0) {
      skillRatings = bodyRatings;
    }

    // Ultimate fallback — neutral onboarding so plan generation NEVER 404s
    if (!onboardingData) {
      onboardingData = {
        epicName: "Player",
        reloadRank: "Gold",
        brRank: "Gold",
        peakReloadRank: "Platinum",
        peakBrRank: "Platinum",
        inputDevice: "kbm",
        playtimeHoursPerDay: 2,
        playtimeDaysPerWeek: 5,
        goals: [],
      };
    }

    // Generate plan (plan-generator itself has safe defaults for empty ratings)
    const plan = generateTrainingPlan(onboardingData, skillRatings);

    // Persist plan only if we could resolve a profile — never block on save errors
    if (profileId) {
      try {
        await db.insert(trainingPlans).values({
          profileId,
          planData: plan,
        });
      } catch {
        // ignore save failure — still return the plan
      }
    }

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Plan API fatal error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}
