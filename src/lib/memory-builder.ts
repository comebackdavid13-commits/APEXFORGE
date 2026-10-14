// Build CoachMemory from raw DB rows. Kept separate from DB types
// so it can be used client-side or server-side interchangeably.

import type { OnboardingData, SkillRating } from "./types";
import type { CoachMemory } from "./coach-memory";

export type { CoachMemory };

export interface MemoryInput {
  onboarding: OnboardingData | null;
  ratings: SkillRating[];
  recentMessages: { role: "user" | "assistant"; content: string; createdAt: string }[];
  lastSessionReview: CoachMemory["lastSessionReview"];
  recentDeaths: CoachMemory["recentDeaths"];
  tournaments: CoachMemory["tournamentHistory"];
  rankHistory: CoachMemory["rankHistory"];
}

export function buildCoachMemory(input: MemoryInput): CoachMemory {
  // Sort skills by rating to find weakest/strongest
  const sortedSkills = [...input.ratings].sort((a, b) => a.rating - b.rating);
  const weakestSkills = sortedSkills.slice(0, 5);
  const strongestSkills = [...sortedSkills].reverse().slice(0, 5);
  const overallAvg =
    input.ratings.length > 0
      ? input.ratings.reduce((s, r) => s + r.rating, 0) / input.ratings.length
      : 0;

  // Determine current rank tier
  const brRank = input.onboarding?.brRank || "Unranked";
  const rankTier = brRank;

  // Reverse messages to chronological order (oldest first)
  const messages = [...input.recentMessages].reverse();

  // Death patterns: cluster similar reasons
  const reasonCounts: Record<string, number> = {};
  const situationCounts: Record<string, number> = {};
  for (const d of input.recentDeaths) {
    if (d.deathReason) {
      const key = d.deathReason.toLowerCase().slice(0, 30);
      reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    }
    if (d.situation) {
      situationCounts[d.situation] = (situationCounts[d.situation] || 0) + 1;
    }
  }
  const commonMistakes = Object.entries(reasonCounts)
    .filter(([, c]) => c >= 2)
    .sort(([, a], [, b]) => b - a)
    .map(([reason]) => reason);
  const commonSituations = Object.entries(situationCounts)
    .filter(([, c]) => c >= 2)
    .sort(([, a], [, b]) => b - a)
    .map(([s]) => s);

  return {
    recentMessages: messages,
    lastSessionReview: input.lastSessionReview,
    recentDeaths: input.recentDeaths,
    deathPatterns: {
      commonMistakes,
      commonSituations,
      commonReasons: commonMistakes,
    },
    tournamentHistory: input.tournaments.filter(
      (t) => t.completedAt !== null
    ),
    rankHistory: input.rankHistory,
    currentRatings: input.ratings,
    weakestSkills,
    strongestSkills,
    overallAvg,
    rankTier,
    onboarding: input.onboarding,
  };
}
