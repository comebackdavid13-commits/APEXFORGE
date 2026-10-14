import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, warmupRoutines } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET warmup routines
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
    return NextResponse.json({ routines: [] });
  }

  const routines = await db
    .select()
    .from(warmupRoutines)
    .where(eq(warmupRoutines.profileId, profileRows[0].id));

  return NextResponse.json({ routines });
}

// POST create warmup routine
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, name, totalDuration, type, description, steps } = body;

  if (!sessionId || !name || !steps) {
    return NextResponse.json(
      { error: "sessionId, name, and steps required" },
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
    .insert(warmupRoutines)
    .values({
      profileId: profileRows[0].id,
      name,
      totalDuration: totalDuration || steps.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0),
      type: type || "custom",
      description: description || "",
      steps,
    })
    .returning();

  return NextResponse.json({ routine: saved[0] });
}

// DELETE warmup routine
export async function DELETE(req: NextRequest) {
  const routineId = req.nextUrl.searchParams.get("routineId");
  if (!routineId) {
    return NextResponse.json({ error: "routineId required" }, { status: 400 });
  }

  await db.delete(warmupRoutines).where(eq(warmupRoutines.id, routineId));
  return NextResponse.json({ success: true });
}
