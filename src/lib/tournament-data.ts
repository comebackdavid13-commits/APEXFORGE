// ── Ranked Cups running in Chapter 7 Season 3 ──
// Times shown in user's LOCAL timezone via browser
// Updated: July 29, 2026

export interface RankedCup {
  id: string;
  name: string;
  mode: "solo" | "duo" | "trio" | "squad";
  region: string;
  displayDate: string;
  timeLocal: string;
  type: "ranked-cup";
  opportunities: string; // e.g. "Play 1 match to qualify for finals next week"
}

export function getUpcomingRankedCups(): RankedCup[] {
  // Weekly Thursday cups — 19:00 local time
  // This data models the actual seasonal ranked cup structure
  const now = new Date();
  const upcoming: RankedCup[] = [];

  // Calculate next Thursday (or today if it's Thursday)
  const thursday = new Date(now);
  const daysUntilThursday = (4 - now.getDay() + 7) % 7;
  thursday.setDate(now.getDate() + daysUntilThursday);

  // Format in user's local timezone
  const formatLocal = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // Generate next 4 weeks of ranked cups
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const cupDate = new Date(thursday);
    cupDate.setDate(thursday.getDate() + weekOffset * 7);
    cupDate.setHours(19, 0, 0, 0);

    // Add regions based on user's timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const regionGuess =
      /America|New_York|Chicago|Los_Angeles|Denver|Mexico/.test(timeZone)
        ? "NA"
        : /Europe|London|Berlin|Paris/.test(timeZone)
        ? "EU"
        : /Asia|Tokyo|Singapore|Sydney/.test(timeZone)
        ? "OCE/ASIA"
        : "NA/EU/OCE";

    upcoming.push({
      id: `solo-cup-${weekOffset}`,
      name: "Solo Victory Cup",
      mode: "solo",
      region: regionGuess,
      displayDate: formatLocal(cupDate),
      timeLocal: formatTime(cupDate),
      type: "ranked-cup",
      opportunities: "Victory Royale = instant prize. Top 10 = points qualification.",
    });

    upcoming.push({
      id: `duo-cup-${weekOffset}`,
      name: "Duo Cash Cup",
      mode: "duo",
      region: regionGuess,
      displayDate: formatLocal(cupDate),
      timeLocal: formatTime(cupDate),
      type: "ranked-cup",
      opportunities: "Cash prize for top placements. Perfect for grinding duo sync.",
    });

    upcoming.push({
      id: `squad-cup-${weekOffset}`,
      name: "Squad Showdown",
      mode: "squad",
      region: regionGuess,
      displayDate: formatLocal(cupDate),
      timeLocal: formatTime(cupDate),
      type: "ranked-cup",
      opportunities: "Chill squad practice — ideal for testing new rosters.",
    });

    upcoming.push({
      id: `zb-cup-${weekOffset}`,
      name: "Zero Build Duo Cup",
      mode: "duo",
      region: regionGuess,
      displayDate: formatLocal(cupDate),
      timeLocal: formatTime(cupDate),
      type: "ranked-cup",
      opportunities: "No building — pure fighting IQ. Great for overloaded mechs players.",
    });
  }

  return upcoming;
}

// Custom tournament saved formats
export interface PrepContext {
  mode: string;
  date: string;
  targetPlacement: number;
  notes?: string;
}

export const prepGuides: Record<string, { focus: string; tips: string[] }> = {
  solo: {
    focus: "Endgame consistency, 1v2 clutch potential, mat conservation",
    tips: [
      "Play for top 10 every game — one 15th is better than three 50ths",
      "Master the 'box and shoot from floor' clutch for 1v2s",
      "Spend at least 30% of practice games perfecting off-spawn fights",
      "Have your drop 100% mapped — know your chest path before the tourney",
    ],
  },
  duo: {
    focus: "Duo sync, revive timing, surge management",
    tips: [
      "Designate IGL before tournament — one voice on comms",
      "Practice surge tags in stacked lobbies: pre-peek + 30 damage window",
      "Both players should carry 1 Mobility + 1 Heal item minimum",
      "Practice 'reset and peek' mechanics: 20-second revive scrambles",
    ],
  },
  trio: {
    focus: "Elevator timing, triangle formation, third-party awareness",
    tips: [
      "Entry + Support + Anchor — every trio fight should look structured",
      "Practice 3-person tunnel-bumps when rotating together",
      "Split loot priority: entry gets shields, anchor gets ammo/support",
    ],
  },
  squad: {
    focus: "Unit discipline, revive priority, crossfire setup",
    tips: [
      "Two pairs moving together beats four players solo-looting",
      "Practice revive-no-revive calls in 1vX moments",
      "Everyone should carry 1 mobility item — never be the reason the squad is slow",
      "Practice aura farming to maximize aura (AKA storm surge tags)",
    ],
  },
  general: {
    focus: "Timing, consistency, mental prep",
    tips: [
      "Sleep 8 hours the night before — performance drops dramatically if tired",
      "Do a full 30-min tourney warmup Morning Of, not 30 minutes before",
      "Have your energy drink/food ready BEFORE the tourney starts",
      "No ranked queues 2 hours before — save your mental energy",
      "During games: 30 seconds after each game to breathe, don't queue tilt",
    ],
  },
};
