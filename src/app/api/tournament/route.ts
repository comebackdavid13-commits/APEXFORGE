import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, tournamentEntries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET tournament entries
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
    return NextResponse.json({ entries: [] });
  }

  const entries = await db
    .select()
    .from(tournamentEntries)
    .where(eq(tournamentEntries.profileId, profileRows[0].id))
    .orderBy(desc(tournamentEntries.date));

  return NextResponse.json({ entries });
}

// POST create tournament entry
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    name,
    type,
    date,
    placement,
    totalTeams,
    kills,
    points,
    pr,
    earnings,
    teammates,
    notes,
  } = body;

  if (!sessionId || !name || !type || !date) {
    return NextResponse.json(
      { error: "sessionId, name, type, and date required" },
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
    .insert(tournamentEntries)
    .values({
      profileId: profileRows[0].id,
      name,
      type,
      date: new Date(date),
      placement: placement || null,
      totalTeams: totalTeams || null,
      kills: kills || null,
      points: points || null,
      pr: pr || null,
      earnings: earnings || null,
      teammates: teammates || null,
      notes: notes || null,
    })
    .returning();

  return NextResponse.json({ entry: saved[0] });
}

// DELETE tournament entry
export async function DELETE(req: NextRequest) {
  const entryId = req.nextUrl.searchParams.get("entryId");
  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 });
  }

  await db.delete(tournamentEntries).where(eq(tournamentEntries.id, entryId));
  return NextResponse.json({ success: true });
}
