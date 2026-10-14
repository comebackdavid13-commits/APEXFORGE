"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Target,
  Award,
  Loader2,
  Save,
  CheckCircle,
  Star,
} from "lucide-react";
import type { SkillRating } from "@/lib/types";
import { weaknessCategories } from "@/lib/weaknesses";

const rankOrder = [
  "Unranked",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Elite",
  "Champion",
  "Unreal",
  "Unreal Legends",
];

const rankColors: Record<string, string> = {
  Unranked: "#6b7280",
  Bronze: "#a05a2c",
  Silver: "#9ca3af",
  Gold: "#fbbf24",
  Platinum: "#34d399",
  Diamond: "#22d3ee",
  Elite: "#a78bfa",
  Champion: "#f472b6",
  Unreal: "#f87171",
  "Unreal Legends": "#fbbf24",
};

interface RankHistoryEntry {
  id: string;
  mode: string;
  rank: string;
  recordedAt: string;
}

interface WeeklyReviewEntry {
  id: string;
  weekStart: string;
  ratings: SkillRating[];
  notes: string | null;
  createdAt: string;
}

interface ProgressChartsProps {
  sessionId: string;
  currentRatings: SkillRating[];
  brRank: string;
  reloadRank: string;
  onRatingsUpdated?: (ratings: SkillRating[]) => void;
}

export function ProgressCharts({
  sessionId,
  currentRatings,
  brRank,
  reloadRank,
  onRatingsUpdated,
}: ProgressChartsProps) {
  const [mode, setMode] = useState<"br" | "reload">("br");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({});
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [rankHistory, setRankHistory] = useState<RankHistoryEntry[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const currentWeekStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  const hasReviewThisWeek = weeklyReviews.some((r) => {
    const reviewDate = new Date(r.weekStart);
    return (
      reviewDate.getFullYear() === currentWeekStart.getFullYear() &&
      reviewDate.getMonth() === currentWeekStart.getMonth() &&
      reviewDate.getDate() === currentWeekStart.getDate()
    );
  });

  const latestReview = weeklyReviews.length > 0 ? weeklyReviews[weeklyReviews.length - 1] : null;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/progress-summary?sessionId=${sessionId}`);
        const data = await res.json();
        setRankHistory(data.rankHistory || []);
        setWeeklyReviews(data.weeklyReviews || []);
      } catch (err) {
        console.error("Failed to load progress data:", err);
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const modeHistory = useMemo(
    () =>
      rankHistory
        .filter((h) => h.mode === mode)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [rankHistory, mode]
  );

  const chartData = useMemo(() => {
    const width = 100;
    const height = 40;
    const padding = 6;
    return modeHistory.map((h, i) => ({
      x: modeHistory.length === 1 ? 50 : padding + (i / (modeHistory.length - 1)) * (width - padding * 2),
      y: height - padding - (rankOrder.indexOf(h.rank) / (rankOrder.length - 1)) * (height - padding * 2),
      rank: h.rank,
      date: new Date(h.recordedAt).toLocaleDateString(),
    }));
  }, [modeHistory]);

  const pathD = chartData.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Calculate skill improvement from last review
  const skillChanges = useMemo(() => {
    if (!latestReview) return;
    const oldRatings = latestReview.ratings;
    return oldRatings.map((old) => {
      const current = currentRatings.find(
        (c) => c.category === old.category && c.skill === old.skill
      );
      const currentRating = current?.rating ?? old.rating;
      return {
        category: old.category,
        skill: old.skill,
        oldRating: old.rating,
        newRating: currentRating,
        change: currentRating - old.rating,
      };
    });
  }, [latestReview, currentRatings]);

  const totalOld = latestReview
    ? latestReview.ratings.reduce((s, r) => s + r.rating, 0) / latestReview.ratings.length
    : 0;
  const totalNew = currentRatings.length > 0
    ? currentRatings.reduce((s, r) => s + r.rating, 0) / currentRatings.length
    : 0;
  const overallChange = totalNew - totalOld;

  const categoriesToReview = weaknessCategories.filter((cat) => {
    return cat.skills.some((s) =>
      currentRatings.some(
        (r) => r.category === cat.id && r.skill === s.id
      )
    );
  });

  const startReview = () => {
    const initial: Record<string, number> = {};
    for (const cat of categoriesToReview) {
      for (const skill of cat.skills) {
        const existing = currentRatings.find(
          (r) => r.category === cat.id && r.skill === skill.id
        );
        initial[`${cat.id}:${skill.id}`] = existing?.rating || 3;
      }
    }
    setReviewRatings(initial);
    setReviewStep(0);
    setShowReviewForm(true);
  };

  const saveReview = async () => {
    setSaving(true);
    const ratings: SkillRating[] = Object.entries(reviewRatings).map(([key, rating]) => {
      const [category, skill] = key.split(":");
      return { category, skill, rating };
    });
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ratings,
          notes: reviewNotes.trim() || null,
        }),
      });
      if (res.ok) {
        setShowReviewForm(false);
        setReviewNotes("");
        onRatingsUpdated?.(ratings);
        // Reload summary
        const sumRes = await fetch(`/api/progress-summary?sessionId=${sessionId}`);
        const sumData = await sumRes.json();
        setRankHistory(sumData.rankHistory || []);
        setWeeklyReviews(sumData.weeklyReviews || []);
      }
    } catch (err) {
      console.error("Failed to save review:", err);
    }
    setSaving(false);
  };

  const currentCategory = categoriesToReview[reviewStep];
  const totalSteps = categoriesToReview.length;
  const progress = ((reviewStep + 1) / totalSteps) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            Progress Tracking
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Rank graphs + weekly skill improvement
          </p>
        </div>
        {!hasReviewThisWeek && categoriesToReview.length > 0 && (
          <button
            onClick={startReview}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold hover:shadow-[0_0_25px_rgba(108,92,231,0.4)] transition-all"
          >
            <Target className="w-4 h-4" />
            Weekly Review
          </button>
        )}
      </div>

      {/* Weekly review reminder */}
      {!hasReviewThisWeek && (
        <div className="mb-6 p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              It&apos;s time for your weekly review
            </p>
            <p className="text-text-secondary text-xs mt-0.5">
              Re-rate your skills to see how much you improved this week.
            </p>
          </div>
        </div>
      )}

      {hasReviewThisWeek && latestReview && (
        <div className="mb-6 p-4 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">
              Weekly review completed
            </p>
            <p className="text-text-secondary text-xs mt-0.5">
              You improved {overallChange >= 0 ? "+" : ""}
              {overallChange.toFixed(2)} points overall this week.
            </p>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Rank history */}
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              {mode.toUpperCase()} Rank History
            </h3>
            <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary/50 border border-border">
              <button
                onClick={() => setMode("br")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "br" ? "bg-accent text-white" : "text-text-secondary"
                }`}
              >
                BR
              </button>
              <button
                onClick={() => setMode("reload")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "reload" ? "bg-accent-cyan text-white" : "text-text-secondary"
                }`}
              >
                Reload
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-bg-secondary/40 text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Current Rank</p>
              <p
                className="text-2xl font-black"
                style={{ color: rankColors[mode === "br" ? brRank : reloadRank] }}
              >
                {mode === "br" ? brRank : reloadRank}
              </p>
              {modeHistory.length > 1 && (
                <p className="text-xs text-text-muted mt-1">
                  {modeHistory.length} change{modeHistory.length !== 1 ? "s" : ""} tracked
                </p>
              )}
            </div>

            {chartData.length > 1 ? (
              <div className="relative h-40 bg-bg-secondary/20 rounded-xl border border-border overflow-hidden">
                <svg
                  viewBox="0 0 100 40"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                >
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line
                      key={t}
                      x1={0}
                      y1={40 - 6 - t * 28}
                      x2={100}
                      y2={40 - 6 - t * 28}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={0.3}
                    />
                  ))}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={rankColors[mode === "br" ? brRank : reloadRank]}
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {chartData.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={1.2}
                      fill={rankColors[p.rank]}
                      stroke="white"
                      strokeWidth={0.3}
                    />
                  ))}
                </svg>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-text-muted">
                  <span>{chartData[0].date}</span>
                  <span>{chartData[chartData.length - 1].date}</span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center rounded-xl bg-bg-secondary/20 border border-dashed border-border text-text-muted text-sm">
                Update your rank to start tracking
              </div>
            )}

            {/* Recent rank changes */}
            {modeHistory.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {[...modeHistory].reverse().slice(0, 6).map((h, i, arr) => {
                  const prev = arr[i + 1];
                  const moved = prev
                    ? rankOrder.indexOf(h.rank) > rankOrder.indexOf(prev.rank)
                      ? "up"
                      : rankOrder.indexOf(h.rank) < rankOrder.indexOf(prev.rank)
                      ? "down"
                      : null
                    : null;
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-bg-secondary/30 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: rankColors[h.rank] }}
                        />
                        <span className="font-semibold">{h.rank}</span>
                        {moved && (
                          <span
                            className={`text-[10px] font-bold ${
                              moved === "up" ? "text-success" : "text-danger"
                            }`}
                          >
                            {moved === "up" ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                      <span className="text-text-muted">{new Date(h.recordedAt).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Skill improvement */}
        <div className="rounded-2xl bg-bg-card border border-border p-5">
          <h3 className="font-bold flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-success" />
            Skill Improvement
          </h3>

          {latestReview && skillChanges ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-success" />
                  <span className="font-semibold text-sm">
                    This Week vs Last Week
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-success">
                    {overallChange >= 0 ? "+" : ""}
                    {overallChange.toFixed(2)}
                  </span>
                  <span className="text-xs text-text-muted">avg skill points</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {overallChange > 0.1
                    ? "Great progress! Keep this up."
                    : overallChange > 0
                    ? "Small gains are still gains. Stay consistent."
                    : overallChange < -0.1
                    ? "Rough week. Review why and adjust your training."
                    : "No big change yet. More deliberate practice needed."}
                </p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {skillChanges
                  .sort((a, b) => b.change - a.change)
                  .map((c) => {
                    const skillName =
                      weaknessCategories
                        .find((cat) => cat.id === c.category)
                        ?.skills.find((s) => s.id === c.skill)?.name || c.skill;
                    return (
                      <div
                        key={`${c.category}-${c.skill}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-bg-secondary/30 text-xs"
                      >
                        <div>
                          <p className="font-medium">{skillName}</p>
                          <p className="text-text-muted capitalize">
                            {c.category.replace("-", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-text-muted">{c.oldRating}</span>
                            <ChevronRight className="w-3 h-3 text-text-muted" />
                            <span className="font-bold">{c.newRating}</span>
                          </div>
                          {c.change !== 0 && (
                            <span
                              className={`text-[10px] font-bold ${
                                c.change > 0 ? "text-success" : "text-danger"
                              }`}
                            >
                              {c.change > 0 ? `+${c.change}` : c.change}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 rounded-xl bg-bg-secondary/20 border border-dashed border-border">
              <Target className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-text-secondary text-sm">
                No weekly review yet
              </p>
              <p className="text-text-muted text-xs mt-1">
                Complete your first weekly review to see improvement charts
              </p>
            </div>
          )}

          {/* Next review call to action */}
          {!hasReviewThisWeek && (
            <button
              onClick={startReview}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] transition-all"
            >
              Start Weekly Review
            </button>
          )}
        </div>
      </div>

      {/* Review form modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-card border border-border rounded-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-bg-card/95 backdrop-blur">
                <div>
                  <h3 className="text-lg font-bold">Weekly Skill Review</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Step {reviewStep + 1} of {totalSteps} • {currentCategory?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
                >
                  <ChevronRight className="w-5 h-5 rotate-45" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-bg-secondary">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-accent-blue"
                  animate={{ width: `${progress}%` }}
                />
              </div>

              {/* Category content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={reviewStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="p-5 space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentCategory?.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{currentCategory?.name}</h3>
                      <p className="text-text-secondary text-sm">
                        {currentCategory?.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentCategory?.skills.map((skill) => {
                      const key = `${currentCategory.id}:${skill.id}`;
                      const rating = reviewRatings[key];
                      const existing = currentRatings.find(
                        (r) => r.category === currentCategory.id && r.skill === skill.id
                      );
                      return (
                        <div
                          key={key}
                          className="p-4 rounded-xl bg-bg-secondary/40 border border-border/40 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{skill.name}</h4>
                              <p className="text-text-muted text-xs">{skill.description}</p>
                            </div>
                            {existing && (
                              <div className="text-right">
                                <p className="text-[10px] text-text-muted uppercase">Last week</p>
                                <p className="font-bold">{existing.rating}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() =>
                                  setReviewRatings((r) => ({ ...r, [key]: n }))
                                }
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                  rating === n
                                    ? n <= 2
                                      ? "bg-danger/20 text-danger border border-danger/40"
                                      : n === 3
                                      ? "bg-text-secondary/20 text-text-primary border border-text-secondary/40"
                                      : "bg-accent/20 text-accent-light border border-accent/40"
                                    : "bg-bg-tertiary text-text-muted border border-transparent hover:border-border-light"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between p-5 border-t border-border">
                <button
                  onClick={() => setReviewStep((s) => Math.max(0, s - 1))}
                  disabled={reviewStep === 0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    reviewStep === 0
                      ? "text-text-muted cursor-not-allowed"
                      : "text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={
                    reviewStep === totalSteps - 1 ? saveReview : () => setReviewStep((s) => s + 1)
                  }
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : reviewStep === totalSteps - 1 ? (
                    <>
                      <Save className="w-4 h-4" />
                      Complete Review
                    </>
                  ) : (
                    <>
                      Next{" "}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
