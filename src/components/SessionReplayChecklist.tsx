"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  TrendingUp,
  AlertTriangle,
  Zap,
  Sparkles,
  MessageSquare,
} from "lucide-react";

interface SessionReplayChecklistProps {
  sessionId: string;
  onComplete?: () => void;
}

interface Review {
  id: string;
  winRate: string;
  focusLevel: string;
  mechanicalConsistency: string;
  decisionQuality: string;
  tiltLevel: number;
  oneGoal: string;
  whatWentWell: string;
  whatWentWrong: string;
  biggestMistake: string;
  createdAt: string;
}

const steps: {
  field: keyof Omit<Review, "id" | "createdAt">;
  label: string;
  type: "select" | "slider" | "text";
  options?: { id: string; label: string; color?: string }[];
  max?: number;
}[] = [
  {
    field: "winRate",
    label: "What was your win rate this session?",
    type: "select",
    options: [
      { id: "0-20", label: "0–20%" },
      { id: "20-40", label: "20–40%" },
      { id: "40-60", label: "40–60%" },
      { id: "60-80", label: "60–80%" },
      { id: "80-100", label: "80–100%" },
    ],
  },
  {
    field: "focusLevel",
    label: "How was your focus?",
    type: "select",
    options: [
      { id: "low", label: "Low — autopilot games" },
      { id: "medium", label: "Medium — missed some reads" },
      { id: "high", label: "High — locked in every game" },
      { id: "peak", label: "Peak — tournament mentality" },
    ],
  },
  {
    field: "mechanicalConsistency",
    label: "How consistent were your mechanics (builds/edits/aim)?",
    type: "select",
    options: [
      { id: "poor", label: "Poor — missed peeks and flicks" },
      { id: "inconsistent", label: "Inconsistent — some good, some bad" },
      { id: "consistent", label: "Consistent — trusting muscle memory" },
      { id: "clutch", label: "Clutch — carrying under pressure" },
    ],
  },
  {
    field: "decisionQuality",
    label: "How were your macro decisions?",
    type: "select",
    options: [
      { id: "poor", label: "Poor — forced fights, bad rotates" },
      { id: "mixed", label: "Mixed — some good, some forced" },
      { id: "good", label: "Good — disproportionately winning trades" },
      { id: "excellent", label: "Excellent — pro-level decision making" },
    ],
  },
  {
    field: "tiltLevel",
    label: "How tilted were you? (1 = fresh af, 5 = tilted inefficient)",
    type: "slider",
    max: 5,
  },
  {
    field: "oneGoal",
    label: "What was your ONE declared goal for this session?",
    type: "text",
  },
  {
    field: "whatWentWell",
    label: "What went WELL?",
    type: "text",
  },
  {
    field: "whatWentWrong",
    label: "What went WRONG?",
    type: "text",
  },
  {
    field: "biggestMistake",
    label: "What is the BIGGEST mistake to fix next time?",
    type: "text",
  },
];

export function SessionReplayChecklist({
  sessionId,
  onComplete,
}: SessionReplayChecklistProps) {
  const [step, setStep] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({
    winRate: "",
    focusLevel: "",
    mechanicalConsistency: "",
    decisionQuality: "",
    tiltLevel: 3,
    oneGoal: "",
    whatWentWell: "",
    whatWentWrong: "",
    biggestMistake: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [coachInsight, setCoachInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canProceed = () => {
    const field = steps[step].field;
    const value = answers[field];
    if (steps[step].type === "slider") return typeof value === "number";
    return typeof value === "string" && value.trim().length > 0;
  };

  const load = async () => {
    try {
      const res = await fetch(`/api/session-review?sessionId=${sessionId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Failed to load session reviews:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/session-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...answers,
        }),
      });
      const data = await res.json();
      if (data.coachInsight) {
        setCoachInsight(data.coachInsight);
      }
      await load();
      onComplete?.();
      // Reset after a short delay so user can read insight
      setTimeout(() => {
        setStep(0);
        setAnswers({
          winRate: "",
          focusLevel: "",
          mechanicalConsistency: "",
          decisionQuality: "",
          tiltLevel: 3,
          oneGoal: "",
          whatWentWell: "",
          whatWentWrong: "",
          biggestMistake: "",
        });
      }, 500);
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
    setSubmitting(false);
  };

  const currentField = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const lastReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-accent" />
          Session Replay Checklist
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Post-session reflection that feeds your AI coach and progress graph
        </p>
      </div>

      {/* Previous reviews + insight */}
      {coachInsight && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl bg-accent/5 border border-accent/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent-light" />
            <span className="font-bold">AI Coach Insight</span>
          </div>
          <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {coachInsight.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="font-bold text-accent-light mb-2">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              if (line.startsWith("- ") || line.match(/^\d+\./)) {
                return (
                  <p key={i} className="ml-4 mb-1">
                    {line}
                  </p>
                );
              }
              return (
                <p key={i} className="mb-1">
                  {line}
                </p>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick stats from last review */}
      {lastReview && !coachInsight && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-bg-card border border-border">
            <p className="text-xs text-text-muted mb-1">Last Session Win Rate</p>
            <p className="text-lg font-bold text-success">{lastReview.winRate}</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-card border border-border">
            <p className="text-xs text-text-muted mb-1">Focus Level</p>
            <p className="text-lg font-bold capitalize">{lastReview.focusLevel}</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-card border border-border">
            <p className="text-xs text-text-muted mb-1">Mechanics</p>
            <p className="text-lg font-bold capitalize">{lastReview.mechanicalConsistency}</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-card border border-border">
            <p className="text-xs text-text-muted mb-1">Tilt Level</p>
            <p className="text-lg font-bold">
              {lastReview.tiltLevel <= 2 ? "chill" : lastReview.tiltLevel === 3 ? "mild" : lastReview.tiltLevel === 4 ? "heated" : "tilted"}{" "}
              ({lastReview.tiltLevel}/5)
            </p>
          </div>
        </div>
      )}

      {/* Checklist form */}
      {!coachInsight ? (
        <div className="rounded-2xl bg-bg-card border border-border p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">{currentField.label}</span>
              <span className="text-xs text-text-muted">
                {step + 1}/{steps.length}
              </span>
            </div>
            <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-blue"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Select */}
          {currentField.type === "select" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {currentField.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, [currentField.field]: opt.id }))
                  }
                  className={`p-4 rounded-xl border text-left text-sm transition-all ${
                    answers[currentField.field] === opt.id
                      ? "border-accent bg-accent/10 text-text-primary"
                      : "border-border bg-bg-secondary text-text-secondary hover:border-border-light"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentField.field] === opt.id
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {answers[currentField.field] === opt.id && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </span>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Slider */}
          {currentField.type === "slider" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-accent">
                  {answers[currentField.field]}/5
                </span>
                <span className="text-xs text-text-muted">
                  1 = chill af, 5 = full tilt
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={answers[currentField.field] as number}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    [currentField.field]: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-accent h-2 bg-bg-secondary rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
          )}

          {/* Text */}
          {currentField.type === "text" && (
            <div className="mb-5">
              <textarea
                value={answers[currentField.field] as string}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [currentField.field]: e.target.value }))
                }
                placeholder="Be brutally honest..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all text-sm resize-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canProceed()) {
                    if (step === steps.length - 1) submit();
                    else setStep((s) => s + 1);
                  }
                }}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-5 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                step === 0
                  ? "text-text-muted cursor-not-allowed"
                  : "text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={step === steps.length - 1 ? submit : () => setStep((s) => s + 1)}
              disabled={!canProceed() || submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                canProceed() && !submitting
                  ? "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_25px_rgba(108,92,231,0.4)]"
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === steps.length - 1 ? (
                <>
                  <Save className="w-4 h-4" />
                  Complete Review
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 rounded-2xl bg-bg-card border border-border">
          <TrendingUp className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Review Complete</h3>
          <p className="text-text-secondary text-sm mb-6">
            Your feedback has been logged and the AI coach has analyzed it.
            This will influence your next training session and weekly progress.
          </p>
          <button
            onClick={() => setCoachInsight(null)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold"
          >
            Back to Checklist
          </button>
        </div>
      )}

      {/* History hint */}
      {reviews.length > 0 && !coachInsight && !loading && (
        <div className="mt-6 p-4 rounded-xl bg-bg-card border border-border border-l-4 border-l-accent">
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span className="text-text-secondary">
              You have completed{" "}
              <span className="font-bold text-text-primary">{reviews.length}</span>{" "}
              session review{reviews.length !== 1 ? "s" : ""}. {"Track long-term tilt patterns"}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
