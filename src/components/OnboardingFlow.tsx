"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Keyboard,
  Gamepad2,
  Clock,
  Target,
  Zap,
  User,
  Award,
  TrendingUp,
} from "lucide-react";
import type { OnboardingData } from "@/lib/types";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

// Updated Fortnite ranks (no 1,2,3 suffixes, added Unreal Legends)
const ranks = [
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

const goalOptions = [
  "Reach Champion rank",
  "Reach Unreal rank",
  "Improve aim consistency",
  "Better building mechanics",
  "Win more box fights",
  "Survive endgame consistently",
  "Qualify for tournaments",
  "Improve game sense & rotations",
  "Stop dying off spawn",
  "Better piece control",
  "Reduce tilt & play consistently",
];

const TOTAL_STEPS = 6; // Added step for peak ranks

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    epicName: "",
    reloadRank: "Gold",
    brRank: "Gold",
    peakReloadRank: "Platinum",
    peakBrRank: "Platinum",
    inputDevice: "kbm",
    playtimeHoursPerDay: 3,
    playtimeDaysPerWeek: 5,
    goals: [],
  });

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.epicName.trim().length > 0;
      case 1:
        return true; // ranks have defaults
      case 2:
        return true; // peak ranks have defaults
      case 3:
        return true; // input device has default
      case 4:
        return true; // playtime has defaults
      case 5:
        return data.goals.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      onComplete(data);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const toggleGoal = (goal: string) => {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(goal)
        ? d.goals.filter((g) => g !== goal)
        : [...d.goals, goal],
    }));
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  const stepLabels = ["Profile", "Ranks", "Peak", "Input", "Time", "Goals"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 justify-center"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">ApexForge</span>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-text-muted">
              {Math.round(((step + 1) / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-blue rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={`text-xs ${
                  i <= step ? "text-accent-light" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8 min-h-[420px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1"
            >
              {/* Step 0: Epic Name */}
              {step === 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">What&apos;s your Epic name?</h2>
                      <p className="text-text-secondary text-sm">
                        We&apos;ll use this to personalize your experience
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={data.epicName}
                    onChange={(e) =>
                      setData((d) => ({ ...d, epicName: e.target.value }))
                    }
                    placeholder="Enter your Epic username"
                    className="w-full px-4 py-3.5 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all text-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canProceed()) handleNext();
                    }}
                  />
                </div>
              )}

              {/* Step 1: Current Ranks */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Your current ranks</h2>
                      <p className="text-text-secondary text-sm">
                        Where are you right now in ranked?
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Battle Royale Rank
                      </label>
                      <select
                        value={data.brRank}
                        onChange={(e) =>
                          setData((d) => ({ ...d, brRank: e.target.value }))
                        }
                        className="w-full px-4 py-3.5 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                      >
                        {ranks.map((r) => (
                          <option key={`br-${r}`} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Reload Rank
                      </label>
                      <select
                        value={data.reloadRank}
                        onChange={(e) =>
                          setData((d) => ({ ...d, reloadRank: e.target.value }))
                        }
                        className="w-full px-4 py-3.5 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                      >
                        {ranks.map((r) => (
                          <option key={`reload-${r}`} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Peak Ranks */}
              {step === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Your peak ranks</h2>
                      <p className="text-text-secondary text-sm">
                        The highest rank you&apos;ve ever reached
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Peak BR Rank
                      </label>
                      <select
                        value={data.peakBrRank}
                        onChange={(e) =>
                          setData((d) => ({ ...d, peakBrRank: e.target.value }))
                        }
                        className="w-full px-4 py-3.5 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                      >
                        {ranks.map((r) => (
                          <option key={`peak-br-${r}`} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Peak Reload Rank
                      </label>
                      <select
                        value={data.peakReloadRank}
                        onChange={(e) =>
                          setData((d) => ({ ...d, peakReloadRank: e.target.value }))
                        }
                        className="w-full px-4 py-3.5 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
                      >
                        {ranks.map((r) => (
                          <option key={`peak-reload-${r}`} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="text-xs text-text-secondary">
                      💡 If you&apos;ve peaked higher than your current rank, we can help you get back there — and beyond.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Input Device */}
              {step === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Input device</h2>
                      <p className="text-text-secondary text-sm">
                        Your training will be optimized for your input
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() =>
                        setData((d) => ({ ...d, inputDevice: "kbm" }))
                      }
                      className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                        data.inputDevice === "kbm"
                          ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(108,92,231,0.2)]"
                          : "border-border bg-bg-secondary hover:border-border-light"
                      }`}
                    >
                      <Keyboard
                        className={`w-10 h-10 ${
                          data.inputDevice === "kbm"
                            ? "text-accent"
                            : "text-text-secondary"
                        }`}
                      />
                      <span className="font-semibold text-lg">KBM</span>
                      <span className="text-text-muted text-xs">
                        Keyboard & Mouse
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setData((d) => ({ ...d, inputDevice: "controller" }))
                      }
                      className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                        data.inputDevice === "controller"
                          ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(108,92,231,0.2)]"
                          : "border-border bg-bg-secondary hover:border-border-light"
                      }`}
                    >
                      <Gamepad2
                        className={`w-10 h-10 ${
                          data.inputDevice === "controller"
                            ? "text-accent"
                            : "text-text-secondary"
                        }`}
                      />
                      <span className="font-semibold text-lg">Controller</span>
                      <span className="text-text-muted text-xs">
                        Gamepad / Console
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Playtime */}
              {step === 4 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Available playtime</h2>
                      <p className="text-text-secondary text-sm">
                        We&apos;ll build a realistic plan around your schedule
                      </p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-text-secondary">
                          Hours per day
                        </label>
                        <span className="text-2xl font-bold text-accent">
                          {data.playtimeHoursPerDay}h
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        value={data.playtimeHoursPerDay}
                        onChange={(e) =>
                          setData((d) => ({
                            ...d,
                            playtimeHoursPerDay: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-accent h-2 bg-bg-tertiary rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-text-muted mt-1">
                        <span>1h</span>
                        <span>8h</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-text-secondary">
                          Days per week
                        </label>
                        <span className="text-2xl font-bold text-accent">
                          {data.playtimeDaysPerWeek} days
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={7}
                        value={data.playtimeDaysPerWeek}
                        onChange={(e) =>
                          setData((d) => ({
                            ...d,
                            playtimeDaysPerWeek: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-accent h-2 bg-bg-tertiary rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-text-muted mt-1">
                        <span>1 day</span>
                        <span>7 days</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                      <p className="text-sm text-text-secondary">
                        <span className="text-accent font-semibold">
                          {data.playtimeHoursPerDay * data.playtimeDaysPerWeek}h/week
                        </span>{" "}
                        — {data.playtimeHoursPerDay * data.playtimeDaysPerWeek >= 20
                          ? "Excellent training volume. You can make serious progress."
                          : data.playtimeHoursPerDay * data.playtimeDaysPerWeek >= 10
                          ? "Good training volume. Focus and consistency will be key."
                          : "Limited time — we'll maximize every minute with high-impact drills."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Goals */}
              {step === 5 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">What are your goals?</h2>
                      <p className="text-text-secondary text-sm">
                        Select all that apply
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 ${
                          data.goals.includes(goal)
                            ? "border-accent bg-accent/10 text-text-primary"
                            : "border-border bg-bg-secondary text-text-secondary hover:border-border-light"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              data.goals.includes(goal)
                                ? "border-accent bg-accent"
                                : "border-border"
                            }`}
                          >
                            {data.goals.includes(goal) && (
                              <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                          </span>
                          {goal}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                step === 0
                  ? "text-text-muted cursor-not-allowed"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                canProceed()
                  ? "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_30px_rgba(108,92,231,0.3)] hover:scale-105"
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed"
              }`}
            >
              {step === TOTAL_STEPS - 1 ? "Continue to Skill Assessment" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
