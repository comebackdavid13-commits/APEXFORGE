"use client";

import { useMemo } from "react";

export function SessionPlanner() {
  return useMemo(
    () => (
      <div className="text-center py-12 rounded-2xl bg-bg-card border border-border">
        <p className="text-text-secondary text-sm">
          Session planning has been replaced by the Tournament preparation system.
        </p>
        <p className="text-text-muted text-xs mt-1">
          Go to Tourneys → Create Tournament to build your AI-generated competition prep.
        </p>
      </div>
    ),
    []
  );
}
