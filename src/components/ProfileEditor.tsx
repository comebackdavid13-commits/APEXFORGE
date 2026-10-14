"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Award, TrendingUp, Loader2, RotateCcw } from "lucide-react";
import type { OnboardingData } from "@/lib/types";
import { RankTracker } from "./RankTracker";

interface ProfileEditorProps {
  sessionId: string;
  onboarding: OnboardingData;
  onUpdate: (updated: OnboardingData) => void;
  onClose: () => void;
}

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

export function ProfileEditor({
  sessionId,
  onboarding,
  onUpdate,
  onClose,
}: ProfileEditorProps) {
  const [brRank, setBrRank] = useState(onboarding.brRank);
  const [reloadRank, setReloadRank] = useState(onboarding.reloadRank);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    brRank !== onboarding.brRank || reloadRank !== onboarding.reloadRank;

  const handleSave = async () => {
    setSaving(true);

    if (brRank !== onboarding.brRank) {
      await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, mode: "br", rank: brRank }),
      });
    }

    if (reloadRank !== onboarding.reloadRank) {
      await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, mode: "reload", rank: reloadRank }),
      });
    }

    onUpdate({
      ...onboarding,
      brRank,
      reloadRank,
    });

    setSaving(false);
    onClose();
  };

  const brRankIndex = ranks.indexOf(brRank);
  const prevBrIndex = ranks.indexOf(onboarding.brRank);
  const brRankUp = brRankIndex > prevBrIndex;

  const reloadRankIndex = ranks.indexOf(reloadRank);
  const prevReloadIndex = ranks.indexOf(onboarding.reloadRank);
  const reloadRankUp = reloadRankIndex > prevReloadIndex;

  return (
    <AnimatePresence>
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
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-card border border-border rounded-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-bg-card/95 backdrop-blur">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Update Your Rank
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Rank selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border">
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                  <Award className="w-4 h-4 text-accent" />
                  Battle Royale Rank
                </label>
                <select
                  value={brRank}
                  onChange={(e) => setBrRank(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all"
                >
                  {ranks.map((r) => (
                    <option key={`br-${r}`} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {brRank !== onboarding.brRank && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 flex items-center gap-1.5 text-xs ${
                      brRankUp ? "text-success" : "text-warning"
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${!brRankUp && "rotate-180"}`}
                    />
                    {brRankUp ? "Rank up!" : "Rank change"} {onboarding.brRank} →{" "}
                    {brRank}
                  </motion.div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border">
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                  <Award className="w-4 h-4 text-accent-cyan" />
                  Reload Rank
                </label>
                <select
                  value={reloadRank}
                  onChange={(e) => setReloadRank(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent/50 transition-all"
                >
                  {ranks.map((r) => (
                    <option key={`reload-${r}`} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {reloadRank !== onboarding.reloadRank && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 flex items-center gap-1.5 text-xs ${
                      reloadRankUp ? "text-success" : "text-warning"
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${!reloadRankUp && "rotate-180"}`}
                    />
                    {reloadRankUp ? "Rank up!" : "Rank change"}{" "}
                    {onboarding.reloadRank} → {reloadRank}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Rank tracker graph */}
            <RankTracker
              sessionId={sessionId}
              brRank={brRank}
              reloadRank={reloadRank}
            />

            {/* Info */}
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-sm text-text-secondary">
                💡 Update your rank whenever you rank up or down. We track every
                change so you can see your progress over time. Use the reset
                button when a new season starts.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex gap-3 p-5 border-t border-border bg-bg-card/95 backdrop-blur">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                hasChanges && !saving
                  ? "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_20px_rgba(108,92,231,0.4)]"
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed"
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
