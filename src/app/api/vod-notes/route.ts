import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, vodNotes, weaknessRatings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { SkillRating } from "@/lib/types";

// Generate AI analysis for a death
function generateDeathAnalysis(
  deathReason: string,
  situation: string | null,
  notes: string | null,
  gameMode: string,
  skillRatings: SkillRating[]
): string {
  const lowerReason = deathReason.toLowerCase();
  const lowerNotes = (notes || "").toLowerCase();
  const lowerSituation = (situation || "").toLowerCase();

  // Find weakest areas
  const weakestSkills = [...skillRatings]
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 3)
    .map((s) => s.skill);

  let analysis = "";

  // Analyze based on death reason patterns
  if (lowerReason.includes("aim") || lowerReason.includes("missed") || lowerReason.includes("whiff")) {
    analysis = `**Aim Issue Detected**

Your death was aim-related. Here's how to fix it:

1. **Pre-game routine** — Before queuing, spend 10 minutes in Skaavok aim trainer. Focus on the drill that matches what you struggled with (tracking for AR, flicking for shotgun).

2. **Crosshair placement** — You likely had your crosshair in the wrong spot before the fight started. Always pre-aim head level at common angles.

3. **Fight pacing** — If you're whiffing, you might be rushing your shots. Take an extra 0.2 seconds to line up that first shot — it's worth it.

**Drill to fix this:** Go into a 1v1 box fight map and focus ONLY on first-shot accuracy. Don't spray. One clean shot at a time.`;
  } else if (
    lowerReason.includes("build") ||
    lowerReason.includes("wall") ||
    lowerReason.includes("edit") ||
    lowerReason.includes("piece")
  ) {
    analysis = `**Building/Piece Control Issue Detected**

You died due to a mechanical or piece control error. Here's the fix:

1. **Wall ownership** — If someone took your wall, you need to practice wall replace timing. The key is holding your wall button and timing the pickaxe.

2. **Edit speed** — If you got edited on, your opponent out-sped you. Spend 15 min/day in Raider's Edit Course timing yourself.

3. **Protected peeks** — Never edit without already having a cone or ramp to protect your re-box.

**Drill to fix this:** Play 1v1 realistic fights and focus on ONE thing: never being in an unprotected box. If you die exposed, you failed the drill.`;
  } else if (
    lowerReason.includes("third") ||
    lowerReason.includes("pinch") ||
    lowerReason.includes("trade") ||
    lowerReason.includes("multiple")
  ) {
    analysis = `**Trade/Third-Party Death Detected**

You got caught in a bad situation with multiple enemies. This is a game sense issue, not a mechanics issue.

1. **Fight timer** — Any fight lasting more than 30 seconds is too long. Either finish it or disengage.

2. **Audio awareness** — Before taking a fight, listen for 2 seconds. If you hear builds nearby, someone is coming.

3. **Exit strategy** — BEFORE you W-key, know your escape route. If you don't have one, don't take the fight.

**The rule:** If you're losing or it's taking too long, box up, heal, and reposition. No fight is worth dying to a third party.`;
  } else if (
    lowerReason.includes("zone") ||
    lowerReason.includes("rotat") ||
    lowerReason.includes("storm") ||
    lowerReason.includes("surge")
  ) {
    analysis = `**Rotation/Zone Death Detected**

You died to zone, bad rotation, or storm surge. This is a macro game sense issue.

1. **Zone awareness** — You should know where zone is pulling 10 seconds before it starts moving. Open your map more.

2. **Early rotations** — If you're dying to zone, you're rotating too late. Leave your POI earlier.

3. **Path selection** — You probably ran through the open or into a contested area. Plan your path using natural cover.

**For storm surge:** If you're below threshold, you need to be tagging earlier. Don't wait until 30 seconds left — start shooting at 1:30.`;
  } else if (
    lowerSituation.includes("offspawn") ||
    lowerReason.includes("land") ||
    lowerReason.includes("drop") ||
    lowerReason.includes("contest")
  ) {
    analysis = `**Off-Spawn Death Detected**

You died in the early game. This is a preparation and decision-making issue.

1. **Landing route** — Your bus route matters. If you're contested and landing second, you're at a disadvantage.

2. **Weapon priority** — Don't fight with a gray pistol. Your first priority is getting a real weapon.

3. **Contested decision** — If someone else lands your spot, you have two choices: fight immediately with whatever you have, or loot fast and fight on your terms. Pick one and commit.

**Drill:** Land contested 10 games in a row. Don't care about placement. Focus on winning the POI fight. Learn the angles.`;
  } else if (
    lowerSituation.includes("endgame") ||
    lowerReason.includes("moving zone") ||
    lowerReason.includes("tarp") ||
    lowerReason.includes("tunnel")
  ) {
    analysis = `**Endgame Death Detected**

You died in late game. This is one of the hardest parts of Fortnite to master.

1. **Mat management** — Did you have mats? If not, you need to be farming more mid-game. Enter moving zones with 1500+ mats.

2. **Zone read** — Did you predict where zone was going? If you were running into zone, you were in a bad position.

3. **Height or low-ground?** — Know your role. If you don't have height, tunnel efficiently. If you do, protect it.

**Drill:** Play 20 zone wars games back-to-back. Focus on ONE thing: always being in a safe spot when zone moves.`;
  } else {
    // Generic analysis based on their weaknesses
    analysis = `**Death Analysis**

Based on your description: "${deathReason}"

Let me connect this to your skill profile. Your weakest areas are: ${weakestSkills.join(", ") || "not yet rated"}. 

**Questions to ask yourself:**
1. Could I have avoided this fight entirely?
2. Did I have the positioning advantage before engaging?
3. Was I playing too aggressive or too passive?
4. Did I have enough HP/mats/ammo to take this fight?

**General framework:** Every death in Fortnite is either:
- A mechanical mistake (aim, builds, edits)
- A decision mistake (wrong fight, wrong timing, wrong position)
- An information mistake (didn't know they were there)

Figure out which category this death falls into, and that tells you what to practice.`;
  }

  // Add mode-specific advice
  if (gameMode === "reload") {
    analysis += `\n\n**Reload-specific tip:** Reload is about fast, aggressive plays. If you died, were you being aggressive enough? Or did you push without your team?`;
  } else if (gameMode === "br") {
    analysis += `\n\n**BR-specific tip:** In BR solos, you can't rely on anyone. Every fight should be calculated. Ask: "Was this fight necessary, or did I ego-push?"`;
  }

  return analysis;
}

// GET vod notes for a profile
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
    return NextResponse.json({ notes: [] });
  }

  const notes = await db
    .select()
    .from(vodNotes)
    .where(eq(vodNotes.profileId, profileRows[0].id))
    .orderBy(desc(vodNotes.createdAt));

  return NextResponse.json({ notes });
}

// POST create a new vod note
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, gameMode, placement, elimsBeforeDeath, deathReason, situation, notes } = body;

  if (!sessionId || !deathReason) {
    return NextResponse.json(
      { error: "sessionId and deathReason required" },
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

  // Get skill ratings for context
  const ratings = await db
    .select()
    .from(weaknessRatings)
    .where(eq(weaknessRatings.profileId, profile.id));

  const skillRatings: SkillRating[] = ratings.map((r) => ({
    category: r.category,
    skill: r.skill,
    rating: r.rating,
  }));

  // Generate AI analysis
  const aiAnalysis = generateDeathAnalysis(
    deathReason,
    situation,
    notes,
    gameMode || "br",
    skillRatings
  );

  // Save the note
  const saved = await db
    .insert(vodNotes)
    .values({
      profileId: profile.id,
      gameMode: gameMode || "br",
      placement: placement || null,
      elimsBeforeDeath: elimsBeforeDeath || null,
      deathReason,
      situation: situation || null,
      notes: notes || null,
      aiAnalysis,
    })
    .returning();

  return NextResponse.json({ note: saved[0] });
}

// DELETE a vod note
export async function DELETE(req: NextRequest) {
  const noteId = req.nextUrl.searchParams.get("noteId");
  if (!noteId) {
    return NextResponse.json({ error: "noteId required" }, { status: 400 });
  }

  await db.delete(vodNotes).where(eq(vodNotes.id, noteId));
  return NextResponse.json({ success: true });
}
