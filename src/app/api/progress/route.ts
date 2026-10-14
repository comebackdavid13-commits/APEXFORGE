import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, rankHistory, weeklyReviews, weaknessRatings } from "@/db/schema";
import { eq, desc, gte } from "drizzle-orm";
import type { SkillRating } from "@/lib/types";

// GET progress data (rank history + weekly reviews)
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
    return NextResponse.json({ rankHistory: [], weeklyReviews: [] });
  }

  const profileId = profileRows[0].id;

  // Get rank history
  const ranks = await db
    .select()
    .from(rankHistory)
    .where(eq(rankHistory.profileId, profileId))
    .orderBy(desc(rankHistory.recordedAt));

  // Get weekly reviews
  const reviews = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.profileId, profileId))
    .orderBy(desc(weeklyReviews.weekStart));

  return NextResponse.json({
    rankHistory: ranks,
    weeklyReviews: reviews,
  });
}

// POST create weekly review
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, ratings, notes } = body as {
    sessionId: string;
    ratings: SkillRating[];
    notes?: string;
  };

  if (!sessionId || !ratings) {
    return NextResponse.json(
      { error: "sessionId and ratings required" },
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

  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  // Check if a review already exists for this week
  const existingReviews = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.profileId, profileId));

  const thisWeekReview = existingReviews.find((r) => {
    const reviewWeek = new Date(r.weekStart);
    return reviewWeek.getTime() === weekStart.getTime();
  });

  if (thisWeekReview) {
    return NextResponse.json(
      { error: "Weekly review already submitted for this week" },
      { status: 400 }
    );
  }

  // Save the weekly review
  const saved = await db
    .insert(weeklyReviews)
    .values({
      profileId,
      weekStart,
      ratings,
      notes: notes || null,
    })
    .returning();

  // Also update the main weakness ratings
  await db.delete(weaknessRatings).where(eq(weaknessRatings.profileId, profileId));
  if (ratings.length > 0) {
    await db.insert(weaknessRatings).values(
      ratings.map((r) => ({
        profileId,
        category: r.category,
        skill: r.skill,
        rating: r.rating,
      }))
    );
  }

  return NextResponse.json({ review: saved[0] });
}
