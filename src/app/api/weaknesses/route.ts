import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { weaknessRatings, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET weakness ratings for a profile
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // Get profile id
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ ratings: [] });
  }

  const profileId = profileRows[0].id;
  const ratings = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profileId));

  return NextResponse.json({ ratings });
}

// POST save weakness ratings (batch)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, ratings } = body as {
    sessionId: string;
    ratings: { category: string; skill: string; rating: number }[];
  };

  if (!sessionId || !ratings) {
    return NextResponse.json({ error: "sessionId and ratings required" }, { status: 400 });
  }

  // Get profile id
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));
  if (profileRows.length === 0) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profileId = profileRows[0].id;

  // Delete existing ratings for this profile
  await db.delete(weaknessRatings).where(eq(weaknessRatings.profileId, profileId));

  // Insert new ratings
  if (ratings.length > 0) {
    await db.insert(weaknessRatings).values(
      ratings.map((r: { category: string; skill: string; rating: number }) => ({
        profileId,
        category: r.category,
        skill: r.skill,
        rating: r.rating,
      }))
    );
  }

  // Fetch back the saved ratings
  const saved = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profileId));

  return NextResponse.json({ ratings: saved });
}
