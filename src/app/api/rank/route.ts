import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, rankHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET rank history
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
    return NextResponse.json({ history: [] });
  }

  const history = await db
    .select()
    .from(rankHistory)
    .where(eq(rankHistory.profileId, profileRows[0].id))
    .orderBy(desc(rankHistory.recordedAt));

  return NextResponse.json({ history });
}

// POST update rank
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, mode, rank } = body as {
    sessionId: string;
    mode: "br" | "reload";
    rank: string;
  };

  if (!sessionId || !mode || !rank) {
    return NextResponse.json(
      { error: "sessionId, mode, and rank required" },
      { status: 400 }
    );
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

  // Update the profile's current rank
  const updateData =
    mode === "br"
      ? { brRank: rank, updatedAt: new Date() }
      : { reloadRank: rank, updatedAt: new Date() };

  await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.sessionId, sessionId));

  // Record in rank history
  await db.insert(rankHistory).values({
    profileId: profile.id,
    mode,
    rank,
  });

  // Return updated profile
  const updated = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId));

  return NextResponse.json({ profile: updated[0] });
}
