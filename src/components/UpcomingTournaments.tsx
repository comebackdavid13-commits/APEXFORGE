"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Users,
  Star,
  Zap,
  Crown,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle,
  Target,
  Loader2,
  DollarSign,
  Timer,
  Flame,
  ChevronRight,
} from "lucide-react";
import { prepGuides } from "@/lib/tournament-data";

interface CustomTournament {
  id: string;
  name: string;
  mode: string;
  startDate: string;
  endDate: string;
  maxGames: number;
  isCash: boolean;
  isPR: boolean;
  targetPlacement: number;
  notes: string | null;
  finalPlacement: number | null;
  pointsEarned: number | null;
  killsEarned: number | null;
  cashEarned: number | null;
  prEarned: number | null;
  resultNotes: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface UpcomingTournamentsProps {
  sessionId: string;
}

const modeIcons: Record<string, React.ReactNode> = {
  solo: <Target className="w-4 h-4 text-yellow-400" />,
  duo: <Users className="w-4 h-4 text-purple-400" />,
  trio: <Users className="w-4 h-4 text-accent-light" />,
  squad: <Users className="w-4 h-4 text-cyan-400" />,
};

// Precise countdown formatter — shows hours/minutes for near-term tournaments
function getCountdown(startDate: string): {
  label: string;
  isToday: boolean;
  isLive: boolean;
  isPast: boolean;
  isHappeningNow: boolean;
  hoursLeft: number;
  minutesLeft: number;
} {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const diff = start - now;

  if (diff < 0) {
    return { label: "Past", isToday: false, isLive: false, isPast: true, isHappeningNow: false, hoursLeft: 0, minutesLeft: 0 };
  }

  const minutesLeft = Math.floor(diff / (1000 * 60));
  const hoursLeft = Math.floor(minutesLeft / 60);
  const daysLeft = Math.floor(hoursLeft / 24);

  if (hoursLeft < 1) {
    return { label: `${minutesLeft}m left`, isToday: true, isLive: false, isPast: false, isHappeningNow: true, hoursLeft, minutesLeft };
  }
  if (hoursLeft < 24) {
    const mins = minutesLeft % 60;
    return {
      label: mins > 0 ? `${hoursLeft}h ${mins}m left` : `${hoursLeft}h left`,
      isToday: true,
      isLive: false,
      isPast: false,
      isHappeningNow: false,
      hoursLeft,
      minutesLeft,
    };
  }
  if (daysLeft === 1) {
    return { label: "Tomorrow", isToday: false, isLive: true, isPast: false, isHappeningNow: false, hoursLeft, minutesLeft };
  }
  return { label: `${daysLeft}d left`, isToday: false, isLive: true, isPast: false, isHappeningNow: false, hoursLeft, minutesLeft };
}

// Format "7 PM" style from a Date
function formatLocalTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function UpcomingTournaments({ sessionId }: UpcomingTournamentsProps) {
  const [tournaments, setTournaments] = useState<CustomTournament[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);

  // Result form state
  const [resultFormId, setResultFormId] = useState<string | null>(null);
  const [finalPlacement, setFinalPlacement] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");
  const [killsEarned, setKillsEarned] = useState("");
  const [cashEarned, setCashEarned] = useState("");
  const [prEarned, setPrEarned] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [savingResult, setSavingResult] = useState(false);

  // Custom form state — date + time as local datetime-local strings
  const defaultStart = useCallback(() => {
    const d = new Date(Date.now() + 86400000 * 3);
    d.setHours(19, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, []);

  const [customName, setCustomName] = useState("");
  const [customMode, setCustomMode] = useState("duo");
  const [startDateTime, setStartDateTime] = useState(defaultStart());
  const [endDateTime, setEndDateTime] = useState(defaultStart());
  const [maxGames, setMaxGames] = useState("10");
  const [isCash, setIsCash] = useState(false);
  const [isPR, setIsPR] = useState(false);
  const [customTarget, setCustomTarget] = useState("50");
  const [customNotes, setCustomNotes] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournament-prep?sessionId=${sessionId}`);
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error("Failed to load tournaments:", err);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
    setLoading(false);

    // Refresh countdowns every 60 seconds
    const timer = setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, [sessionId, load]);

  // Set refreshed data on tick to trigger rerender
  useEffect(() => {
    // Intentionally empty — the interval above re-triggers rerender
  }, [refreshTick]);

  const createCustom = async () => {
    if (!customName.trim() || !startDateTime || !endDateTime) return;
    setRegistering(true);
    try {
      const res = await fetch("/api/tournament-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: customName.trim(),
          mode: customMode,
          startDate: startDateTime, // datetime-local string, parsed as user's local time
          endDate: endDateTime,
          startLocalIso: startDateTime,
          endLocalIso: endDateTime,
          maxGames: parseInt(maxGames) || 10,
          isCash,
          isPR,
          targetPlacement: parseInt(customTarget) || 50,
          notes: customNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.tournament) {
        await load();
        setShowCustomForm(false);
        setCustomName("");
        setCustomNotes("");
        setExpandedTournament(data.tournament.id);
      }
    } catch (err) {
      console.error("Failed to create custom:", err);
    }
    setRegistering(false);
  };

  const deleteTournament = async (id: string) => {
    if (!window.confirm("Remove this tournament from your prep list?")) return;
    await fetch(`/api/tournament-prep?sessionId=${sessionId}&id=${id}`, {
      method: "DELETE",
    }).then(() => load());
  };

  const openResultForm = (t: CustomTournament) => {
    setResultFormId(t.id);
    setFinalPlacement(t.finalPlacement?.toString() ?? "");
    setPointsEarned(t.pointsEarned?.toString() ?? "");
    setKillsEarned(t.killsEarned?.toString() ?? "");
    setCashEarned(t.cashEarned != null ? (t.cashEarned / 100).toString() : "");
    setPrEarned(t.prEarned?.toString() ?? "");
    setResultNotes(t.resultNotes ?? "");
  };

  const saveResult = async () => {
    if (!resultFormId) return;
    setSavingResult(true);
    try {
      await fetch("/api/tournament-prep", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tournamentId: resultFormId,
          finalPlacement: finalPlacement ? parseInt(finalPlacement) : null,
          pointsEarned: pointsEarned ? parseInt(pointsEarned) : null,
          killsEarned: killsEarned ? parseInt(killsEarned) : null,
          cashEarned: cashEarned ? parseFloat(cashEarned) : null,
          prEarned: prEarned ? parseInt(prEarned) : null,
          resultNotes: resultNotes.trim() || null,
        }),
      });
      await load();
      setResultFormId(null);
    } catch (err) {
      console.error("Failed to save result:", err);
    }
    setSavingResult(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Timer className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-gold" />
            Tournament Hub
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Set up your own tournaments — AI builds your prep plan
          </p>
        </div>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all self-start ${
            showCustomForm
              ? "bg-bg-tertiary text-text-secondary"
              : "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_25px_rgba(108,92,231,0.4)]"
          }`}
        >
          {showCustomForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCustomForm ? "Close" : "New Tournament"}
        </button>
      </div>

      {/* Custom tournament form */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 rounded-2xl bg-bg-card border border-border">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5 text-accent" />
                Create Custom Tournament
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Sunday Scrims #5"
                    className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm focus:border-accent/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Mode
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-bg-secondary/50">
                    {(["solo", "duo", "trio", "squad"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setCustomMode(m)}
                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          customMode === m
                            ? "bg-accent text-white"
                            : "text-text-secondary"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" /> Starts (your local time) *
                  </label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Displayed in your local timezone automatically
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" /> Ends (your local time) *
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Timer className="w-3 h-3 inline mr-1" /> Total Games
                  </label>
                  <input
                    type="number"
                    value={maxGames}
                    onChange={(e) => setMaxGames(e.target.value)}
                    placeholder="10"
                    min={1}
                    max={100}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Target Placement
                  </label>
                  <input
                    type="number"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="top 50"
                    min={1}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCash"
                    checked={isCash}
                    onChange={(e) => setIsCash(e.target.checked)}
                    className="w-4 h-4 rounded accent-accent"
                  />
                  <label htmlFor="isCash" className="text-sm font-medium text-text-secondary cursor-pointer flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Cash Prize
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPR"
                    checked={isPR}
                    onChange={(e) => setIsPR(e.target.checked)}
                    className="w-4 h-4 rounded accent-accent"
                  />
                  <label htmlFor="isPR" className="text-sm font-medium text-text-secondary cursor-pointer flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> PR Earned
                  </label>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Notes / Practice Focus
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Entry fragger drills, endgame management, surge timing..."
                  rows={2}
                  className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm resize-none outline-none"
                />
              </div>

              <button
                onClick={createCustom}
                disabled={!customName.trim() || !startDateTime || !endDateTime || registering}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  customName.trim() && startDateTime && endDateTime && !registering
                    ? "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_20px_rgba(108,92,231,0.4)]"
                    : "bg-bg-tertiary text-text-muted cursor-not-allowed"
                }`}
              >
                {registering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create & Generate Prep Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Your custom tournaments */}
      {tournaments.length === 0 ? (
        <div className="text-center py-14 rounded-2xl bg-bg-card border border-border">
          <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">No custom tournaments yet</p>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Create your own tournament (scrims, LAN, LANside, LANscrim, etc.) and the
            AI Coach will generate your personalized prep plan.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Your Tournaments ({tournaments.length})
          </h3>
          <div className="space-y-4">
            {tournaments.map((t) => {
              const isExpanded = expandedTournament === t.id;
              const countdown = getCountdown(t.startDate);
              const guide = prepGuides[t.mode] || prepGuides["duo"];

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    countdown.isToday
                      ? "bg-success/5 border-success/30"
                      : countdown.isPast
                      ? "bg-bg-card/40 border-border"
                      : "bg-bg-card border-border hover:border-border-light"
                  }`}
                >
                  <button
                    onClick={() =>
                      setExpandedTournament(isExpanded ? null : t.id)
                    }
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold ${
                            countdown.isToday
                              ? "bg-success/20 text-success border border-success/30"
                              : countdown.isPast
                              ? "bg-bg-secondary text-text-muted"
                              : countdown.isLive
                              ? "bg-accent/10 text-accent-light"
                              : "bg-bg-secondary"
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold">
                            {countdown.isPast ? "DONE" : countdown.isToday ? "NOW" : countdown.label.split(" ")[0]}
                          </span>
                          <span className="text-base font-black">
                            {countdown.isPast ? "✔" : countdown.isToday ? "⚡" : countdown.isLive ? countdown.label.split(" ")[0] : countdown.label.split(" ")[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-lg">{t.name}</p>
                            {t.isCash && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/20">
                                PR TOURNAMENT
                              </span>
                            )}
                            {t.isPR && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/15 text-accent-light border border-accent/20">
                                PR EARNINGS
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-1">
                            {t.mode.charAt(0).toUpperCase() + t.mode.slice(1)} •{" "}
                            <span className="font-semibold text-text-secondary">
                              {new Date(t.startDate).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at {formatLocalTime(new Date(t.startDate))}
                            </span>{" "}
                            →{" "}
                            {new Date(t.endDate).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {formatLocalTime(new Date(t.endDate))} • {t.maxGames} games • Top{" "}
                            {t.targetPlacement}
                          </p>
                          {t.notes && (
                            <p className="text-xs text-text-secondary italic mt-0.5">“{t.notes}”</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {countdown.isToday && (
                          <span className="text-xs font-bold text-success px-3 py-1 rounded-full bg-success/15 border border-success/20 whitespace-nowrap">
                            ▸ TODAY
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                          {/* Logged result */}
                          {t.completedAt && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-success" />
                                <span className="font-bold text-sm text-success">
                                  Final Result Logged
                                </span>
                                <span className="text-xs text-text-muted ml-auto">
                                  {new Date(t.completedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                <div className="p-2.5 rounded-lg bg-black/20 text-center">
                                  <p className="text-[9px] text-text-muted uppercase font-bold">Place</p>
                                  <p className="font-black text-lg text-gold">
                                    #{t.finalPlacement ?? "—"}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/20 text-center">
                                  <p className="text-[9px] text-text-muted uppercase font-bold">Points</p>
                                  <p className="font-black text-lg">{t.pointsEarned ?? "—"}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/20 text-center">
                                  <p className="text-[9px] text-text-muted uppercase font-bold">Kills</p>
                                  <p className="font-black text-lg text-danger">{t.killsEarned ?? "—"}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/20 text-center">
                                  <p className="text-[9px] text-text-muted uppercase font-bold">PR</p>
                                  <p className="font-black text-lg text-accent-light">
                                    {t.prEarned != null ? `+${t.prEarned}` : "—"}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-black/20 text-center col-span-2 sm:col-span-1">
                                  <p className="text-[9px] text-text-muted uppercase font-bold">Cash</p>
                                  <p className="font-black text-lg text-success">
                                    {t.cashEarned != null && t.cashEarned > 0
                                      ? `$${(t.cashEarned / 100).toFixed(2)}`
                                      : "—"}
                                  </p>
                                </div>
                              </div>
                              {t.resultNotes && (
                                <p className="text-xs text-text-secondary italic mt-3">
                                  “{t.resultNotes}”
                                </p>
                              )}
                            </div>
                          )}

                          {/* Prep guide per mode */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                              <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-accent" />
                                Recommended Prep — {t.mode.charAt(0).toUpperCase() + t.mode.slice(1)}
                              </h4>
                              <p className="text-xs text-text-secondary mb-2">{guide.focus}</p>
                              <ul className="space-y-1 text-xs text-text-secondary">
                                {guide.tips.slice(0, 3).map((tip) => (
                                  <li key={tip} className="flex gap-1.5">
                                    <ChevronRight className="w-3 h-3 text-accent flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                              <h4 className="font-bold text-sm mb-3">
                                General Preparation
                              </h4>
                              <ul className="space-y-1 text-xs text-text-secondary">
                                {prepGuides["general"].tips.slice(0, 3).map((tip) => (
                                  <li key={tip} className="flex gap-1.5">
                                    <ChevronRight className="w-3 h-3 text-gold flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Countdown */}
                          {!countdown.isPast && (
                            <div
                              className={`p-3 rounded-xl border text-sm font-semibold ${
                                countdown.isHappeningNow
                                  ? "bg-gold/10 border-gold/25 text-gold"
                                  : countdown.isToday
                                  ? "bg-success/10 border-success/20 text-success"
                                  : "bg-bg-secondary border-border text-text-secondary"
                              }`}
                            >
                              {countdown.isHappeningNow
                                ? `⚡ Starts in ${countdown.label} — get in the lobby NOW!`
                                : countdown.isToday
                                ? `🔥 Today — starts in ${countdown.label}. Good luck, stay focused, don't tilt.`
                                : countdown.isLive
                                ? `⏳ ${countdown.label}. Train hard.`
                                : `📅 ${countdown.label}. Train hard.`}
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openResultForm(t)}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                t.completedAt
                                  ? "bg-accent/15 text-accent-light hover:bg-accent/25"
                                  : "bg-success/15 text-success border border-success/20 hover:bg-success/25"
                              }`}
                            >
                              <Trophy className="w-3 h-3" />
                              {t.completedAt ? "Edit Result" : "Log Result"}
                            </button>
                            <button
                              onClick={() => deleteTournament(t.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Result-logging modal */}
      <AnimatePresence>
        {resultFormId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setResultFormId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  Log Tournament Result
                </h3>
                <button
                  onClick={() => setResultFormId(null)}
                  className="p-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Final Placement
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={finalPlacement}
                      onChange={(e) => setFinalPlacement(e.target.value)}
                      placeholder="#12"
                      className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Total Points
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={pointsEarned}
                      onChange={(e) => setPointsEarned(e.target.value)}
                      placeholder="156"
                      className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Total Kills
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={killsEarned}
                      onChange={(e) => setKillsEarned(e.target.value)}
                      placeholder="23"
                      className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      <Award className="w-3.5 h-3.5 inline mr-1" />
                      PR Earned
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={prEarned}
                      onChange={(e) => setPrEarned(e.target.value)}
                      placeholder="500"
                      className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                    Cash Won ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={cashEarned}
                    onChange={(e) => setCashEarned(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none focus:border-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    How did it go? (notes)
                  </label>
                  <textarea
                    value={resultNotes}
                    onChange={(e) => setResultNotes(e.target.value)}
                    placeholder="Die out game 1, popped off game 4-5, surge was rough..."
                    rows={3}
                    className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm resize-none outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-border">
                <button
                  onClick={() => setResultFormId(null)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveResult}
                  disabled={savingResult}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-success/80 to-emerald-600/80 text-white hover:shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all disabled:opacity-50"
                >
                  {savingResult ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Save Result
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
