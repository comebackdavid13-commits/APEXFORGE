import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// ── User profiles (anonymous session-based) ──
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull().unique(),
  epicName: text("epic_name"),
  reloadRank: text("reload_rank"),
  brRank: text("br_rank"),
  peakReloadRank: text("peak_reload_rank"),
  peakBrRank: text("peak_br_rank"),
  inputDevice: text("input_device"), // 'kbm' | 'controller'
  playtimeHoursPerDay: integer("playtime_hours_per_day"),
  playtimeDaysPerWeek: integer("playtime_days_per_week"),
  goals: jsonb("goals").$type<string[]>(),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Weakness ratings ──
export const weaknessRatings = pgTable("weakness_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  category: text("category").notNull(),
  skill: text("skill").notNull(),
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Training plans ──
export const trainingPlans = pgTable("training_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  planData: jsonb("plan_data").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// ── Chat messages ──
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── VOD death notes ──
export const vodNotes = pgTable("vod_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  gameMode: text("game_mode").notNull(), // 'br' | 'reload' | 'creative'
  placement: integer("placement"),
  elimsBeforeDeath: integer("elims_before_death"),
  deathReason: text("death_reason").notNull(),
  situation: text("situation"), // 'offspawn' | 'midgame' | 'endgame' | 'rotation'
  notes: text("notes"),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Custom warmup routines ──
export const warmupRoutines = pgTable("warmup_routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  name: text("name").notNull(),
  totalDuration: integer("total_duration").notNull(),
  type: text("type").notNull(), // 'quick' | 'standard' | 'tournament' | 'custom'
  description: text("description"),
  steps: jsonb("steps").notNull(), // WarmupStep[]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Tournament/scrim entries ──
export const tournamentEntries = pgTable("tournament_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'tournament' | 'quali' | 'cash-cup' | 'fncs'
  date: timestamp("date").notNull(),
  placement: integer("placement"),
  totalTeams: integer("total_teams"),
  kills: integer("kills"),
  points: integer("points"),
  pr: integer("pr"), // Power Ranking points earned
  earnings: integer("earnings"), // in cents
  teammates: jsonb("teammates").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Rank history for progress tracking ──
export const rankHistory = pgTable("rank_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  mode: text("mode").notNull(), // 'br' | 'reload'
  rank: text("rank").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// ── Weekly skill reviews ──
export const weeklyReviews = pgTable("weekly_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  weekStart: timestamp("week_start").notNull(),
  ratings: jsonb("ratings").notNull(), // SkillRating[]
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Drop spot sessions ──
export const dropSessions = pgTable("drop_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  poiId: text("poi_id").notNull(),
  gameMode: text("game_mode").notNull(), // 'br' | 'reload'
  squadSize: text("squad_size").notNull(), // 'solo' | 'duo' | 'trio' | 'squad'
  gamesPlayed: integer("games_played").default(1),
  avgPlacement: integer("avg_placement"),
  kills: integer("kills"),
  survivedOffSpawn: integer("survived_off_spawn"),
  top10: integer("top10"),
  top5: integer("top5"),
  wins: integer("wins"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Custom tournaments created by the user ──
export const customTournaments = pgTable("custom_tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  name: text("name").notNull(),
  mode: text("mode").notNull(), // solo / duo / trio / squad
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxGames: integer("max_games").default(10), // games in the tournament
  isCash: boolean("is_cash").default(false), // has prize pool
  isPR: boolean("is_pr").default(false), // gives PR
  targetPlacement: integer("target_placement").default(50), // e.g. top 50
  notes: text("notes"),
  // Stored as UTC timestamps — displayed in the user's LOCAL timezone
  startLocalIso: text("start_local_iso"), // e.g. "2026-07-29T19:00" (local input as-is)
  endLocalIso: text("end_local_iso"),
  // ── Result fields (set after the tournament is over) ──
  finalPlacement: integer("final_placement"),
  pointsEarned: integer("points_earned"),
  killsEarned: integer("kills_earned"),
  cashEarned: integer("cash_earned"), // in cents
  prEarned: integer("pr_earned"),
  resultNotes: text("result_notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Session replay checklists ──
export const sessionReviews = pgTable("session_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  winRate: text("win_rate").notNull(), // '0-20' | '20-40' | '40-60' | '60-80' | '80-100'
  focusLevel: text("focus_level").notNull(), // 'low' | 'medium' | 'high' | 'peak'
  mechanicalConsistency: text("mechanical_consistency").notNull(), // 'poor' | 'inconsistent' | 'consistent' | 'clutch'
  decisionQuality: text("decision_quality").notNull(), // 'poor' | 'mixed' | 'good' | 'excellent'
  tiltLevel: integer("tilt_level").notNull(), // 1-5
  oneGoal: text("one_goal").notNull(),
  whatWentWell: text("what_went_well").notNull(),
  whatWentWrong: text("what_went_wrong").notNull(),
  biggestMistake: text("biggest_mistake").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
