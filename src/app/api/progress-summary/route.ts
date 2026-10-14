import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, rankHistory, weeklyReviews, weaknessRatings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET progress summary for graphs
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
    return NextResponse.json({ rankHistory: [], weeklyReviews: [], currentRatings: [] });
  }

  const profileId = profileRows[0].id;

  const ranks = await db
    .select()
    .from(rankHistory)
    .where(eq(rankHistory.profileId, profileId))
    .orderBy(rankHistory.recordedAt);

  const reviews = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.profileId, profileId))
    .orderBy(weeklyReviews.weekStart);

  const currentRatings = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profileId));

  return NextResponse.json({
    rankHistory: ranks,
    weeklyReviews: reviews,
    currentRatings,
  });
}
