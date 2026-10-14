import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET profile by session ID
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const rows = await db.select().from(profiles).where(eq(profiles.sessionId, sessionId));
  if (rows.length === 0) {
    return NextResponse.json({ profile: null });
  }
  return NextResponse.json({ profile: rows[0] });
}

// POST create or update profile
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    epicName,
    reloadRank,
    brRank,
    peakReloadRank,
    peakBrRank,
    inputDevice,
    playtimeHoursPerDay,
    playtimeDaysPerWeek,
    goals,
    onboardingComplete,
  } = body;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // Check if profile exists
  const existing = await db.select().from(profiles).where(eq(profiles.sessionId, sessionId));

  if (existing.length > 0) {
    // Update
    const updated = await db
      .update(profiles)
      .set({
        epicName,
        reloadRank,
        brRank,
        peakReloadRank,
        peakBrRank,
        inputDevice,
        playtimeHoursPerDay,
        playtimeDaysPerWeek,
        goals,
        onboardingComplete,
        updatedAt: new Date(),
      })
      .where(eq(profiles.sessionId, sessionId))
      .returning();
    return NextResponse.json({ profile: updated[0] });
  } else {
    // Create
    const created = await db
      .insert(profiles)
      .values({
        sessionId,
        epicName,
        reloadRank,
        brRank,
        peakReloadRank,
        peakBrRank,
        inputDevice,
        playtimeHoursPerDay,
        playtimeDaysPerWeek,
        goals,
        onboardingComplete,
      })
      .returning();
    return NextResponse.json({ profile: created[0] });
  }
}
