"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Plus,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Trash2,
  Copy,
  Check,
  Clock,
  X,
  Save,
  Loader2,
  Timer,
  SkipForward,
} from "lucide-react";
import { defaultWarmupRoutines, type WarmupRoutine, type WarmupStep } from "@/lib/fortnite-data";
import {
  playStepComplete,
  playStepSkip,
  playStartRoutine,
  playRoutineComplete,
  playClick,
} from "@/lib/sounds";

interface WarmupBuilderProps {
  sessionId: string;
}

interface SavedRoutine extends WarmupRoutine {
  id: string;
}

export function WarmupBuilder({ sessionId }: WarmupBuilderProps) {
  const [routines, setRoutines] = useState<SavedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<WarmupRoutine | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Builder state
  const [builderName, setBuilderName] = useState("");
  const [builderSteps, setBuilderSteps] = useState<WarmupStep[]>([]);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom routines
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/warmup?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.routines) {
          setRoutines(data.routines.map((r: { id: string; name: string; totalDuration: number; type: string; description: string; steps: WarmupStep[] }) => ({
            ...r,
            steps: r.steps as WarmupStep[],
          })));
        }
      } catch (err) {
        console.error("Failed to load routines:", err);
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((t) => t - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      // Move to next step
      if (activeRoutine && activeStepIndex < activeRoutine.steps.length - 1) {
        playStepComplete();
        setActiveStepIndex((i) => i + 1);
        setTimeRemaining(activeRoutine.steps[activeStepIndex + 1].duration * 60);
      } else {
        // Routine complete
        playRoutineComplete();
        setIsRunning(false);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeRemaining, activeRoutine, activeStepIndex]);

  const startRoutine = (routine: WarmupRoutine) => {
    playStartRoutine();
    setActiveRoutine(routine);
    setActiveStepIndex(0);
    setTimeRemaining(routine.steps[0].duration * 60);
    setIsRunning(true);
  };

  const pauseResume = () => {
    playClick();
    setIsRunning((r) => !r);
  };

  const resetRoutine = () => {
    if (activeRoutine) {
      setActiveStepIndex(0);
      setTimeRemaining(activeRoutine.steps[0].duration * 60);
      setIsRunning(false);
    }
  };

  const skipStep = () => {
    playStepSkip();
    if (activeRoutine && activeStepIndex < activeRoutine.steps.length - 1) {
      setActiveStepIndex((i) => i + 1);
      setTimeRemaining(activeRoutine.steps[activeStepIndex + 1].duration * 60);
    }
  };

  const exitRoutine = () => {
    setActiveRoutine(null);
    setIsRunning(false);
    setActiveStepIndex(0);
    setTimeRemaining(0);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addStep = () => {
    setBuilderSteps((s) => [
      ...s,
      {
        id: `custom-${Date.now()}`,
        name: "",
        duration: 5,
        description: "",
        focus: "",
      },
    ]);
  };

  const updateStep = (index: number, updates: Partial<WarmupStep>) => {
    setBuilderSteps((s) =>
      s.map((step, i) => (i === index ? { ...step, ...updates } : step))
    );
  };

  const removeStep = (index: number) => {
    setBuilderSteps((s) => s.filter((_, i) => i !== index));
  };

  const saveCustomRoutine = async () => {
    if (!builderName.trim() || builderSteps.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/warmup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: builderName,
          type: "custom",
          description: `Custom ${builderSteps.reduce((sum, s) => sum + s.duration, 0)} min routine`,
          steps: builderSteps,
        }),
      });
      const data = await res.json();
      if (data.routine) {
        setRoutines((r) => [...r, { ...data.routine, steps: data.routine.steps }]);
        setShowBuilder(false);
        setBuilderName("");
        setBuilderSteps([]);
      }
    } catch (err) {
      console.error("Failed to save routine:", err);
    }
    setSaving(false);
  };

  const deleteRoutine = async (routineId: string) => {
    try {
      await fetch(`/api/warmup?routineId=${routineId}`, { method: "DELETE" });
      setRoutines((r) => r.filter((routine) => routine.id !== routineId));
    } catch (err) {
      console.error("Failed to delete routine:", err);
    }
  };

  // Active routine view
  if (activeRoutine) {
    const currentStep = activeRoutine.steps[activeStepIndex];
    const progress = ((activeRoutine.steps.length - activeStepIndex - 1 + (1 - timeRemaining / (currentStep.duration * 60))) / activeRoutine.steps.length) * 100;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{activeRoutine.name}</h2>
            <p className="text-text-secondary text-sm">
              Step {activeStepIndex + 1} of {activeRoutine.steps.length}
            </p>
          </div>
          <button
            onClick={exitRoutine}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent-blue"
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Current step */}
        <motion.div
          key={activeStepIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card border border-border rounded-2xl p-8 text-center mb-6"
        >
          <div className="text-6xl font-bold gradient-text mb-4">
            {formatTime(timeRemaining)}
          </div>
          <h3 className="text-2xl font-bold mb-2">{currentStep.name}</h3>
          <p className="text-text-secondary mb-4">{currentStep.description}</p>
          {currentStep.mapCode && (
            <button
              onClick={() => copyCode(currentStep.mapCode!)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <span className="font-mono">{currentStep.mapCode}</span>
              {copiedCode === currentStep.mapCode ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          <div className="mt-4 text-sm text-text-muted">
            Focus: {currentStep.focus}
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetRoutine}
            className="p-3 rounded-xl bg-bg-secondary hover:bg-bg-hover transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={pauseResume}
            className="p-4 rounded-xl bg-accent text-white hover:bg-accent-dark transition-colors"
          >
            {isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={skipStep}
            disabled={activeStepIndex >= activeRoutine.steps.length - 1}
            className="p-3 rounded-xl bg-bg-secondary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Step list */}
        <div className="mt-8 space-y-2">
          {activeRoutine.steps.map((step, i) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                i === activeStepIndex
                  ? "bg-accent/10 border border-accent/30"
                  : i < activeStepIndex
                  ? "bg-success/5 text-text-muted"
                  : "bg-bg-secondary/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < activeStepIndex
                    ? "bg-success text-white"
                    : i === activeStepIndex
                    ? "bg-accent text-white"
                    : "bg-bg-tertiary"
                }`}
              >
                {i < activeStepIndex ? "✓" : i + 1}
              </div>
              <span className="flex-1 text-sm">{step.name}</span>
              <span className="text-xs text-text-muted">{step.duration}m</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-accent" />
            Warm-Up Routines
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Pre-built and custom routines with timers
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showBuilder
              ? "bg-bg-tertiary text-text-secondary"
              : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          {showBuilder ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showBuilder ? "Cancel" : "Create Custom"}
        </button>
      </div>

      {/* Builder */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 rounded-2xl bg-bg-card border border-border">
              <h3 className="font-semibold mb-4">Create Custom Routine</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Routine Name
                </label>
                <input
                  type="text"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="e.g., My Pre-Ranked Warm-Up"
                  className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm"
                />
              </div>

              <div className="space-y-3 mb-4">
                {builderSteps.map((step, i) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-xl bg-bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) =>
                              updateStep(i, { name: e.target.value })
                            }
                            placeholder="Step name"
                            className="px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={step.duration}
                              onChange={(e) =>
                                updateStep(i, {
                                  duration: parseInt(e.target.value) || 1,
                                })
                              }
                              min={1}
                              max={60}
                              className="w-20 px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm"
                            />
                            <span className="text-text-muted text-sm">min</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) =>
                            updateStep(i, { description: e.target.value })
                          }
                          placeholder="Description"
                          className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={step.mapCode || ""}
                            onChange={(e) =>
                              updateStep(i, { mapCode: e.target.value })
                            }
                            placeholder="Map code (optional)"
                            className="px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm font-mono"
                          />
                          <input
                            type="text"
                            value={step.focus}
                            onChange={(e) =>
                              updateStep(i, { focus: e.target.value })
                            }
                            placeholder="Focus area"
                            className="px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeStep(i)}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addStep}
                className="w-full py-2 rounded-xl border border-dashed border-border text-text-muted hover:text-text-primary hover:border-accent/50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Step
              </button>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={saveCustomRoutine}
                  disabled={!builderName.trim() || builderSteps.length === 0 || saving}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    builderName.trim() && builderSteps.length > 0 && !saving
                      ? "bg-accent text-white hover:bg-accent-dark"
                      : "bg-bg-tertiary text-text-muted cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Routine
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default routines */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Pre-Built Routines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultWarmupRoutines.map((routine) => (
            <motion.div
              key={routine.id}
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => startRoutine(routine)}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-md ${
                    routine.type === "quick"
                      ? "bg-success/10 text-success"
                      : routine.type === "standard"
                      ? "bg-accent/10 text-accent"
                      : "bg-gold/10 text-gold"
                  }`}
                >
                  {routine.type}
                </span>
                <div className="flex items-center gap-1 text-text-muted text-sm">
                  <Timer className="w-3 h-3" />
                  {routine.totalDuration}m
                </div>
              </div>
              <h4 className="font-semibold mb-1">{routine.name}</h4>
              <p className="text-text-secondary text-sm mb-3">
                {routine.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {routine.steps.length} steps
                </span>
                <button className="flex items-center gap-1 text-accent text-sm font-medium hover:text-accent-light">
                  Start <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom routines */}
      {routines.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Your Custom Routines
          </h3>
          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{routine.name}</h4>
                    <p className="text-xs text-text-muted">
                      {routine.steps.length} steps • {routine.totalDuration}m
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startRoutine(routine)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors"
                  >
                    <Play className="w-4 h-4" /> Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
