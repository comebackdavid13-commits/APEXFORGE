import type { SkillRating, TrainingPlan, DayPlan, OnboardingData } from "./types";

// ── Creative map codes for different drill types ──
const creativeMaps: Record<string, { code: string; name: string; desc: string }[]> = {
  mechanics: [
    { code: "5765-2565-4462", name: "Raider's Box Fight Practice", desc: "Practice piece control and edit plays in a controlled box fight setting" },
    { code: "7562-1598-0199", name: "BFC Edit Course", desc: "Speed-focused edit course for building muscle memory" },
    { code: "9124-5509-6523", name: "Retake Practice v3", desc: "Drill height retakes against walls and ramps" },
  ],
  aim: [
    { code: "8022-6842-4965", name: "Skaavok Aim Trainer", desc: "Comprehensive aim training with tracking, flicking, and reaction drills" },
    { code: "6531-5731-2148", name: "Shotgun Aim Duel", desc: "Practice close-range shotgun flicks and tracking" },
    { code: "3024-8510-2247", name: "AR Beam Trainer", desc: "Mid-range tracking practice with moving targets" },
  ],
  fighting: [
    { code: "7620-0771-9529", name: "Box Fight 1v1", desc: "Realistic box fight practice against opponents" },
    { code: "6562-8953-6567", name: "Zone Wars - Moving Zones", desc: "Practice fighting in moving zone scenarios" },
    { code: "3412-1243-4321", name: "Realistic 1v1 Fights", desc: "Full 1v1 build fights with realistic loadouts" },
  ],
  "game-sense": [
    { code: "6562-8953-6567", name: "Zone Wars Classic", desc: "Practice rotations and positioning in moving zones" },
    { code: "4587-3213-6789", name: "Storm Surge Simulator", desc: "Practice getting tags in stacked lobby simulations" },
  ],
  endgame: [
    { code: "6562-8953-6567", name: "Stacked Endgame Practice", desc: "Moving zone practice with tarp and tunnel drills" },
    { code: "8764-3241-5678", name: "Tunnel & Tarp Course", desc: "Learn efficient tunneling and tarping techniques" },
  ],
  offspawn: [
    { code: "7620-0771-9529", name: "Offspawn Fight Simulator", desc: "Practice contested landing fights with limited loot" },
    { code: "5521-8976-3214", name: "Quick Loot Race", desc: "Optimize your looting speed and routing" },
  ],
};

function getWeakestCategories(ratings: SkillRating[]): string[] {
  const categoryAvgs: Record<string, { total: number; count: number }> = {};
  for (const r of ratings) {
    if (!categoryAvgs[r.category]) categoryAvgs[r.category] = { total: 0, count: 0 };
    categoryAvgs[r.category].total += r.rating;
    categoryAvgs[r.category].count += 1;
  }
  return Object.entries(categoryAvgs)
    .map(([cat, data]) => ({ category: cat, avg: data.total / data.count }))
    .sort((a, b) => a.avg - b.avg)
    .map((x) => x.category);
}

function getWeakestSkills(ratings: SkillRating[]): SkillRating[] {
  return [...ratings].sort((a, b) => a.rating - b.rating).slice(0, 8);
}

export function generateTrainingPlan(
  onboarding: OnboardingData,
  ratings: SkillRating[]
): TrainingPlan {
  // Guard: if no ratings provided, synthesize neutral defaults so plan ALWAYS generates
  const safeRatings: SkillRating[] =
    ratings.length > 0
      ? ratings
      : [
          { category: "mechanics", skill: "building-speed", rating: 3 },
          { category: "aim", skill: "ar-tracking", rating: 3 },
          { category: "fighting", skill: "box-fighting", rating: 3 },
          { category: "game-sense", skill: "zone-rotations", rating: 3 },
          { category: "endgame", skill: "tarping", rating: 3 },
        ];

  const weakestCats = getWeakestCategories(safeRatings);
  const weakestSkills = getWeakestSkills(safeRatings);
  const hoursPerDay = Math.max(1, onboarding.playtimeHoursPerDay || 2);
  const daysPerWeek = Math.min(7, Math.max(1, onboarding.playtimeDaysPerWeek || 5));
  const isController = onboarding.inputDevice === "controller";

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const activeDays = dayNames.slice(0, daysPerWeek);

  const dailyPlans: DayPlan[] = activeDays.map((day, idx) => {
    const focusIdx = idx % weakestCats.length;
    const focusCat = weakestCats[focusIdx];
    const maps = creativeMaps[focusCat] || creativeMaps["mechanics"];
    const mapChoice = maps[idx % maps.length];

    const sessions = [];

    // Warmup (always)
    sessions.push({
      type: "warmup" as const,
      title: isController ? "Controller Warm-Up Routine" : "KBM Warm-Up Routine",
      duration: hoursPerDay >= 3 ? "20 min" : "15 min",
      description: isController
        ? "Free build for 5 min, edit courses for 5 min, then Skaavok aim trainer focusing on tracking with aim assist optimization"
        : "Free build for 5 min, Mongraal classic edit course, then Skaavok aim trainer focusing on flick shots and micro-adjustments",
    });

    // Creative drill (primary weakness)
    sessions.push({
      type: "creative" as const,
      title: mapChoice.name,
      duration: hoursPerDay >= 4 ? "45 min" : hoursPerDay >= 2 ? "30 min" : "20 min",
      description: mapChoice.desc,
      mapCode: mapChoice.code,
    });

    // Additional creative for longer sessions
    if (hoursPerDay >= 3) {
      const secondaryCat = weakestCats[(focusIdx + 1) % weakestCats.length];
      const secMaps = creativeMaps[secondaryCat] || creativeMaps["aim"];
      const secMap = secMaps[idx % secMaps.length];
      sessions.push({
        type: "creative" as const,
        title: secMap.name,
        duration: "20 min",
        description: secMap.desc,
        mapCode: secMap.code,
      });
    }

    // Ranked play
    if (idx % 3 !== 2 || hoursPerDay >= 3) {
      const rankedMode = idx % 2 === 0 ? "Ranked BR" : "Ranked Reload";
      sessions.push({
        type: "ranked" as const,
        title: `${rankedMode} — Focused Session`,
        duration: hoursPerDay >= 4 ? "90 min" : hoursPerDay >= 2 ? "60 min" : "30 min",
        description: `Play ${rankedMode} with a specific focus: ${
          weakestSkills[idx % weakestSkills.length]?.skill || "overall improvement"
        }. After each game, take 30 seconds to note what you did well and one mistake.`,
      });
    }

    // VOD review (every other day or on shorter days)
    if (idx % 2 === 1 || idx === activeDays.length - 1) {
      sessions.push({
        type: "vod" as const,
        title: "VOD Review Session",
        duration: hoursPerDay >= 3 ? "20 min" : "15 min",
        description: `Review your last 2-3 games. Focus specifically on your ${focusCat} decisions. Pause at every death and ask: 'What could I have done differently?' Note patterns in your mistakes.`,
      });
    }

    // Workshop on weekends
    if (idx >= 5) {
      sessions.push({
        type: "workshop" as const,
        title: "Pro VOD Study",
        duration: "30 min",
        description:
          "Watch a recent FNCS or tournament VOD from a top player. Focus on their rotations, positioning, and decision-making. Take notes on 3 things you can implement.",
      });
    }

    return {
      day,
      focus: focusCat.charAt(0).toUpperCase() + focusCat.slice(1).replace("-", " "),
      sessions,
    };
  });

  // Add rest days
  const restDays = dayNames.slice(daysPerWeek);
  for (const day of restDays) {
    dailyPlans.push({
      day,
      focus: "Recovery",
      sessions: [
        {
          type: "rest" as const,
          title: "Active Rest Day",
          duration: "Optional",
          description:
            "Rest your hands and mind. If you play, keep it casual — no ranked, no tryhard creative. Consider stretching your wrists and reviewing your weekly notes.",
        },
      ],
    });
  }

  const tips = [
    `As a ${isController ? "controller" : "KBM"} player, focus on ${
      isController ? "maximizing aim assist with right-stick micro-adjustments" : "building your edit muscle memory through repetition"
    }.`,
    `At ${onboarding.reloadRank || "your current"} rank in Reload, your biggest gains will come from improving ${weakestCats[0] || "fundamentals"}.`,
    `With ${hoursPerDay}h/day available, spend at least 30% of your time on focused creative practice — not just playing games.`,
    "Record every ranked session. You can't fix what you can't see.",
    "Consistency beats intensity. 2 focused hours daily > 8 unfocused hours on weekends.",
    `Your weakest area is ${weakestCats[0] || "fundamentals"} — this is where you'll see the fastest improvement with dedicated practice.`,
  ];

  const weeklyOverview = `This plan targets your ${weakestCats.slice(0, 3).join(", ")} weaknesses across ${daysPerWeek} training days. Each day focuses on a different weak area with ${hoursPerDay}h sessions combining warm-up drills, focused creative practice, ranked play, and review.`;

  return { weeklyOverview, dailyPlans, tips };
}
