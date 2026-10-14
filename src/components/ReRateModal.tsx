"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Flame, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { weaknessCategories } from "@/lib/weaknesses";
import type { SkillRating } from "@/lib/types";

interface ReRateModalProps {
  currentRatings: SkillRating[];
  onClose: () => void;
  onSave: (ratings: SkillRating[]) => void;
}

const tierLabels: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Weak", color: "text-white", bg: "bg-danger" },
  2: { label: "Needs Work", color: "text-black", bg: "bg-warning" },
  3: { label: "Average", color: "text-black", bg: "bg-text-secondary" },
  4: { label: "Strong", color: "text-black", bg: "bg-accent-cyan" },
  5: { label: "Elite", color: "text-black", bg: "bg-success" },
};

export function ReRateModal({
  currentRatings,
  onClose,
  onSave,
}: ReRateModalProps) {
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const r of currentRatings) map[`${r.category}:${r.skill}`] = r.rating;
    return map;
  });
  const [saving, setSaving] = useState(false);

  // Filter to only categories the user has rated
  const ratedCategories = weaknessCategories.filter((cat) =>
    cat.skills.some((s) => currentRatings.some((r) => r.category === cat.id && r.skill === s.id))
  );

  const totalSteps = ratedCategories.length;
  const currentCategory = ratedCategories[step];
  const categoryProgress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (saving) return;
      if (e.key >= "1" && e.key <= "5" && currentCategory) {
        // Need a current skill in the category
        const firstSkill = currentCategory.skills[0];
        if (firstSkill) {
          setRatings((prev) => ({
            ...prev,
            [`${currentCategory.id}:${firstSkill.id}`]: parseInt(e.key),
          }));
        }
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        if (step > 0) setStep(step - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentCategory, saving]);

  function setRating(skillId: string, value: number) {
    if (!currentCategory) return;
    setRatings((prev) => ({
      ...prev,
      [`${currentCategory.id}:${skillId}`]: value,
    }));
  }

  function nextStep() {
    if (step < totalSteps - 1) setStep(step + 1);
  }
  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  function save() {
    setSaving(true);
    const result: SkillRating[] = Object.entries(ratings)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => {
        const [category, skill] = k.split(":");
        return { category, skill, rating: v };
      });
    onSave(result);
  }

  const totalSkills = weaknessCategories.flatMap((c) => c.skills).length;
  const ratedNow = Object.values(ratings).filter((v) => v > 0).length;
  const progress = totalSkills > 0 ? (ratedNow / totalSkills) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-bg-card border border-border rounded-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-bg-card/95 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-warning" />
              Re-Rate Your Skills
            </h2>
            <p className="text-text-secondary text-xs mt-0.5">
              Update one or more categories. {totalSteps > 0 ? `Step ${step + 1} of ${totalSteps}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global progress */}
        <div className="px-5 pt-4">
          <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-blue"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1">
            {ratedNow}/{totalSkills} skills rated
          </p>
        </div>

        {/* Category selector pills */}
        <div className="px-5 py-3 flex gap-2 overflow-x-auto">
          {ratedCategories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                i === step
                  ? "bg-accent text-white"
                  : "bg-bg-card text-text-secondary border border-border"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Current category content */}
        {currentCategory ? (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{currentCategory.icon}</span>
              <div>
                <h3 className="text-lg font-bold">{currentCategory.name}</h3>
                <p className="text-text-secondary text-xs">
                  {currentCategory.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {currentCategory.skills.map((skill) => {
                const key = `${currentCategory.id}:${skill.id}`;
                const r = ratings[key] || 0;
                return (
                  <div
                    key={skill.id}
                    className="p-4 rounded-xl bg-bg-secondary/40 border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{skill.name}</h4>
                        <p className="text-text-muted text-xs mt-0.5">
                          {skill.description}
                        </p>
                      </div>
                      {r > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${tierLabels[r].bg} ${tierLabels[r].color}`}
                        >
                          {tierLabels[r].label}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRating(skill.id, n)}
                          className={`relative h-12 rounded-xl text-base font-bold transition-all active:scale-95 ${
                            r === n
                              ? `${tierLabels[n].bg} ${tierLabels[n].color} ring-2 ring-white/40 scale-105`
                              : "bg-bg-tertiary text-text-muted hover:bg-bg-hover border border-transparent hover:border-border-light"
                          }`}
                        >
                          {n}
                          {r === n && (
                            <Check className="w-3 h-3 absolute top-1 right-1" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 text-[9px] text-text-muted text-center mt-1">
                      <span>Weak</span>
                      <span>Needs</span>
                      <span>Average</span>
                      <span>Strong</span>
                      <span>Elite</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-text-secondary">
            <p>No categories rated yet. Complete the initial assessment to use this.</p>
          </div>
        )}

        {/* Footer with save */}
        <div className="sticky bottom-0 flex gap-2 p-5 border-t border-border bg-bg-card/95 backdrop-blur">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex-1" />
          {step < totalSteps - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-dark"
            >
              Next Category <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(108,92,231,0.4)] disabled:opacity-50"
            >
              {saving ? <Flame className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              Save Ratings
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
