// ── Onboarding Data ──
export interface OnboardingData {
  epicName: string;
  reloadRank: string;
  brRank: string;
  peakReloadRank: string;
  peakBrRank: string;
  inputDevice: "kbm" | "controller";
  playtimeHoursPerDay: number;
  playtimeDaysPerWeek: number;
  goals: string[];
}

// ── Weakness Categories & Skills ──
export interface SkillRating {
  category: string;
  skill: string;
  rating: number; // 1-5
}

export interface WeaknessCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  skills: { id: string; name: string; description: string }[];
}

// ── Training Plan ──
export interface DayPlan {
  day: string;
  focus: string;
  sessions: TrainingSession[];
}

export interface TrainingSession {
  type: "warmup" | "creative" | "ranked" | "vod" | "rest" | "workshop";
  title: string;
  duration: string;
  description: string;
  mapCode?: string;
}

export interface TrainingPlan {
  weeklyOverview: string;
  dailyPlans: DayPlan[];
  tips: string[];
}

// ── Chat ──
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// ── Profile ──
export interface UserProfile {
  id: string;
  sessionId: string;
  epicName: string | null;
  reloadRank: string | null;
  brRank: string | null;
  peakReloadRank: string | null;
  peakBrRank: string | null;
  inputDevice: string | null;
  playtimeHoursPerDay: number | null;
  playtimeDaysPerWeek: number | null;
  goals: string[] | null;
  onboardingComplete: boolean | null;
}

// ── VOD Death Note ──
export interface VodNote {
  id: string;
  gameMode: "br" | "reload" | "creative";
  placement: number | null;
  elimsBeforeDeath: number | null;
  deathReason: string;
  situation: "offspawn" | "midgame" | "endgame" | "rotation" | null;
  notes: string | null;
  aiAnalysis: string | null;
  createdAt: string;
}
