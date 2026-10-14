"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Zap, Check, AlertCircle } from "lucide-react";
import { weaknessCategories } from "@/lib/weaknesses";
import type { SkillRating } from "@/lib/types";

interface WeaknessSelectionProps {
  onComplete: (ratings: SkillRating[]) => void;
}

const ratingLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Needs Work", color: "text-danger" },
  2: { label: "Weak", color: "text-warning" },
  3: { label: "Average", color: "text-text-secondary" },
  4: { label: "Strong", color: "text-accent-cyan" },
  5: { label: "Elite", color: "text-success" },
};

export function WeaknessSelection({ onComplete }: WeaknessSelectionProps) {
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [highlightMissing, setHighlightMissing] = useState(false);

  const category = weaknessCategories[categoryIdx];
  const totalCategories = weaknessCategories.length;
  const isLastCategory = categoryIdx === totalCategories - 1;

  const ratedCount = category.skills.filter(
    (s) => ratings[`${category.id}:${s.id}`] !== undefined
  ).length;
  const totalSkills = category.skills.length;
  const allCategoryRated = ratedCount === totalSkills;
  const missingCount = totalSkills - ratedCount;

  const setRating = (skillId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [`${category.id}:${skillId}`]: rating,
    }));
  };

  // Quick-fill: rate all unrated skills in this category as 3 (Average)
  const fillRemainingAsAverage = () => {
    setRatings((prev) => {
      const next = { ...prev };
      for (const s of category.skills) {
        if (next[`${category.id}:${s.id}`] === undefined) {
          next[`${category.id}:${s.id}`] = 3;
        }
      }
      return next;
    });
  };

  const handleNext = () => {
    if (!allCategoryRated) {
      // Highlight missing skills so the user sees exactly what's left
      setHighlightMissing(true);
      // Scroll to the first unrated skill
      const firstMissing = category.skills.find(
        (s) => ratings[`${category.id}:${s.id}`] === undefined
      );
      if (firstMissing) {
        document
          .getElementById(`skill-${firstMissing.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => setHighlightMissing(false), 1800);
      return;
    }

    if (isLastCategory) {
      const result: SkillRating[] = Object.entries(ratings).map(([key, rating]) => {
        const [cat, skill] = key.split(":");
        return { category: cat, skill, rating };
      });
      onComplete(result);
    } else {
      setCategoryIdx((i) => i + 1);
    }
  };

  const handleBack = () => {
    setCategoryIdx((i) => Math.max(0, i - 1));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
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

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {weaknessCategories.map((cat, i) => {
            const catRated = cat.skills.every(
              (s) => ratings[`${cat.id}:${s.id}`] !== undefined
            );
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryIdx(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  i === categoryIdx
                    ? "bg-accent/20 text-accent-light border border-accent/30"
                    : catRated
                    ? "bg-bg-card text-success border border-success/20"
                    : "bg-bg-card text-text-secondary border border-border hover:border-border-light"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {catRated && <Check className="w-3.5 h-3.5 text-success" />}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={category.id}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Category header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                </div>
                <p className="text-text-secondary">{category.description}</p>
                <p className="text-text-muted text-sm mt-2">
                  Rate each skill honestly — this drives your personalized plan
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-5">
                {category.skills.map((skill) => {
                  const currentRating =
                    ratings[`${category.id}:${skill.id}`] || 0;
                  const isMissing =
                    ratings[`${category.id}:${skill.id}`] === undefined;
                  return (
                    <div
                      key={skill.id}
                      id={`skill-${skill.id}`}
                      className={`p-4 rounded-xl bg-bg-secondary/50 border transition-all duration-300 ${
                        isMissing && highlightMissing
                          ? "border-danger/70 ring-2 ring-danger/40 shadow-[0_0_20px_rgba(255,82,82,0.25)]"
                          : isMissing
                          ? "border-border/50"
                          : "border-success/30"
                      }`}
                    >
                      {isMissing && highlightMissing && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-danger text-xs font-bold mb-2"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Rate this skill to continue
                        </motion.div>
                      )}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">
                            {skill.name}
                          </h3>
                          <p className="text-text-muted text-xs mt-0.5">
                            {skill.description}
                          </p>
                        </div>
                        {currentRating > 0 && (
                          <span
                            className={`text-xs font-semibold whitespace-nowrap ${ratingLabels[currentRating].color}`}
                          >
                            {ratingLabels[currentRating].label}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setRating(skill.id, n)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              currentRating === n
                                ? n <= 2
                                  ? "bg-danger/20 text-danger border border-danger/30"
                                  : n === 3
                                  ? "bg-text-secondary/20 text-text-primary border border-text-secondary/30"
                                  : "bg-accent/20 text-accent-light border border-accent/30"
                                : "bg-bg-tertiary text-text-muted border border-transparent hover:border-border-light hover:text-text-secondary"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted mt-1 px-1">
                        <span>Needs Work</span>
                        <span>Elite</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress + quick fill */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/50">
            <span
              className={`text-xs font-semibold ${
                allCategoryRated ? "text-success" : "text-text-secondary"
              }`}
            >
              {ratedCount}/{totalSkills} rated
              {allCategoryRated && " ✓"}
            </span>
            {!allCategoryRated && (
              <button
                onClick={fillRemainingAsAverage}
                className="text-xs text-accent hover:text-accent-light font-semibold underline underline-offset-2 transition-colors"
              >
                Rate rest as Average (3)
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              disabled={categoryIdx === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                categoryIdx === 0
                  ? "text-text-muted cursor-not-allowed"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs text-text-muted">
              {categoryIdx + 1} / {totalCategories}
            </span>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                allCategoryRated
                  ? "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_30px_rgba(108,92,231,0.3)] hover:scale-105 cursor-pointer"
                  : "bg-bg-tertiary text-text-secondary hover:bg-bg-hover border border-border cursor-pointer"
              }`}
            >
              {!allCategoryRated && (
                <AlertCircle className="w-4 h-4 text-warning" />
              )}
              {isLastCategory
                ? allCategoryRated
                  ? "Generate My Plan"
                  : `${missingCount} skill${missingCount !== 1 ? "s" : ""} left`
                : allCategoryRated
                ? "Next Category"
                : `${missingCount} skill${missingCount !== 1 ? "s" : ""} left`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
