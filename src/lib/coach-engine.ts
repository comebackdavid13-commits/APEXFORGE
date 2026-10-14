import type { SkillRating, OnboardingData } from "./types";
import {
  buildCoachContextString,
  detectPerSkillQuestion,
  getRankTierContext,
  type CoachMemory,
} from "./coach-memory";

// ══════════════════════════════════════════════════════════════════════════════
// ELITE AI COACH ENGINE — CHAPTER 7 SEASON 3 "RUNNERS" KNOWLEDGE
// Now with: full memory, per-skill routing, rank-tier context, meta awareness
// Last updated: July 2025
// ══════════════════════════════════════════════════════════════════════════════

interface CoachContext {
  onboarding: OnboardingData;
  ratings: SkillRating[];
  planGenerated: boolean;
  memory?: CoachMemory | null;
}

const greetings = [
  "Listen up.",
  "Alright, let's get into it.",
  "Good question.",
  "Here's the truth.",
  "I'm going to be direct with you.",
  "Let me break this down.",
];

const closings = [
  "Now go put in the work.",
  "Trust the process. Execute.",
  "Stop overthinking. Start doing.",
  "That's the difference between good and great.",
  "This is what separates pros from content creators.",
  "Remember: deliberate practice, not just playing games.",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeakestAreas(ratings: SkillRating[]): string[] {
  const sorted = [...ratings].sort((a, b) => a.rating - b.rating);
  return sorted.slice(0, 3).map((r) => r.skill);
}

function getStrongestAreas(ratings: SkillRating[]): string[] {
  const sorted = [...ratings].sort((a, b) => b.rating - a.rating);
  return sorted.slice(0, 3).map((r) => r.skill);
}

const topicResponses: Record<string, (ctx: CoachContext) => string> = {
  aim: (ctx) => {
    const device = ctx.onboarding.inputDevice;
    if (device === "controller") {
      return `${getRandomItem(greetings)} Your aim on controller comes down to three things: sensitivity optimization, right-stick micro-adjustments, and positioning yourself at the right range.

Here's what I want you to do:
1. **Sensitivity check** — Go into Skaavok aim trainer and test your tracking. If you're overshooting, drop your look sensitivity by 2-3%. If undershooting, bump it up.
2. **Range management** — Controller excels at 15-30m tracking. Stop taking 50/50 shotgun fights when you can beam at mid-range.
3. **Pre-aim everything** — Before you edit, before you peek, your crosshair should already be where the enemy's head will be.

The players who beam consistently aren't more talented — they just have better habits. Build those habits in creative for 20 minutes before every session. ${getRandomItem(closings)}`;
    }
    return `${getRandomItem(greetings)} KBM aim is about precision and consistency. Here's your framework:

1. **Kovaak's or Aim Lab** — 15 min daily. Focus on: Smoothbot (tracking), Pasu (flicking), and 1wall6targets (speed).
2. **In-game crosshair placement** — 80% of aim is positioning your crosshair BEFORE the fight starts. Pre-aim every angle.
3. **Shotgun flicks** — Go into a shotgun aim duel map and do 100 kills focused on ONE thing: first-shot accuracy. Don't spray, don't panic.

Your mouse grip and posture matter more than you think. Consistent arm position = consistent aim. ${getRandomItem(closings)}`;
  },

  building: (ctx) => {
    return `${getRandomItem(greetings)} Building separates Fortnite from every other BR. Here's the hierarchy:

**Speed means nothing without purpose.** I see players who can crank 90s at light speed but can't hold a wall in a real fight. That's backwards.

Focus in this order:
1. **Piece control** — This is THE most important mechanical skill. If you can take someone's wall, place a ramp in their box, and edit for a shot — you win 90% of fights. Practice in piece control maps 20 min/day.
2. **Protected builds** — Every build you place should have a purpose. Never build without immediately covering yourself.
3. **Edit plays** — Speed comes with repetition. Do Raider's edit course once daily. Time yourself. Beat your time by 1 second each week.

${ctx.onboarding.inputDevice === "controller" ? "On controller, use Builder Pro and make sure your instant builds are dialed in. Consider custom binds for edits." : "On KBM, make sure your edit key is easily accessible — many pros use F or a mouse button. Your edit confirm should be instant."}

${getRandomItem(closings)}`;
  },

  positioning: (ctx) => {
    return `${getRandomItem(greetings)} Positioning is the highest-leverage skill in Fortnite. It's the reason pros survive with 200 HP while ranked warriors die with full shield.

**The Golden Rules:**
1. **Never be in the open** — If you're rotating and you're exposed for more than 2 seconds, you're doing it wrong.
2. **Play the edge of zone** — Not center (too many angles), not outside (forced rotations). The edge gives you one side to worry about.
3. **Height = information** — Being high doesn't just give you shots, it gives you KNOWLEDGE of where enemies are.
4. **Natural cover first** — Don't burn mats when a hill or building does the same job.

Watch how Bugha or Mero position in FNCS. They're never in bad spots because they're planning 2 zones ahead. That's what separates ${ctx.onboarding.reloadRank || "your rank"} from Champion.

${getRandomItem(closings)}`;
  },

  endgame: (ctx) => {
    return `${getRandomItem(greetings)} Endgame is where tournaments are won and lost. Here's the framework:

**Zones 5-7 (Half & Half):**
- Identify your rotation path BEFORE zone starts moving
- Have 1500+ mats minimum entering moving zones
- Get height if you can take it uncontested, otherwise low-ground tarp

**Zones 7-9 (Moving Zones):**
- TARP, don't turtle. A tarp protects you AND lets you move.
- Tunnel on low ground if height is taken — it's safer than fighting for height late
- Conservation mode: every mat counts, every shot should be for damage or to claim space

**Final Zone:**
- This is where you need to be DECISIVE. Hesitation kills.
- Know your HP, know your mats, know where enemies are
- If you have height, play it. If you don't, find the gap and make your play.

Practice moving zones in creative zone wars. Do at least 10 games per session. ${getRandomItem(closings)}`;
  },

  mentality: (ctx) => {
    return `${getRandomItem(greetings)} Mental game is the multiplier on everything else. A tilted pro plays worse than a focused ranked grinder.

**The Pro Mindset Framework:**
1. **Process over results** — Don't care if you won or lost. Ask: "Did I execute my plan?" That's the only metric that matters.
2. **One thing per game** — Before queuing, pick ONE thing to focus on. Not five, not "play better." ONE specific skill.
3. **Tilt management** — When you feel yourself getting frustrated, that's your signal to take a 5-minute break. Walk away from the screen. Drink water. Come back focused.
4. **Review, don't rage** — Every death is data. Save the clip, watch it later. What went wrong? What was the right play?

The best players in the world lose constantly. The difference is they extract a lesson from every L.

With ${ctx.onboarding.playtimeHoursPerDay}h/day, you have ${ctx.onboarding.playtimeHoursPerDay >= 4 ? "plenty of time to grind — but quality matters more than quantity. Better to do 3 focused hours than 6 zombie hours." : "limited time — so every minute needs to count. No autopilot sessions. Every game has a purpose."}

${getRandomItem(closings)}`;
  },

  improvement: (ctx) => {
    const weakest = getWeakestAreas(ctx.ratings);
    const strongest = getStrongestAreas(ctx.ratings);
    return `${getRandomItem(greetings)} Based on your profile, here's your honest assessment:

**Your strengths:** ${strongest.join(", ")}. These are solid — maintain them but don't over-invest here.

**Your critical weaknesses:** ${weakest.join(", ")}. This is where 80% of your practice time should go. These are bleeding you ELO every single game.

**The 80/20 Rule of Improvement:**
- 80% of your gains will come from fixing your top 2-3 weaknesses
- Spend your creative time SPECIFICALLY on these skills
- In ranked, CONSCIOUSLY practice these — don't just autopilot

**Your Rank Trajectory:**
From ${ctx.onboarding.brRank || "your current rank"} to the next tier, the bottleneck is ${weakest[0]}. Fix that, and you'll see immediate results.

I want you to track your progress weekly. Rate your weaknesses every Sunday. If the numbers aren't moving, your practice isn't deliberate enough.

${getRandomItem(closings)}`;
  },

  meta: (ctx) => {
    const device = ctx.onboarding.inputDevice;
    return `${getRandomItem(greetings)} Let's talk Chapter 7 Season 3 meta on Shattered Coast.

**The S-Tier Loadout Right Now:**
1. **Striker Pump Shotgun** — The king. 201 headshot at legendary. Fast pullout. Non-negotiable.
2. **Surgical Burst Rifle** — Zero bloom, clean tracking. Best AR in the game right now.
3. **Flex SMG** — Hip fire for close range spray, ADS for mid-range laser. Very versatile.
4. **Overdrive Grenades** — Mobility is key this season. These get you out of bad spots.
5. **Heals + Utility** — Med Kits are best value. Rift-to-Go if you find one.

**What to AVOID:**
- Lancehead Pistol (including Mythic Baba Yaga) — Waste of a slot
- Business Turret — You're a sitting duck
- Chaos Exploder Rifle — Got nerfed hard, not worth it anymore

${device === "controller" 
? "**Controller tip:** The Flex SMG is INSANE with aim assist. ADS at mid-range and beam people. Also, the Surgical Burst rewards controller tracking — tap fire for accuracy."
: "**KBM tip:** Striker Pump rewards your flick shots. The Surgical Burst has zero bloom so abuse quick peeks. Hip-fire the Flex SMG up close for movement speed."}

The meta rewards aggressive players who can hit their shots. Get your loadout, push fights, and don't let people heal. ${getRandomItem(closings)}`;
  },

  drops: (ctx) => {
    return `${getRandomItem(greetings)} Shattered Coast drop spots — here's the breakdown:

**For Ranked/Safe Games:**
- **Sunken Shores** — South edge, LOW contest, solid loot. Rotate early along coast.
- **Chopped Shop** — Southwest, grab a vehicle, barely anyone lands here.
- **Cluster Coast** — Southeast, Runners-themed, underrated spot.

**Balanced Drops:**
- **Latte Landing** — Kept its position from last season. Familiar, solid loot, medium traffic.
- **Heatwave Harbor** — EXCELLENT for squads. Lighthouse rally point, port has vehicles.
- **Golden Grove** — East side, good central rotation options.

**Hot Drops (Practice Only):**
- **Zero Point** — Center map, best loot, EVERYONE lands here. Not for ranked.
- **Sinister Strip** — High traffic, Dark Voyager's POI. Expect fights.

**Pro Tip:** Your drop should match your goal for the session.
- Grinding for points? Sunken Shores or Chopped Shop.
- Practicing fights? Zero Point or Sinister Strip.
- Balanced game? Latte Landing or Heatwave Harbor.

${getRandomItem(closings)}`;
  },

  warmup: (ctx) => {
    const device = ctx.onboarding.inputDevice;
    return `${getRandomItem(greetings)} Your warm-up routine is the difference between losing your first 3 games and winning them.

**The Non-Negotiable Routine (20 min):**

1. **Free Build (4 min)** — 90s, tunnels, retakes. Get your fingers moving. Don't think, just build.

2. **Edit Course (4 min)** — Raider's or BFC course. Time yourself. Try to beat your record.
   - Map code: 7562-1598-0199

3. **Aim Training (5 min)** — Skaavok aim trainer. Do Tile Frenzy + Tracking + Flick modes.
   - Map code: 8022-6842-4965

4. **Box Fights (5 min)** — 1v1 against real players. Focus on CLEAN plays, not just winning.
   - Map code: 7620-0771-9529

5. **Piece Control (2 min)** — Quick piece control drills to warm up your fight IQ.
   - Map code: 5765-2565-4462

${device === "controller" 
? "**Controller focus:** Spend extra time on aim training. Your tracking is your superpower — make sure it's warmed up."
: "**KBM focus:** Spend extra time on edit courses. Your edit speed is your edge — don't go into ranked with cold fingers."}

**The rule:** Never queue ranked cold. Your first game sets your mental state for the session. ${getRandomItem(closings)}`;
  },

  tournament: (ctx) => {
    return `${getRandomItem(greetings)} Tournament mentality is completely different from ranked. Here's how to approach it:

**Pre-Tournament (Day Before):**
- Get 8 hours of sleep. Non-negotiable.
- Review your drop spot and have a backup.
- Know the format: points per kill, points per placement, number of games.

**Tournament Day:**
- Full warm-up routine (30 min minimum)
- Eat before you play. Hungry = unfocused.
- No ranked before the tourney — save your mental energy.

**During Games:**
- First 2-3 games: Play for placement, don't force fights
- Mid-tournament: If you need kills for points, take calculated fights
- Last games: If you need a big pop-off, play aggressive

**The Mindset Shift:**
In ranked, you can queue again instantly. In tourneys, every game matters.
- Don't throw a good game for a 50/50 fight
- Placement points are CONSISTENT. Kill points are VOLATILE.
- Top 10 every game > One 15-kill game and four 50th places

**Post-Game Routine:**
- After each game: 30 seconds to note one thing you did well, one mistake
- Don't dwell on bad games. Queue up. Reset.

${getRandomItem(closings)}`;
  },
};

function detectTopic(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("aim") || lower.includes("tracking") || lower.includes("flick") || lower.includes("shotgun") || lower.includes("crosshair")) return "aim";
  if (lower.includes("build") || lower.includes("edit") || lower.includes("piece control") || lower.includes("crank") || lower.includes("retake")) return "building";
  if (lower.includes("position") || lower.includes("rotat") || lower.includes("game sense") || lower.includes("macro")) return "positioning";
  if (lower.includes("endgame") || lower.includes("end game") || lower.includes("moving zone") || lower.includes("tarp") || lower.includes("tunnel") || lower.includes("late game")) return "endgame";
  if (lower.includes("mental") || lower.includes("tilt") || lower.includes("mindset") || lower.includes("motivat") || lower.includes("frustrated") || lower.includes("stuck") || lower.includes("focus")) return "mentality";
  if (lower.includes("meta") || lower.includes("loadout") || lower.includes("weapon") || lower.includes("gun") || lower.includes("striker") || lower.includes("pump") || lower.includes("smg") || lower.includes("ar") || lower.includes("burst")) return "meta";
  if (lower.includes("drop") || lower.includes("land") || lower.includes("poi") || lower.includes("spot") || lower.includes("shattered") || lower.includes("coast") || lower.includes("map")) return "drops";
  if (lower.includes("warm") || lower.includes("routine") || lower.includes("practice") || lower.includes("creative") || lower.includes("before") || lower.includes("train")) return "warmup";
  if (lower.includes("tourna") || lower.includes("scrim") || lower.includes("cash cup") || lower.includes("fncs") || lower.includes("compete") || lower.includes("comp")) return "tournament";
  if (lower.includes("improv") || lower.includes("rank up") || lower.includes("progress") || lower.includes("better") || lower.includes("weakness") || lower.includes("plan")) return "improvement";
  return "improvement"; // default
}

export function generateCoachResponse(message: string, context: CoachContext): string {
  // ── Build memory-enriched context (or fall back if missing) ──
  const memory = context.memory;
  const onboarding = context.onboarding;
  const ratings = context.ratings;

  // Per-skill routing detection
  const skillRoute = detectPerSkillQuestion(message, ratings);

  // Rank tier context
  const rankTier = onboarding
    ? getRankTierContext(
        (onboarding.brRank || "Unranked") as string
      )
    : "UNRANKED: Treat as beginner.";

  // Find the right topic
  const topic = detectTopic(message);
  const handler = topicResponses[topic] || topicResponses["improvement"];
  let baseResponse = handler(context);

  // ── Layer 1: Inject memory context intro (always) ──
  if (memory) {
    // If the response doesn't already reference the player's specifics, prepend a personal touch
    const isGeneric = !/your|you('re| are| should| need)|let's|here|this/i.test(
      baseResponse.slice(0, 200)
    );
    if (isGeneric) {
      // Find weakest skill mentioned in response, connect to their profile
      const weakest =
        memory.weakestSkills.length > 0 ? memory.weakestSkills[0].skill : null;
      if (weakest) {
        baseResponse = `Looking at your profile — ${weakest} is your biggest gap (rated ${memory.weakestSkills[0].rating}/5). Here's my take:\n\n${baseResponse}`;
      }
    }
  }

  // ── Layer 2: Per-skill question routing ──
  if (skillRoute.found && skillRoute.weakestSubSkill) {
    const sub = skillRoute.weakestSubSkill;
    const skillName = sub.skill.replace(/-/g, " ");
    const tier = getRankTierContext(onboarding?.brRank || "Gold");
    const intro = skillRoute.isStrength
      ? `Your ${skillName} is actually a STRENGTH (avg ${(skillRoute.currentRating || 0).toFixed(1)}/5) — but you specifically asked about it. Let me look at the gap anyway:`
      : `Your ${skillName} rating is ${(skillRoute.currentRating || 0).toFixed(1)}/5, and your weakest sub-skill is "${skillName}" at ${sub.rating}/5. The fix has to be laser-targeted at THAT gap.`;

    // Prepend a personal "I see you, I know you" intro
    baseResponse = `${intro}\n\n${baseResponse}`;
  }

  // ── Layer 3: Rank-tier anchoring (when advice is generic) ──
  const genericTells = ["practice", "drill", "consistent", "improve", "focus", "be better"];
  const feelsGeneric = genericTells.some((t) =>
    baseResponse.toLowerCase().startsWith(t)
  );
  if (feelsGeneric && rankTier) {
    // Embed a rank-specific tip near the start
    const rankSpecificInjection = rankTier.split(":")[1]?.split(".")[0] || "";
    if (rankSpecificInjection) {
      baseResponse = `${baseResponse}\n\n**For your rank specifically:** ${rankSpecificInjection.trim()}.`;
    }
  }

  // ── Layer 4: Tournament breakdown (Feature S) ──
  if (
    memory?.tournamentHistory &&
    memory.tournamentHistory.length > 0 &&
    /tournament|placement|games? in the|game-by-game|round 1|round 2|early|mid|late/i.test(
      message.toLowerCase()
    )
  ) {
    const tourneys = memory.tournamentHistory.slice(0, 3);
    const summary = tourneys
      .map(
        (t) =>
          `• ${t.name} (#${t.finalPlacement ?? "—"}${t.killsEarned ? `, ${t.killsEarned} kills` : ""}${t.prEarned ? `, +${t.prEarned} PR` : ""}${t.cashEarned ? `, $${(t.cashEarned / 100).toFixed(2)}` : ""})`
      )
      .join("\n");

    baseResponse = `Looking at your recent tournament data:\n\n${summary}\n\n${baseResponse}\n\n**Pattern analysis:** The AI would normally analyze this further with more game-by-game stats, but you can already see placement trends. Submit game-by-game logs to unlock deeper breakdowns.`;
  }

  return baseResponse;
}

export function getInitialCoachMessage(context: CoachContext): string {
  const weakest = getWeakestAreas(context.ratings);
  return `Welcome to ApexForge, ${context.onboarding.epicName || "player"}. I'm your personal AI coach, and I don't sugarcoat anything.

**Chapter 7 Season 3 — Shattered Coast is LIVE.** New map, new meta. The Striker Pump and Surgical Burst are S-tier right now.

I've analyzed your profile. You're at ${context.onboarding.brRank || "unknown rank"} in BR, ${context.onboarding.reloadRank || "unknown rank"} in Reload, playing on ${context.onboarding.inputDevice === "kbm" ? "keyboard & mouse" : "controller"} with ${context.onboarding.playtimeHoursPerDay}h/day available.

**Your biggest gaps:** ${weakest.join(", ")}. Your training plan is tailored to fix these.

Ask me about:
• **Aim, builds, edits, game sense** — I'll break it down
• **Current meta & loadouts** — What to run in Season 3
• **Drop spots** — Best POIs on Shattered Coast
• **Warm-up routines** — How to start your sessions
• **Tournament prep** — Competitive mindset

No fluff. Just actionable coaching. What's on your mind?`;
}
