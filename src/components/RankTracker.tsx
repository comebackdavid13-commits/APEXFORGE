"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

interface RankHistoryEntry {
  id: string;
  mode: "br" | "reload";
  rank: string;
  recordedAt: string;
}

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

interface RankTrackerProps {
  sessionId: string;
  brRank: string;
  reloadRank: string;
  onRankChange?: () => void;
}

export function RankTracker({
  sessionId,
  brRank,
  reloadRank,
  onRankChange,
}: RankTrackerProps) {
  const [history, setHistory] = useState<RankHistoryEntry[]>([]);
  const [mode, setMode] = useState<"br" | "reload">("br");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/rank?sessionId=${sessionId}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error("Failed to load rank history:", err);
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const modeHistory = useMemo(
    () =>
      history
        .filter((h) => h.mode === mode)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [history, mode]
  );

  const currentRank = mode === "br" ? brRank : reloadRank;

  const handleReset = async () => {
    if (!confirm(`Reset your ${mode.toUpperCase()} rank history? This will log a reset to Unranked.`)) return;
    try {
      await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, mode, rank: "Unranked" }),
      });
      const res = await fetch(`/api/rank?sessionId=${sessionId}`);
      const data = await res.json();
      setHistory(data.history || []);
      onRankChange?.();
    } catch (err) {
      console.error("Failed to reset rank:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const hasHistory = modeHistory.length > 0;
  const currentRankIndex = rankOrder.indexOf(currentRank);

  // Build SVG chart points
  const width = 100;
  const height = 40;
  const padding = 6;
  const chartData = modeHistory.map((h, i) => {
    const rankIndex = rankOrder.indexOf(h.rank);
    return {
      x: modeHistory.length === 1 ? 50 : padding + (i / (modeHistory.length - 1)) * (width - padding * 2),
      y: height - padding - (rankIndex / (rankOrder.length - 1)) * (height - padding * 2),
      rank: h.rank,
      date: new Date(h.recordedAt).toLocaleDateString(),
    };
  });

  const pathD = chartData
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="rounded-2xl bg-bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Rank Progress
          </h3>
          <p className="text-text-secondary text-xs mt-0.5">
            Track your rank climb over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("br")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "br"
                ? "bg-accent text-white"
                : "bg-bg-secondary text-text-secondary"
            }`}
          >
            BR
          </button>
          <button
            onClick={() => setMode("reload")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "reload"
                ? "bg-accent-cyan text-white"
                : "bg-bg-secondary text-text-secondary"
            }`}
          >
            Reload
          </button>
        </div>
      </div>

      {/* Current rank display */}
      <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-bg-secondary/50">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
          style={{
            backgroundColor: `${rankColors[currentRank]}20`,
            color: rankColors[currentRank],
            border: `1px solid ${rankColors[currentRank]}40`,
          }}
        >
          {currentRank.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-xs text-text-muted uppercase tracking-wider">
            Current {mode.toUpperCase()} Rank
          </p>
          <p className="text-xl font-bold" style={{ color: rankColors[currentRank] }}>
            {currentRank}
          </p>
        </div>
        {modeHistory.length > 1 && (
          <div className="text-right">
            <p className="text-xs text-text-muted">Peak</p>
            <p className="font-bold text-gold">
              {
                modeHistory.reduce<RankHistoryEntry>(
                  (peak, h) =>
                    rankOrder.indexOf(h.rank) > rankOrder.indexOf(peak.rank) ? h : peak,
                  modeHistory[0]
                ).rank
              }
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      {hasHistory ? (
        <div className="mb-5">
          <div className="relative h-40 bg-bg-secondary/30 rounded-xl border border-border overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={0}
                  y1={height - padding - t * (height - padding * 2)}
                  x2={width}
                  y2={height - padding - t * (height - padding * 2)}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.3"
                />
              ))}
              {/* Line */}
              {chartData.length > 1 && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={rankColors[currentRank]}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Points */}
              {chartData.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="1.4"
                    fill={rankColors[p.rank]}
                    stroke="white"
                    strokeWidth="0.3"
                  />
                </g>
              ))}
            </svg>

            {/* Hover labels */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-text-muted">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </div>

          {/* Rank history list */}
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {[...modeHistory].reverse().slice(0, 10).map((h, i, arr) => {
              const prev = arr[i + 1];
              const moved =
                prev && rankOrder.indexOf(h.rank) !== rankOrder.indexOf(prev.rank)
                  ? rankOrder.indexOf(h.rank) > rankOrder.indexOf(prev.rank)
                    ? "up"
                    : "down"
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
                    <span className="font-medium">{h.rank}</span>
                    {moved && (
                      <span
                        className={`text-[10px] font-bold ${
                          moved === "up" ? "text-success" : "text-danger"
                        }`}
                      >
                        {moved === "up" ? "▲ RANK UP" : "▼ RANK DOWN"}
                      </span>
                    )}
                  </div>
                  <span className="text-text-muted">
                    {new Date(h.recordedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 mb-5 rounded-xl bg-bg-secondary/30 border border-dashed border-border">
          <TrendingUp className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-secondary text-sm">No rank history yet</p>
          <p className="text-text-muted text-xs mt-1">
            Update your rank to start tracking progress
          </p>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary bg-bg-secondary hover:bg-danger/10 hover:text-danger border border-border hover:border-danger/30 transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset {mode.toUpperCase()} Rank (New Season)
      </button>
    </div>
  );
}
