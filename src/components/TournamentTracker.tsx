"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Users,
  Target,
  DollarSign,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Medal,
  TrendingUp,
  Star,
  Crown,
} from "lucide-react";

interface TournamentEntry {
  id: string;
  name: string;
  type: string;
  date: string;
  placement: number | null;
  totalTeams: number | null;
  kills: number | null;
  points: number | null;
  pr: number | null;
  earnings: number | null;
  teammates: string[] | null;
  notes: string | null;
}

interface TournamentTrackerProps {
  sessionId: string;
}

const tournamentTypes = [
  { id: "cash-cup", label: "Cash Cup", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { id: "fncs", label: "FNCS", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { id: "tournament", label: "Tournament", color: "text-accent-light bg-accent/10 border-accent/20" },
  { id: "quali", label: "Quali Match", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
];

export function TournamentTracker({ sessionId }: TournamentTrackerProps) {
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("cash-cup");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [placement, setPlacement] = useState("");
  const [totalTeams, setTotalTeams] = useState("");
  const [kills, setKills] = useState("");
  const [points, setPoints] = useState("");
  const [pr, setPr] = useState("");
  const [earnings, setEarnings] = useState("");
  const [teammates, setTeammates] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tournament?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.entries) setEntries(data.entries);
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!name.trim() || !date) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: name.trim(),
          type,
          date,
          placement: placement ? parseInt(placement) : null,
          totalTeams: totalTeams ? parseInt(totalTeams) : null,
          kills: kills ? parseInt(kills) : null,
          points: points ? parseInt(points) : null,
          pr: pr ? parseInt(pr) : null,
          earnings: earnings ? Math.round(parseFloat(earnings) * 100) : null,
          teammates: teammates.trim() ? teammates.split(",").map((t) => t.trim()) : null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setEntries((e) => [data.entry, ...e]);
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      console.error("Failed to save tournament:", err);
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setName("");
    setType("cash-cup");
    setDate(new Date().toISOString().split("T")[0]);
    setPlacement("");
    setTotalTeams("");
    setKills("");
    setPoints("");
    setPr("");
    setEarnings("");
    setTeammates("");
    setNotes("");
  };

  const handleDelete = async (entryId: string) => {
    try {
      await fetch(`/api/tournament?entryId=${entryId}`, { method: "DELETE" });
      setEntries((e) => e.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const totalEarnings = entries.reduce((sum, e) => sum + (e.earnings || 0), 0);
  const totalPR = entries.reduce((sum, e) => sum + (e.pr || 0), 0);
  const avgPlacement = entries.filter((e) => e.placement).length > 0
    ? entries.filter((e) => e.placement).reduce((sum, e) => sum + (e.placement || 0), 0) /
      entries.filter((e) => e.placement).length
    : 0;
  const totalKills = entries.reduce((sum, e) => sum + (e.kills || 0), 0);
  const bestPlacement = entries.reduce(
    (best, e) => (e.placement && (best === null || e.placement < best) ? e.placement : best),
    null as number | null
  );

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold" />
            Tournament Tracker
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Log your competitive results, earnings, and PR
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            showForm
              ? "bg-bg-tertiary text-text-secondary"
              : "bg-gradient-to-r from-gold/20 to-yellow-500/10 text-gold border border-gold/30 hover:bg-gold/30"
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Log Result"}
        </button>
      </div>

      {/* Stats cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { icon: <DollarSign className="w-3 h-3" />, label: "Earnings", value: `$${(totalEarnings / 100).toFixed(2)}`, color: "text-success" },
            { icon: <Star className="w-3 h-3" />, label: "Total PR", value: totalPR.toLocaleString(), color: "text-accent-light" },
            { icon: <Medal className="w-3 h-3" />, label: "Best Placement", value: bestPlacement ? `#${bestPlacement}` : "—", color: "text-gold" },
            { icon: <TrendingUp className="w-3 h-3" />, label: "Avg Placement", value: avgPlacement ? `#${avgPlacement.toFixed(0)}` : "—", color: "" },
            { icon: <Target className="w-3 h-3" />, label: "Total Kills", value: totalKills.toString(), color: "text-danger" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-bg-card border border-border hover:border-border-light transition-colors"
            >
              <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
                {stat.icon} {stat.label}
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 rounded-2xl bg-bg-card border border-border">
              <h3 className="font-semibold mb-5 flex items-center gap-2 text-lg">
                <Crown className="w-5 h-5 text-gold" />
                Log Tournament Result
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Solo Cash Cup Week 5"
                    className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm focus:border-accent/50 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tournamentTypes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                          type === t.id ? t.color : "bg-bg-secondary text-text-secondary border-border"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" /> Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Trophy className="w-3 h-3 inline mr-1" /> Placement
                  </label>
                  <input
                    type="number"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    placeholder="#"
                    min={1}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Users className="w-3 h-3 inline mr-1" /> Total Teams
                  </label>
                  <input
                    type="number"
                    value={totalTeams}
                    onChange={(e) => setTotalTeams(e.target.value)}
                    placeholder="#"
                    min={1}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Target className="w-3 h-3 inline mr-1" /> Kills
                  </label>
                  <input
                    type="number"
                    value={kills}
                    onChange={(e) => setKills(e.target.value)}
                    placeholder="#"
                    min={0}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="#"
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Star className="w-3 h-3 inline mr-1" /> PR Earned
                  </label>
                  <input
                    type="number"
                    value={pr}
                    onChange={(e) => setPr(e.target.value)}
                    placeholder="#"
                    min={0}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <DollarSign className="w-3 h-3 inline mr-1" /> Earnings ($)
                  </label>
                  <input
                    type="number"
                    value={earnings}
                    onChange={(e) => setEarnings(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min={0}
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Teammates
                  </label>
                  <input
                    type="text"
                    value={teammates}
                    onChange={(e) => setTeammates(e.target.value)}
                    placeholder="Player1, Player2"
                    className="w-full px-3 py-3 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What went well? What could improve?"
                  rows={2}
                  className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-sm resize-none outline-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !date || submitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  name.trim() && date && !submitting
                    ? "bg-gradient-to-r from-gold/20 to-yellow-500/10 text-gold border border-gold/30 hover:bg-gold/30"
                    : "bg-bg-tertiary text-text-muted cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trophy className="w-4 h-4" />
                )}
                Save Result
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="text-center py-14 rounded-2xl bg-bg-card border border-border">
          <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">No tournament results yet</p>
          <p className="text-text-muted text-sm">
            Log your Cash Cups, FNCS, and qualifiers to track your journey
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const typeInfo = tournamentTypes.find((t) => t.id === entry.type);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-bg-card border border-border overflow-hidden hover:border-border-light transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-bg-hover/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                        entry.placement && entry.placement <= 3
                          ? "bg-gold/10 text-gold border border-gold/20"
                          : entry.placement && entry.placement <= 10
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "bg-bg-secondary text-text-secondary"
                      }`}
                    >
                      {entry.placement ? `#${entry.placement}` : "—"}
                    </div>
                    <div>
                      <p className="font-semibold">{entry.name}</p>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                        <span className={`px-2 py-0.5 rounded border ${typeInfo?.color || "bg-bg-secondary"}`}>
                          {typeInfo?.label || entry.type}
                        </span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                        {entry.kills !== null && entry.kills > 0 && (
                          <span className="text-danger">{entry.kills} kills</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.pr !== null && entry.pr > 0 && (
                      <span className="hidden sm:block text-accent-light font-semibold text-sm">
                        +{entry.pr} PR
                      </span>
                    )}
                    {entry.earnings !== null && entry.earnings > 0 && (
                      <span className="text-success font-semibold">
                        ${(entry.earnings / 100).toFixed(2)}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
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
                      <div className="px-4 pb-4 border-t border-border pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {entry.totalTeams && (
                            <div className="p-3 rounded-lg bg-bg-secondary">
                              <span className="text-xs text-text-muted">Total Teams</span>
                              <p className="font-bold">{entry.totalTeams}</p>
                            </div>
                          )}
                          {entry.points !== null && (
                            <div className="p-3 rounded-lg bg-bg-secondary">
                              <span className="text-xs text-text-muted">Points</span>
                              <p className="font-bold">{entry.points}</p>
                            </div>
                          )}
                          {entry.pr !== null && entry.pr > 0 && (
                            <div className="p-3 rounded-lg bg-bg-secondary">
                              <span className="text-xs text-text-muted">PR Earned</span>
                              <p className="font-bold text-accent-light">+{entry.pr}</p>
                            </div>
                          )}
                          {entry.teammates && entry.teammates.length > 0 && (
                            <div className="p-3 rounded-lg bg-bg-secondary col-span-2 md:col-span-1">
                              <span className="text-xs text-text-muted">Teammates</span>
                              <p className="font-medium text-sm">{entry.teammates.join(", ")}</p>
                            </div>
                          )}
                        </div>

                        {entry.notes && (
                          <div className="p-3 rounded-lg bg-bg-secondary/50 mb-4">
                            <span className="text-xs text-text-muted">Notes</span>
                            <p className="text-sm text-text-secondary">{entry.notes}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
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
      )}
    </div>
  );
}
