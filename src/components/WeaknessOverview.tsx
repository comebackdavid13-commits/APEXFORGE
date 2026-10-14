"use client";

import { motion } from "framer-motion";
import type { SkillRating } from "@/lib/types";
import { weaknessCategories } from "@/lib/weaknesses";

interface WeaknessOverviewProps {
  ratings: SkillRating[];
}

const ratingColors: Record<number, string> = {
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-text-secondary",
  4: "bg-accent-cyan",
  5: "bg-success",
};

const ratingBarColors: Record<number, string> = {
  1: "bg-danger/60",
  2: "bg-warning/60",
  3: "bg-text-secondary/40",
  4: "bg-accent-cyan/60",
  5: "bg-success/60",
};

export function WeaknessOverview({ ratings }: WeaknessOverviewProps) {
  // Group ratings by category
  const categoryAverages = weaknessCategories.map((cat) => {
    const catRatings = ratings.filter((r) => r.category === cat.id);
    const avg =
      catRatings.length > 0
        ? catRatings.reduce((sum, r) => sum + r.rating, 0) / catRatings.length
        : 3;
    return { ...cat, avg, ratings: catRatings };
  });

  const sortedByWeakest = [...categoryAverages].sort((a, b) => a.avg - b.avg);

  return (
    <div className="space-y-4">
      {/* Category bars */}
      {sortedByWeakest.map((cat, i) => {
        const roundedAvg = Math.round(cat.avg);
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-bg-secondary/50 border border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="font-semibold text-sm">{cat.name}</span>
              </div>
              <span className="text-sm font-bold">
                {cat.avg.toFixed(1)}{" "}
                <span className="text-text-muted font-normal">/ 5</span>
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(cat.avg / 5) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`h-full rounded-full ${ratingBarColors[roundedAvg] || ratingBarColors[3]}`}
              />
            </div>
            {/* Individual skills */}
            <div className="mt-3 flex flex-wrap gap-2">
              {cat.ratings.map((r) => (
                <span
                  key={`${r.category}-${r.skill}`}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-bg-tertiary"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${ratingColors[r.rating] || ratingColors[3]}`}
                  />
                  {weaknessCategories
                    .find((c) => c.id === r.category)
                    ?.skills.find((s) => s.id === r.skill)?.name || r.skill}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
