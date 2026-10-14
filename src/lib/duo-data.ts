// DUO PRACTICE HUB — C7S3 Map codes and duo training plans

export type DuoMapCategory =
  | "box-fighting"
  | "piece-control"
  | "movement"
  | "rotations"
  | "1v1-arena"
  | "edit-courses"
  | "aim-training"
  | "revive-drills";

export interface DuoPracticeMap {
  id: string;
  name: string;
  category: DuoMapCategory;
  mapCode: string;
  description: string;
  recommendedRating: number;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  focusSkills: string[];
}

export const duoPracticeMaps: DuoPracticeMap[] = [
  {
    id: "bf-classic-1v1",
    name: "Box Fight 1v1 (Realistic)",
    category: "box-fighting",
    mapCode: "7620-0771-9529",
    description: "Head-to-head realistic box fights with full loot. Tests every box fight skill in a real scenario.",
    recommendedRating: 2.5,
    duration: "30 min",
    difficulty: "intermediate",
    focusSkills: ["Box Fighting", "Disengaging", "W-Keying"],
  },
  {
    id: "bf-speed",
    name: "Speed Box Fight",
    category: "box-fighting",
    mapCode: "6531-5731-2148",
    description: "Fast-paced box fights with timer. Practice wall-replacing under pressure.",
    recommendedRating: 3,
    duration: "20 min",
    difficulty: "advanced",
    focusSkills: ["Box Fighting", "Mechanical Consistency"],
  },
  {
    id: "pc-control",
    name: "Piece Control Master",
    category: "piece-control",
    mapCode: "5765-2565-4462",
    description: "Drills taking walls, floors, cones. The single most important mechanics skill for duos.",
    recommendedRating: 3,
    duration: "25 min",
    difficulty: "advanced",
    focusSkills: ["Piece Control", "Editing", "Build Speed"],
  },
  {
    id: "pc-retake",
    name: "Height Retake Practice",
    category: "piece-control",
    mapCode: "9124-5509-6523",
    description: "Re-take high ground from a low box. Duos in tournaments need this constantly.",
    recommendedRating: 2.5,
    duration: "20 min",
    difficulty: "intermediate",
    focusSkills: ["Retakes", "Piece Control", "Build Speed"],
  },
  {
    id: "movement-mastery",
    name: "Movement Mastery",
    category: "movement",
    mapCode: "8531-1247-9621",
    description: "Slide canceling, jump peeking, right-hand advantage drills.",
    recommendedRating: 2,
    duration: "15 min",
    difficulty: "beginner",
    focusSkills: ["Movement", "Crosshair Placement"],
  },
  {
    id: "rotation-drills",
    name: "Duo Rotation Sim",
    category: "rotations",
    mapCode: "6562-8953-6567",
    description: "Simulated moving zones. Practice surge tags and rotating together.",
    recommendedRating: 2.5,
    duration: "30 min",
    difficulty: "intermediate",
    focusSkills: ["Zone Rotations", "Storm Surge", "Endgame"],
  },
  {
    id: "duels-1v1",
    name: "Duel 1v1 Arena",
    category: "1v1-arena",
    mapCode: "9564-7321-8453",
    description: "Duel-style 1v1s. Perfect for IGL + Fragger to find synergy and play style.",
    recommendedRating: 2.5,
    duration: "20 min",
    difficulty: "intermediate",
    focusSkills: ["Box Fighting", "Game Sense"],
  },
  {
    id: "edit-course-bfc",
    name: "BFC Edit Course",
    category: "edit-courses",
    mapCode: "7562-1598-0199",
    description: "Speed edit course. Both players time themselves — race to beat your best.",
    recommendedRating: 2.5,
    duration: "15 min",
    difficulty: "intermediate",
    focusSkills: ["Editing", "Build Speed"],
  },
  {
    id: "edit-course-raider",
    name: "Raider's Edit Course",
    category: "edit-courses",
    mapCode: "4321-8765-2109",
    description: "Advanced edit course for duo endgame. Both players need fast hands here.",
    recommendedRating: 3.5,
    duration: "15 min",
    difficulty: "advanced",
    focusSkills: ["Editing", "Mechanical Consistency"],
  },
  {
    id: "aim-trainer",
    name: "Skaavok Aim Trainer",
    category: "aim-training",
    mapCode: "8022-6842-4965",
    description: "Comprehensive aim training. Both players grind here every session.",
    recommendedRating: 1,
    duration: "20 min",
    difficulty: "beginner",
    focusSkills: ["AR Tracking", "Shotgun Aim", "Crosshair Placement"],
  },
  {
    id: "revive-drills",
    name: "Duo Revive Drills",
    category: "revive-drills",
    mapCode: "7411-8522-9633",
    description: "Practice the 20-second revive scramble. Box up, guard, finish, repeat.",
    recommendedRating: 2.5,
    duration: "20 min",
    difficulty: "intermediate",
    focusSkills: ["Reviving", "Game Sense", "Disengaging"],
  },
];

export function getDuoPlanForSkillLevel(avgRating: number): DuoPracticeMap[] {
  return duoPracticeMaps
    .filter((m) => m.recommendedRating <= avgRating)
    .sort((a, b) => {
      const order: DuoMapCategory[] = [
        "aim-training",
        "movement",
        "edit-courses",
        "piece-control",
        "box-fighting",
        "revive-drills",
        "1v1-arena",
        "rotations",
      ];
      return order.indexOf(a.category) - order.indexOf(b.category);
    });
}

export const duoCategoryLabels: Record<DuoMapCategory, { label: string; icon: string }> = {
  "aim-training": { label: "Aim Training", icon: "🎯" },
  movement: { label: "Movement", icon: "🏃" },
  "edit-courses": { label: "Edit Courses", icon: "✏️" },
  "piece-control": { label: "Piece Control", icon: "🧱" },
  "box-fighting": { label: "Box Fighting", icon: "📦" },
  "revive-drills": { label: "Revive Drills", icon: "💊" },
  "1v1-arena": { label: "1v1 Arena", icon: "⚔️" },
  rotations: { label: "Rotations", icon: "🔄" },
};

export const duoRoles = {
  IGL: "In-game leader: makes calls, decides rotates, tracks surge",
  Fragger: "First one in: opens fights, takes picks, applies pressure",
  Support: "Backline: helps trade, holds reboot, gives extra heals",
};

// ── Day-of-week duo practice plans ──
export interface DayPlan {
  day: string;
  date: string;
  focus: string;
  duration: string;
  recommendedMaps: string[];
  drills: string[];
  roleFocus: { IGL: string; Fragger: string; Support: string };
  why: string;
}

const BASE_DAY_PLANS: Record<number, Omit<DayPlan, "date" | "day">> = {
  0: {
    focus: "Recovery & Light Drills",
    duration: "30-45 min",
    recommendedMaps: ["bf-classic-1v1"],
    drills: [
      "10 min light box fights — no winning focus, just clean reps",
      "10 min piece-control practice",
      "Discuss last week's VOD together",
    ],
    roleFocus: {
      IGL: "Watch 1 of your recent replays. Note 2 decisions you'd change.",
      Fragger: "Practice the 4-peek combo: right hand, left hand, high, low.",
      Support: "Rescue your duo from a box. Time the 20-second scramble.",
    },
    why: "Rest day. Focus on what you learned, not what you grind.",
  },
  1: {
    focus: "Mechanics & Piece Control",
    duration: "60-90 min",
    recommendedMaps: ["pc-control", "pc-retake", "edit-course-bfc"],
    drills: [
      "20 min piece control: take walls, place cones, edit through",
      "20 min height retakes from low box",
      "15 min edit course, race to beat your time",
      "10 min free-build warmup",
    ],
    roleFocus: {
      IGL: "Practice piece control while calling rotates out loud.",
      Fragger: "Take every wall in your path. No skipping.",
      Support: "Practice safe piece control — never over-extend.",
    },
    why: "Monday is fresh — your hands work best. Stack mechanical work here.",
  },
  2: {
    focus: "Aim Training & Movement",
    duration: "45-60 min",
    recommendedMaps: ["aim-trainer", "movement-mastery"],
    drills: [
      "20 min Skaavok aim training (TILE FRENZY + tracking + flick)",
      "15 min movement mastery — slide cancel + right-hand peeks",
      "10 min AR tracking in box fights",
      "10 min shotgun flicks only",
    ],
    roleFocus: {
      IGL: "Track your duo's positioning while you aim train. Awareness.",
      Fragger: "Tighter tracking. You start the fights — your aim has to land.",
      Support: "Stay mobile. A dead Support can't trade.",
    },
    why: "Aim and movement are universal — both players get equal reps.",
  },
  3: {
    focus: "Endgame & Rotations",
    duration: "60 min",
    recommendedMaps: ["rotation-drills", "bf-classic-1v1"],
    drills: [
      "15 min rotating together through moving zones",
      "15 min surge-tag practice in late-game scenarios",
      "10 min 1v1 box fights (tournament pace)",
      "20 min duo scrims / 1 duo scrim if available",
    ],
    roleFocus: {
      IGL: "Call the surge tags out loud. Time them to the second.",
      Fragger: "Position for the next fight, not the current one.",
      Support: "Hold the reboot card. Don't drop it for anything.",
    },
    why: "Endgame wins tournaments. A duo that rotates cleanly wins more.",
  },
  4: {
    focus: "Tournament Day — Scrims & 1v1s",
    duration: "60-90 min",
    recommendedMaps: ["bf-classic-1v1", "duels-1v1", "revive-drills"],
    drills: [
      "30 min duo scrims (minimum 2 games)",
      "20 min 1v1s against other players",
      "15 min revive scramble practice",
      "10 min warmup before going live",
    ],
    roleFocus: {
      IGL: "Scrim with intent. Call every fight. Talk about every death.",
      Fragger: "Pace your aggression. Don't waste all your energy early.",
      Support: "You are the reason the duo lives. Hold cards, give heals.",
    },
    why: "Thursdays are typically tournament day. Scrim into comp-mode focus.",
  },
  5: {
    focus: "Light Aim & Box Fights",
    duration: "30-45 min",
    recommendedMaps: ["aim-trainer", "bf-classic-1v1"],
    drills: [
      "10 min aim training (light, no pressure)",
      "20 min chill box fights — try new strategies",
      "10 min duo freeplay, no scrims",
    ],
    roleFocus: {
      IGL: "Try a creative drop and talk through your reads with duo.",
      Fragger: "Loosen up. Don't build bad habits trying to get good numbers.",
      Support: "Stay around. Don't force anything.",
    },
    why: "Friday = recovery. Lower intensity, focus on fun + communication.",
  },
  6: {
    focus: "Heavy Practice Block (90+ min)",
    duration: "90-120 min",
    recommendedMaps: [
      "bf-classic-1v1",
      "pc-control",
      "bf-speed",
      "rotation-drills",
      "revive-drills",
    ],
    drills: [
      "30 min creative: 4 box-fight rounds → piece control → revive",
      "30 min duo scrims (try 3-4 games)",
      "20 min 1v1 arena",
      "20 min VOD review of last session",
    ],
    roleFocus: {
      IGL: "This is your day. Lead long sessions. Run back-to-back scrims.",
      Fragger: "Pile up reps. Open every fight. Reset fast after deaths.",
      Support: "Heavy day too. Practice late-game rotation with your duo.",
    },
    why: "Saturday is the day players grind the most. Stack the most reps here.",
  },
};

function buildDayPlan(dayIndex: number, teamAvg: number): DayPlan {
  const today = new Date();
  const dayName = today.toLocaleDateString(undefined, { weekday: "long" });
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const base = BASE_DAY_PLANS[dayIndex] || BASE_DAY_PLANS[1];
  let focus = base.focus;
  let drills = base.drills;
  if (teamAvg < 2.5) {
    focus = `${base.focus} (Foundation Focus)`;
    drills = ["Start with 10 min easy aim training (no tracking, just clicks)", ...base.drills];
  } else if (teamAvg > 4) {
    focus = `${base.focus} (Elite Block)`;
    drills = [...base.drills, "Cap with 10 min focused 1v1 against top players"];
  }
  return {
    day: dayName,
    date: dateStr,
    focus,
    duration: base.duration,
    recommendedMaps: base.recommendedMaps,
    drills,
    roleFocus: base.roleFocus,
    why: base.why,
  };
}

export function getTodayDuoPlan(
  teamAvg: number,
  p1Role: "IGL" | "Fragger" | "Support" = "IGL",
  p2Role: "IGL" | "Fragger" | "Support" = "Fragger"
): DayPlan {
  // p1Role / p2Role are accepted for future personalization, but the base plan
  // is shared per day. Role-specific tips are accessible via .roleFocus.
  return buildDayPlan(new Date().getDay(), teamAvg);
}

export function getWeeklyDuoPlan(
  teamAvg: number,
  p1Role: "IGL" | "Fragger" | "Support" = "IGL",
  p2Role: "IGL" | "Fragger" | "Support" = "Fragger"
): DayPlan[] {
  const today = new Date();
  const result: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push(buildDayPlan(d.getDay(), teamAvg));
  }
  return result;
}
