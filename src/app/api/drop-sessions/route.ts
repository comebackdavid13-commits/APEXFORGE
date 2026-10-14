import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, dropSessions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET drop sessions + aggregated stats
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
    return NextResponse.json({ sessions: [], stats: {} });
  }

  const profileId = profileRows[0].id;

  const sessions = await db
    .select()
    .from(dropSessions)
    .where(eq(dropSessions.profileId, profileId))
    .orderBy(desc(dropSessions.createdAt));

  // Aggregate stats per POI
  const agg = await db
    .select({
      poiId: dropSessions.poiId,
      games: sql<number>`COALESCE(SUM(${dropSessions.gamesPlayed}), 0)`,
      wins: sql<number>`COALESCE(SUM(${dropSessions.wins}), 0)`,
      top10: sql<number>`COALESCE(SUM(${dropSessions.top10}), 0)`,
      top5: sql<number>`COALESCE(SUM(${dropSessions.top5}), 0)`,
      kills: sql<number>`COALESCE(SUM(${dropSessions.kills}), 0)`,
      survived: sql<number>`COALESCE(SUM(${dropSessions.survivedOffSpawn}), 0)`,
      avgPlacement: sql<number>`COALESCE(AVG(${dropSessions.avgPlacement}), 0)`,
    })
    .from(dropSessions)
    .where(eq(dropSessions.profileId, profileId))
    .groupBy(dropSessions.poiId);

  const stats: Record<string, {
    games: number;
    wins: number;
    top10: number;
    top5: number;
    kills: number;
    survived: number;
    avgPlacement: number;
  }> = {};
  for (const row of agg) {
    stats[row.poiId] = {
      games: Number(row.games),
      wins: Number(row.wins),
      top10: Number(row.top10),
      top5: Number(row.top5),
      kills: Number(row.kills),
      survived: Number(row.survived),
      avgPlacement: Number(row.avgPlacement),
    };
  }

  return NextResponse.json({ sessions, stats });
}

// POST create drop session
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    poiId,
    gameMode,
    squadSize,
    gamesPlayed,
    avgPlacement,
    kills,
    survivedOffSpawn,
    top10,
    top5,
    wins,
    notes,
  } = body;

  if (!sessionId || !poiId || !gameMode || !squadSize) {
    return NextResponse.json(
      { error: "sessionId, poiId, gameMode, squadSize required" },
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

  const saved = await db
    .insert(dropSessions)
    .values({
      profileId: profileRows[0].id,
      poiId,
      gameMode,
      squadSize,
      gamesPlayed: gamesPlayed || 1,
      avgPlacement: avgPlacement || null,
      kills: kills || null,
      survivedOffSpawn: survivedOffSpawn || null,
      top10: top10 || null,
      top5: top5 || null,
      wins: wins || null,
      notes: notes || null,
    })
    .returning();

  return NextResponse.json({ session: saved[0] });
}

// DELETE drop session
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

  await db
    .delete(dropSessions)
    .where(eq(dropSessions.id, id));

  return NextResponse.json({ success: true });
}
