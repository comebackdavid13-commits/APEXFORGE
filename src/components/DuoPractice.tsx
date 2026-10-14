"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Copy,
  Check,
  Target,
  Sparkles,
  Calendar,
  Timer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Save,
  X,
  AlertCircle,
  Swords,
} from "lucide-react";
import {
  duoPracticeMaps,
  getDuoPlanForSkillLevel,
  duoCategoryLabels,
  duoRoles,
  getTodayDuoPlan,
  getWeeklyDuoPlan,
  type DuoMapCategory,
  type DuoPracticeMap,
  type DayPlan,
} from "@/lib/duo-data";
import { weaknessCategories } from "@/lib/weaknesses";
import type { SkillRating } from "@/lib/types";

interface DuoPracticeProps {
  sessionId: string;
  onboarding: {
    epicName?: string;
    brRank?: string;
    reloadRank?: string;
    peakBrRank?: string;
    peakReloadRank?: string;
    inputDevice?: "kbm" | "controller";
    playtimeHoursPerDay?: number;
    playtimeDaysPerWeek?: number;
    goals?: string[];
  };
  currentRatings: SkillRating[];
}

interface PlayerSetup {
  name: string;
  role: "IGL" | "Fragger";
  ratings: SkillRating[];
}

// ── Auto-assign duo roles: ALWAYS 1 IGL + 1 Fragger ──
function autoAssignRole(
  ratings: SkillRating[],
  preferredExcluded: "IGL" | "Fragger" | null = null
): "IGL" | "Fragger" {
  if (preferredExcluded === "IGL") return "Fragger";
  if (preferredExcluded === "Fragger") return "IGL";
  if (ratings.length === 0) return "Fragger";

  const cats: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const r of ratings) {
    cats[r.category] = (cats[r.category] || 0) + r.rating;
    counts[r.category] = (counts[r.category] || 0) + 1;
  }
  for (const k of Object.keys(cats)) cats[k] /= counts[k] || 1;

  const macroScore = (cats["game-sense"] || 0) + (cats["endgame"] || 0) + (cats["offspawn"] || 0);
  const fragScore = (cats["aim"] || 0) + (cats["fighting"] || 0) + (cats["mechanics"] || 0);

  if (macroScore >= fragScore) return "IGL";
  return "Fragger";
}

const playerDefaults = {
  IGL: {
    role: "IGL" as const,
    description: duoRoles.IGL,
    accent: "text-purple-400",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  Fragger: {
    role: "Fragger" as const,
    description: duoRoles.Fragger,
    accent: "text-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

function useAvg(ratings: SkillRating[]): number {
  return useMemo(
    () =>
      ratings.length > 0
        ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
        : 0,
    [ratings]
  );
}

export function DuoPractice({ sessionId: _sessionId, onboarding, currentRatings }: DuoPracticeProps) {
  // Duo = 1 IGL + 1 Fragger. P1 defaults to Fragger, P2 defaults to IGL.
  const [p1, setP1] = useState<PlayerSetup>(() => ({
    name: onboarding.epicName || "Player 1",
    role: "Fragger" as const,
    ratings: currentRatings,
  }));
  const [p2, setP2] = useState<PlayerSetup>(() => ({
    name: "Your Duo",
    role: "IGL" as const,
    ratings: [],
  }));
  const [editing, setEditing] = useState<null | "p1" | "p2">(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DuoMapCategory | "all">("all");

  const p1Avg = useAvg(p1.ratings);
  const p2Avg = useAvg(p2.ratings);
  const teamAvg = (p1Avg + p2Avg) / 2;

  // GUARANTEE: a duo must be 1 IGL + 1 Fragger. If both ever match, swap p2.
  useEffect(() => {
    if (p1.role === p2.role) {
      setP2((prev) => ({
        ...prev,
        role: p1.role === "Fragger" ? ("IGL" as const) : ("Fragger" as const),
      }));
    }
  }, [p1.role, p2.role]);

  const todayPlan = useMemo(
    () => getTodayDuoPlan(teamAvg, p1.role, p2.role),
    [teamAvg, p1.role, p2.role]
  );
  const [showWeek, setShowWeek] = useState(false);
  const weekPlan = useMemo(
    () => getWeeklyDuoPlan(teamAvg, p1.role, p2.role),
    [teamAvg, p1.role, p2.role]
  );
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const recommendedMaps = useMemo(() => getDuoPlanForSkillLevel(teamAvg), [teamAvg]);

  const filteredMaps = useMemo(
    () =>
      selectedCategory === "all"
        ? recommendedMaps
        : recommendedMaps.filter((m) => m.category === selectedCategory),
    [recommendedMaps, selectedCategory]
  );

  const onCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Duo Practice Hub
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            1 IGL + 1 Fragger — daily plan, maps, role split
          </p>
        </div>
        <button
          onClick={() => {
            const p1Role = autoAssignRole(p1.ratings);
            const p2Role = p1Role === "Fragger" ? "IGL" : "Fragger";
            setP1((p) => ({ ...p, role: p1Role }));
            setP2((p) => ({ ...p, role: p2Role }));
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent-light text-xs font-bold border border-accent/20 hover:bg-accent/20 transition-all self-start"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Assign Roles
        </button>
      </div>

      {/* Today's Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-blue/5 border border-accent/20"
      >
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-accent-light tracking-wider">
                {todayPlan.day} Plan
              </p>
              <h3 className="text-lg font-bold leading-tight">{todayPlan.focus}</h3>
            </div>
          </div>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Timer className="w-3 h-3" /> {todayPlan.duration}
          </span>
        </div>
        <p className="text-text-secondary text-sm mb-4">{todayPlan.why}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-black/15 border border-border/40">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-2">Drills</p>
            <ol className="space-y-1.5 text-sm">
              {todayPlan.drills.map((d, i) => (
                <li key={i} className="flex gap-2 text-text-secondary">
                  <span className="text-accent-light font-bold">{i + 1}.</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="p-3 rounded-xl bg-black/15 border border-border/40">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-2">Role Focus Today</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 h-fit flex-shrink-0">IGL</span>
                <span className="text-text-secondary text-xs leading-snug">{todayPlan.roleFocus.IGL}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 h-fit flex-shrink-0">FRG</span>
                <span className="text-text-secondary text-xs leading-snug">{todayPlan.roleFocus.Fragger}</span>
              </div>
            </div>
          </div>
        </div>
        {todayPlan.recommendedMaps.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-2">Today's Maps</p>
            <div className="flex flex-wrap gap-2">
              {todayPlan.recommendedMaps.map((mapId) => {
                const map = duoPracticeMaps.find((m) => m.id === mapId);
                if (!map) return null;
                return (
                  <button
                    key={mapId}
                    onClick={() => onCopy(map.mapCode)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-bg-secondary border border-border hover:border-accent/40 transition-colors flex items-center gap-2"
                  >
                    <span>{duoCategoryLabels[map.category].icon}</span>
                    <span className="font-medium">{map.name}</span>
                    <span className="font-mono text-text-muted">{map.mapCode}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowWeek(!showWeek)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-bg-secondary text-text-secondary hover:bg-bg-hover border border-border"
        >
          {showWeek ? "Hide" : "Show"} Full Week
          {showWeek ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showWeek && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 space-y-2"
          >
            {weekPlan.map((day) => {
              const isExpanded = expandedDay === day.day;
              return (
                <button
                  key={day.day}
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  className="w-full p-3 rounded-xl bg-black/15 border border-border/40 text-left hover:bg-black/25 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={"text-[10px] font-bold px-2 py-0.5 rounded " + (day.day === todayPlan.day ? "bg-accent text-white" : "bg-bg-tertiary text-text-muted")}>
                        {day.day.slice(0, 3)}
                      </span>
                      <span className="text-sm font-semibold truncate">{day.focus}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />}
                  </div>
                  {isExpanded && (
                    <div className="mt-2 text-xs text-text-secondary space-y-1">
                      <p className="text-text-muted">{day.why}</p>
                      <ol className="list-decimal list-inside space-y-0.5">
                        {day.drills.slice(0, 3).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Player setup cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PlayerCard
          player={p1}
          isEditing={editing === "p1"}
          onEdit={() => setEditing("p1")}
          onClose={() => setEditing(null)}
          onSave={(name, role, ratings) => {
            setP1({ name, role, ratings });
            // Force the OPPOSITE role on p2 (1 IGL + 1 Fragger rule)
            setP2((prev) => ({ ...prev, role: role === "Fragger" ? "IGL" : "Fragger" }));
            setEditing(null);
          }}
          isMainPlayer
        />
        <PlayerCard
          player={p2}
          isEditing={editing === "p2"}
          onEdit={() => setEditing("p2")}
          onClose={() => setEditing(null)}
          onSave={(name, role, ratings) => {
            setP2({ name, role, ratings });
            setP1((prev) => ({ ...prev, role: role === "Fragger" ? "IGL" : "Fragger" }));
            setEditing(null);
          }}
        />
      </div>

      {/* Team summary */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Team Avg</p>
            <p className="text-2xl font-black text-accent-light">{teamAvg.toFixed(1)}/5</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{p1.name} ({p1.role[0]})</p>
            <p className="text-2xl font-black text-purple-400">{p1Avg.toFixed(1)}/5</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{p2.name} ({p2.role[0]})</p>
            <p className="text-2xl font-black text-red-400">{p2Avg.toFixed(1)}/5</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Maps for You</p>
            <p className="text-2xl font-black text-success">{recommendedMaps.length}</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (selectedCategory === "all" ? "bg-accent text-white" : "bg-bg-card text-text-secondary border border-border")}
        >
          All ({recommendedMaps.length})
        </button>
        {Object.entries(duoCategoryLabels).map(([key, val]) => {
          const count = recommendedMaps.filter((m) => m.category === (key as DuoMapCategory)).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as DuoMapCategory)}
              className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (selectedCategory === key ? "bg-accent text-white" : "bg-bg-card text-text-secondary border border-border")}
            >
              {val.icon} {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Map list */}
      <div className="space-y-3">
        {filteredMaps.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-bg-card border border-dashed border-border">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm">
              Rate more skills to unlock recommended maps
            </p>
          </div>
        ) : (
          filteredMaps.map((map) => (
            <MapCard key={map.id} map={map} copiedCode={copiedCode} onCopy={onCopy} />
          ))
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <EditPlayerModal
            initial={editing === "p1" ? p1 : p2}
            onClose={() => setEditing(null)}
            onSave={(name, role, ratings) => {
              if (editing === "p1") {
                setP1({ name, role, ratings });
                setP2((prev) => ({ ...prev, role: role === "Fragger" ? "IGL" : "Fragger" }));
              } else {
                setP2({ name, role, ratings });
                setP1((prev) => ({ ...prev, role: role === "Fragger" ? "IGL" : "Fragger" }));
              }
              setEditing(null);
            }}
            isMainPlayer={editing === "p1"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlayerCard({
  player,
  isEditing,
  onEdit,
  onClose: _onClose,
  onSave,
  isMainPlayer,
}: {
  player: PlayerSetup;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSave: (name: string, role: "IGL" | "Fragger", ratings: SkillRating[]) => void;
  isMainPlayer?: boolean;
}) {
  const cfg = playerDefaults[player.role];
  const avg = useAvg(player.ratings);
  const weakest =
    player.ratings.length > 0
      ? [...player.ratings].sort((a, b) => a.rating - b.rating).slice(0, 2)
      : [];

  return (
    <div
      className={`p-5 rounded-2xl border ${
        isMainPlayer
          ? "bg-gradient-to-br from-accent/10 to-accent-blue/5 border-accent/30"
          : "bg-bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
            {isMainPlayer ? "You" : "Duo Partner"}
          </p>
          <h3 className="text-lg font-bold">{player.name}</h3>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${cfg.badge}`}>
          {player.role}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-black">{avg.toFixed(1)}</span>
        <span className="text-text-muted text-sm">avg / 5</span>
        <span className="text-text-muted text-xs ml-auto">
          {player.ratings.length} rated
        </span>
      </div>

      {weakest.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">
            Weakest areas
          </p>
          <div className="flex flex-wrap gap-1">
            {weakest.map((s) => (
              <span
                key={`${s.category}-${s.skill}`}
                className="text-[10px] px-2 py-0.5 rounded bg-bg-secondary text-text-secondary"
              >
                {s.skill.replace(/-/g, " ")} ({s.rating})
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-text-secondary italic mb-3">{cfg.description}</p>

      <button
        onClick={onEdit}
        className="w-full py-2 rounded-xl text-xs font-semibold bg-bg-secondary text-text-primary hover:bg-bg-hover border border-border transition-colors"
      >
        Edit {isMainPlayer ? "your" : "partner's"} skills
      </button>
    </div>
  );
}

function MapCard({
  map,
  copiedCode,
  onCopy,
}: {
  map: DuoPracticeMap;
  copiedCode: string | null;
  onCopy: (code: string) => void;
}) {
  const cat = duoCategoryLabels[map.category];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-bg-card border border-border hover:border-accent/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent/15 text-accent-light border border-accent/20">
              {cat.icon} {cat.label}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                map.difficulty === "beginner"
                  ? "bg-green-500/15 text-green-400"
                  : map.difficulty === "intermediate"
                  ? "bg-yellow-500/15 text-yellow-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {map.difficulty}
            </span>
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Timer className="w-3 h-3" /> {map.duration}
            </span>
          </div>
          <h3 className="font-bold text-lg mb-1">{map.name}</h3>
          <p className="text-text-secondary text-sm">{map.description}</p>
        </div>
        <button
          onClick={() => onCopy(map.mapCode)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border hover:border-accent/40 hover:bg-accent/10 transition-all self-start flex-shrink-0"
        >
          <span className="font-mono text-sm font-bold">{map.mapCode}</span>
          {copiedCode === map.mapCode ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {map.focusSkills.map((s) => (
          <span
            key={s}
            className="text-[10px] px-2 py-0.5 rounded bg-accent/5 text-accent-light border border-accent/10"
          >
            {s}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function EditPlayerModal({
  initial,
  onClose,
  onSave,
  isMainPlayer,
}: {
  initial: PlayerSetup;
  onClose: () => void;
  onSave: (name: string, role: "IGL" | "Fragger", ratings: SkillRating[]) => void;
  isMainPlayer?: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const [role, setRole] = useState<"IGL" | "Fragger">(initial.role);
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const r of initial.ratings) map[`${r.category}:${r.skill}`] = r.rating;
    return map;
  });
  const [step, setStep] = useState<"basic" | "ratings">("basic");

  const total = weaknessCategories.flatMap((c) => c.skills).length;
  const ratedCount = Object.keys(ratings).length;

  function toggleRating(key: string, value: number) {
    setRatings((r) => ({ ...r, [key]: r[key] === value ? 0 : value }));
  }

  function save() {
    const finalRatings: SkillRating[] = Object.entries(ratings)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => {
        const [category, skill] = k.split(":");
        return { category, skill, rating: v };
      });
    onSave(name, role, finalRatings);
  }

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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-card border border-border rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-bg-card/95 backdrop-blur">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            {isMainPlayer ? "Edit Your Profile" : "Edit Duo Partner"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "basic" ? (
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Their Epic username"
                className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm focus:border-accent/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(["IGL", "Fragger"] as const).map((r) => {
                  const cfg = playerDefaults[r];
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        role === r
                          ? `${cfg.badge} ring-2 ring-accent/30`
                          : "bg-bg-secondary text-text-secondary border-border"
                      }`}
                    >
                      <p className="font-bold text-sm">{r}</p>
                      <p className="text-[10px] opacity-70 mt-0.5 line-clamp-2">{cfg.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setStep("ratings")}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-dark"
            >
              Rate skills ({ratedCount > 0 ? `${ratedCount} already` : "next"})
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-secondary">
                Rate as many as you want.
              </p>
              <span className="text-xs font-bold text-accent">
                {ratedCount}/{total}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {weaknessCategories.map((cat) => (
                <div key={cat.id} className="p-3 rounded-xl bg-bg-secondary/40 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-semibold text-sm">{cat.name}</span>
                  </div>
                  <div className="space-y-2">
                    {cat.skills.map((s) => {
                      const key = `${cat.id}:${s.id}`;
                      const r = ratings[key] || 0;
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary flex-1 truncate">
                            {s.name}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => toggleRating(key, n)}
                                className={`w-7 h-7 rounded text-[10px] font-bold transition-all ${
                                  r === n
                                    ? n <= 2
                                      ? "bg-danger text-white"
                                      : n === 3
                                      ? "bg-text-secondary text-bg-card"
                                      : "bg-accent text-white"
                                    : "bg-bg-tertiary text-text-muted hover:bg-bg-hover"
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
                </div>
              ))}
            </div>
            <button
              onClick={save}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white font-bold hover:shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all"
            >
              Save Player
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
