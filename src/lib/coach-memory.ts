// ── Coach Memory Aggregator ──
// Pulls all relevant context for the AI coach from across the platform

import type { SkillRating, OnboardingData } from "./types";

export interface CoachMemory {
  recentMessages: { role: "user" | "assistant"; content: string; createdAt: string }[];
  lastSessionReview: {
    biggestMistake: string;
    whatWentWrong: string;
    focusLevel: string;
    mechanicalConsistency: string;
    decisionQuality: string;
    tiltLevel: number;
    when: string;
  } | null;
  recentDeaths: {
    deathReason: string;
    situation: string | null;
    notes: string | null;
    aiAnalysis: string | null;
    when: string;
  }[];
  deathPatterns: {
    commonSituations: string[];
    commonReasons: string[];
    commonMistakes: string[];
  };
  tournamentHistory: {
    name: string;
    mode: string;
    finalPlacement: number | null;
    prEarned: number | null;
    cashEarned: number | null;
    killsEarned: number | null;
    pointsEarned: number | null;
    completedAt: string | null;
  }[];
  rankHistory: { mode: string; rank: string; when: string }[];
  currentRatings: SkillRating[];
  weakestSkills: SkillRating[];
  strongestSkills: SkillRating[];
  overallAvg: number;
  rankTier: string;
  onboarding: OnboardingData | null;
}

// Build a compact "personal context" string the coach engine prepends to every prompt
export function buildCoachContextString(
  memory: CoachMemory,
  currentQuestion: string
): string {
  const lines: string[] = [];

  lines.push("=== COACH MEMORY (use this to make your answer specific) ===");

  if (memory.onboarding) {
    lines.push(
      `Player: ${memory.onboarding.epicName} • BR ${memory.onboarding.brRank} • Reload ${memory.onboarding.reloadRank} • ${memory.onboarding.inputDevice === "kbm" ? "KBM" : "Controller"} • ${memory.onboarding.playtimeHoursPerDay}h/day`
    );
    if (memory.onboarding.peakBrRank && memory.onboarding.peakBrRank !== memory.onboarding.brRank) {
      lines.push(`Peak BR: ${memory.onboarding.peakBrRank}`);
    }
    if (memory.onboarding.goals && memory.onboarding.goals.length > 0) {
      lines.push(`Goals: ${memory.onboarding.goals.join(", ")}`);
    }
  }

  if (memory.rankTier) {
    lines.push(`Rank tier: ${memory.rankTier}`);
  }

  if (memory.weakestSkills.length > 0) {
    const ws = memory.weakestSkills
      .slice(0, 3)
      .map((s) => `${s.skill} (${s.rating}/5)`)
      .join(", ");
    lines.push(`Weakest skills: ${ws}`);
  }

  if (memory.strongestSkills.length > 0) {
    const ss = memory.strongestSkills
      .slice(0, 3)
      .map((s) => `${s.skill} (${s.rating}/5)`)
      .join(", ");
    lines.push(`Strongest: ${ss}`);
  }

  if (memory.lastSessionReview) {
    const r = memory.lastSessionReview;
    lines.push(
      `Last session review (${r.focusLevel} focus, ${r.mechanicalConsistency} mechanics, ${r.decisionQuality} decisions, tilt ${r.tiltLevel}/5)`
    );
    if (r.biggestMistake) {
      lines.push(`• Biggest mistake to fix: "${r.biggestMistake}"`);
    }
    if (r.whatWentWrong) {
      lines.push(`• What went wrong: "${r.whatWentWrong}"`);
    }
  }

  if (memory.deathPatterns.commonMistakes.length > 0) {
    lines.push(
      `Recent death patterns: ${memory.deathPatterns.commonMistakes.slice(0, 3).join(" | ")}`
    );
  }

  if (memory.recentDeaths.length > 0) {
    lines.push(
      `Last death: "${memory.recentDeaths[0].deathReason}" (${memory.recentDeaths[0].situation || "unknown situation"})`
    );
  }

  if (memory.recentMessages.length > 0) {
    const lastAssistant = memory.recentMessages
      .filter((m) => m.role === "assistant")
      .slice(-3)
      .map((m) => m.content.slice(0, 120))
      .join(" | ");
    if (lastAssistant) {
      lines.push(`What you've already been told (don't repeat): ${lastAssistant}`);
    }
  }

  if (memory.tournamentHistory.length > 0) {
    const recent = memory.tournamentHistory.slice(0, 3);
    const stats = recent
      .map(
        (t) =>
          `${t.name}: #${t.finalPlacement ?? "—"}${t.prEarned ? ` (+${t.prEarned} PR)` : ""}`
      )
      .join(" | ");
    lines.push(`Recent tournaments: ${stats}`);
  }

  lines.push("=== END COACH MEMORY ===");
  lines.push("");
  lines.push("Player's question: " + currentQuestion);
  lines.push("");
  lines.push(
    "Instruction: Use the memory above to make your answer specific to THIS player. Don't repeat advice you've already given. Don't suggest drills for skills they already rate 4+ (unless they ask). Refer to their specific stats, history, and weaknesses."
  );

  return lines.join("\n");
}

// Detect "how do I get better at X" intent and resolve it to a specific skill
export interface PerSkillTarget {
  found: boolean;
  targetSkill: string | null;
  targetCategory: string | null;
  currentRating: number | null;
  weakestSubSkill: SkillRating | null;
  isStrength: boolean;
}

export function detectPerSkillQuestion(
  message: string,
  ratings: SkillRating[]
): PerSkillTarget {
  const lower = message.toLowerCase();
  const skillKeywords: Record<string, string> = {
    aim: "aim",
    aiming: "aim",
    accuracy: "aim",
    build: "mechanics",
    building: "mechanics",
    edit: "mechanics",
    editing: "mechanics",
    piece_control: "mechanics",
    box_fight: "fighting",
    fight: "fighting",
    fighting: "fighting",
    game_sense: "game-sense",
    rotations: "game-sense",
    end_game: "endgame",
    endgame: "endgame",
    off_spawn: "offspawn",
    offspawn: "offspawn",
  };

  let targetCategory: string | null = null;
  for (const [keyword, category] of Object.entries(skillKeywords)) {
    if (lower.includes(keyword)) {
      targetCategory = category;
      break;
    }
  }

  if (!targetCategory) {
    return {
      found: false,
      targetSkill: null,
      targetCategory: null,
      currentRating: null,
      weakestSubSkill: null,
      isStrength: false,
    };
  }

  // Find user's rating in this category
  const categoryRatings = ratings.filter((r) => r.category === targetCategory);
  const categoryAvg =
    categoryRatings.length > 0
      ? categoryRatings.reduce((sum, r) => sum + r.rating, 0) /
        categoryRatings.length
      : 0;

  // Find weakest sub-skill in this category
  const weakestSubSkill = categoryRatings.length > 0
    ? categoryRatings.reduce((min, r) => (r.rating < min.rating ? r : min))
    : null;

  const isStrength = categoryAvg >= 4;

  return {
    found: true,
    targetSkill: targetCategory,
    targetCategory,
    currentRating: categoryAvg,
    weakestSubSkill,
    isStrength,
  };
}

// Rank-tier knowledge for the AI coach
export function getRankTierContext(rank: string): string {
  const rankLower = rank.toLowerCase();
  if (rankLower.includes("unreal")) {
    return "UNREAL TIER: This player is top 0.1%. They need PRO-level advice. Focus on: piece control micro-optimizations, late-game fighting IQ, surge management, team sync precision, off-meta counter-strats, and avoiding TILT. Generic advice is insulting at this level. Speak to them like an equal pro player.";
  }
  if (rankLower.includes("champion")) {
    return "CHAMPION TIER: This player is approaching the top 1%. They need: piece control, late-game fighting, surge management, endgame tunneling, and 'diamond → champion' breakthrough strategies. They're good enough to understand technical detail but not yet consistent at the top level. They need COMP-level coaching, not beginner advice.";
  }
  if (rankLower.includes("diamond") || rankLower.includes("elite")) {
    return "DIAMOND/ELITE TIER: This player is above average but not yet elite. They need: late-game fighting IQ, rotation timing, surge tags (especially in stacked lobbies), smarter drop choice, and breaking through to Champion. Mechanics probably need polish more than fundamentals. Give specific scenarios, not generic advice.";
  }
  if (rankLower.includes("platinum")) {
    return "PLATINUM TIER: This player is mid-rank. Common issues: no high ground in endgame, missed surge tags, piece control gaps, bad rotates, fighting before you have advantage. Focus on FUNDAMENTALS (surge, rotation, mid-game positioning) before fancy mechanics.";
  }
  if (rankLower.includes("gold") || rankLower.includes("silver")) {
    return "GOLD/SILVER TIER: This player is still learning the game. They need to MASTER basics: positioning, storm surge, when to fight vs when to avoid fights, loot priority, and end-game tarp/tunnel. They probably take too many fights. Focus on PLACEMENT and SURVIVAL before kills.";
  }
  if (rankLower.includes("bronze")) {
    return "BRONZE TIER: Beginner player. Focus entirely on basics: don't engage early game, learn to build a wall, learn the storm surge mechanic, play for top 10, not kills. Everything else is secondary.";
  }
  return "UNRANKED: Treat as beginner. Focus on fundamental positioning and survival.";
}
