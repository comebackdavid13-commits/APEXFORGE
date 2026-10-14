"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  Trophy,
  Target,
  Skull,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { pois } from "@/lib/fortnite-data";

interface DropSession {
  id: string;
  poiId: string;
  gameMode: "br" | "reload";
  squadSize: "solo" | "duo" | "trio" | "squad";
  gamesPlayed: number;
  avgPlacement: number | null;
  kills: number | null;
  survivedOffSpawn: number | null;
  top10: number | null;
  top5: number | null;
  wins: number | null;
  notes: string | null;
  createdAt: string;
}

interface PoiStats {
  games: number;
  wins: number;
  top10: number;
  top5: number;
  kills: number;
  survived: number;
  avgPlacement: number;
}

interface DropSpotAnalyzerProps {
  sessionId: string;
}

const squadOptions = ["solo", "duo", "trio", "squad"] as const;
const modeOptions = ["br", "reload"] as const;

export function DropSpotAnalyzer({ sessionId }: DropSpotAnalyzerProps) {
  const [sessions, setSessions] = useState<DropSession[]>([]);
  const [stats, setStats] = useState<Record<string, PoiStats>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedPoi, setExpandedPoi] = useState<string | null>(null);
  const [filterSquad, setFilterSquad] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");

  // Form state
  const [poiId, setPoiId] = useState(pois[0].id);
  const [gameMode, setGameMode] = useState<"br" | "reload">("br");
  const [squadSize, setSquadSize] = useState<"solo" | "duo" | "trio" | "squad">("solo");
  const [gamesPlayed, setGamesPlayed] = useState<string>("5");
  const [avgPlacement, setAvgPlacement] = useState<string>("");
  const [kills, setKills] = useState<string>("");
  const [survivedOffSpawn, setSurvivedOffSpawn] = useState<string>("");
  const [top10, setTop10] = useState<string>("");
  const [top5, setTop5] = useState<string>("");
  const [wins, setWins] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/drop-sessions?sessionId=${sessionId}`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error("Failed to load drop sessions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterSquad !== "all" && s.squadSize !== filterSquad) return false;
      if (filterMode !== "all" && s.gameMode !== filterMode) return false;
      return true;
    });
  }, [sessions, filterSquad, filterMode]);

  const filteredStats = useMemo(() => {
    const result: Record<string, PoiStats> = {};
    for (const s of filteredSessions) {
      const prev = result[s.poiId] || {
        games: 0,
        wins: 0,
        top10: 0,
        top5: 0,
        kills: 0,
        survived: 0,
        avgPlacement: 0,
      };
      const totalGames = prev.games + (s.gamesPlayed || 1);
      result[s.poiId] = {
        games: totalGames,
        wins: prev.wins + (s.wins || 0),
        top10: prev.top10 + (s.top10 || 0),
        top5: prev.top5 + (s.top5 || 0),
        kills: prev.kills + (s.kills || 0),
        survived: prev.survived + (s.survivedOffSpawn || 0),
        avgPlacement:
          (prev.avgPlacement * prev.games + (s.avgPlacement || 0) * (s.gamesPlayed || 1)) / totalGames,
      };
    }
    return result;
  }, [filteredSessions]);

  const sortedPois = useMemo(() => {
    return pois
      .map((p) => ({
        ...p,
        stats: filteredStats[p.id],
      }))
      .sort((a, b) => {
        // Rank by survival rate, then avg placement, then games
        const aRate = a.stats ? a.stats.survived / a.stats.games : 0;
        const bRate = b.stats ? b.stats.survived / b.stats.games : 0;
        if (bRate !== aRate) return bRate - aRate;
        const aPlace = a.stats?.avgPlacement || 999;
        const bPlace = b.stats?.avgPlacement || 999;
        return aPlace - bPlace;
      });
  }, [filteredStats]);

  const bestPoi = sortedPois.find((p) => p.stats && p.stats.games > 0);
  const worstPoi = [...sortedPois]
    .reverse()
    .find((p) => p.stats && p.stats.games > 0);

  const handleSubmit = async () => {
    const gp = parseInt(gamesPlayed) || 1;
    if (gp < 1) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/drop-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          poiId,
          gameMode,
          squadSize,
          gamesPlayed: gp,
          avgPlacement: avgPlacement ? parseInt(avgPlacement) : null,
          kills: kills ? parseInt(kills) : null,
          survivedOffSpawn: survivedOffSpawn ? parseInt(survivedOffSpawn) : null,
          top10: top10 ? parseInt(top10) : null,
          top5: top5 ? parseInt(top5) : null,
          wins: wins ? parseInt(wins) : null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.session) {
        await load();
        setShowForm(false);
        setExpandedPoi(poiId);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/drop-sessions?sessionId=${sessionId}&id=${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const survivalRate = (stats: PoiStats | undefined) => {
    if (!stats || stats.games === 0) return null;
    return (stats.survived / stats.games) * 100;
  };

  const winRate = (stats: PoiStats | undefined) => {
    if (!stats || stats.games === 0) return null;
    return (stats.wins / stats.games) * 100;
  };

  const top10Rate = (stats: PoiStats | undefined) => {
    if (!stats || stats.games === 0) return null;
    return (stats.top10 / stats.games) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Drop Spot Analyzer
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Track where you land and find your best drop
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all self-start ${
            showForm
              ? "bg-bg-tertiary text-text-secondary"
              : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          {showForm ? <AlertCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Log Session"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-xl bg-black/20 border border-border">
          {[
            { id: "all", label: "All Sizes" },
            ...squadOptions.map((s) => ({ id: s, label: s })),
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterSquad(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filterSquad === opt.id
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-black/20 border border-border">
          {[
            { id: "all", label: "Both Modes" },
            { id: "br", label: "BR" },
            { id: "reload", label: "Reload" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterMode(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
                filterMode === opt.id
                  ? "bg-accent-cyan text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights */}
      {bestPoi?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-sm">Best Drop</span>
            </div>
            <p className="text-text-secondary text-sm">
              <span className="text-green-400 font-bold">{bestPoi.name}</span>{" "}
              — you survive off spawn{" "}
              <span className="text-white font-bold">
                {survivalRate(bestPoi.stats)?.toFixed(0)}%
              </span>{" "}
              of the time with an average placement of{" "}
              <span className="text-white font-bold">
                #{bestPoi.stats.avgPlacement.toFixed(0)}
              </span>{" "}
              over {bestPoi.stats.games} game{bestPoi.stats.games !== 1 ? "s" : ""}.
            </p>
          </div>
          {worstPoi && worstPoi.id !== bestPoi.id && worstPoi.stats && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-sm">Worst Drop</span>
              </div>
              <p className="text-text-secondary text-sm">
                <span className="text-red-400 font-bold">{worstPoi.name}</span>{" "}
                — only{" "}
                <span className="text-white font-bold">
                  {survivalRate(worstPoi.stats)?.toFixed(0)}%
                </span>{" "}
                off-spawn survival with avg placement{" "}
                <span className="text-white font-bold">
                  #{worstPoi.stats.avgPlacement.toFixed(0)}
                </span>
                . Consider dropping here only for W-key practice.
              </p>
            </div>
          )}
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
            <div className="p-5 rounded-2xl bg-bg-card border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                Log Drop Session
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    POI
                  </label>
                  <select
                    value={poiId}
                    onChange={(e) => setPoiId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary focus:border-accent/50 outline-none"
                  >
                    {pois.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Game Mode
                  </label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as "br" | "reload")}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary outline-none"
                  >
                    <option value="br">Battle Royale</option>
                    <option value="reload">Reload</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Squad Size
                  </label>
                  <select
                    value={squadSize}
                    onChange={(e) =>
                      setSquadSize(e.target.value as typeof squadSize)
                    }
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary capitalize outline-none"
                  >
                    {squadOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Games Played *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={gamesPlayed}
                    onChange={(e) => setGamesPlayed(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Avg Placement
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="#"
                    value={avgPlacement}
                    onChange={(e) => setAvgPlacement(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Total Kills
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={kills}
                    onChange={(e) => setKills(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Survived Off Spawn
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="of games"
                    value={survivedOffSpawn}
                    onChange={(e) => setSurvivedOffSpawn(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Top 10s
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={top10}
                    onChange={(e) => setTop10(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Top 5s
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={top5}
                    onChange={(e) => setTop5(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">
                    Wins
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={wins}
                    onChange={(e) => setWins(e.target.value)}
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-text-muted mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Was it contested? How was your rotation?"
                  rows={2}
                  className="w-full px-3 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm resize-none outline-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Save Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POI list */}
      <div className="space-y-3">
        {sortedPois.map((poi) => {
          const s = filteredStats[poi.id];
          const isExpanded = expandedPoi === poi.id;
          const rate = survivalRate(s);
          const win = winRate(s);
          const top10 = top10Rate(s);
          const hasData = s && s.games > 0;

          return (
            <motion.div
              key={poi.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-bg-card border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedPoi(isExpanded ? null : poi.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-bg-hover/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      hasData
                        ? rate && rate >= 60
                          ? "bg-green-500/15 text-green-400"
                          : rate && rate >= 40
                          ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-red-500/15 text-red-400"
                        : "bg-bg-secondary text-text-muted"
                    }`}
                  >
                    {hasData ? `${rate?.toFixed(0)}%` : "—"}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{poi.name}</h3>
                    <p className="text-xs text-text-muted">
                      {hasData
                        ? `${s.games} game${s.games !== 1 ? "s" : ""} • avg #${s.avgPlacement.toFixed(0)} • ${s.kills} kills`
                        : "No data yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasData && (
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      {win !== null && (
                        <span className="px-2 py-1 rounded bg-bg-secondary text-text-secondary">
                          {win.toFixed(0)}% wins
                        </span>
                      )}
                      {top10 !== null && (
                        <span className="px-2 py-1 rounded bg-bg-secondary text-text-secondary">
                          {top10.toFixed(0)}% top10
                        </span>
                      )}
                    </div>
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
                      {hasData ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-bg-secondary">
                            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                              <TrendingUp className="w-3 h-3" /> Survival
                            </div>
                            <p className={`font-bold ${rate && rate >= 60 ? "text-green-400" : rate && rate >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                              {rate?.toFixed(0)}%
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-bg-secondary">
                            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                              <Trophy className="w-3 h-3" /> Wins
                            </div>
                            <p className="font-bold">{win?.toFixed(0)}%</p>
                          </div>
                          <div className="p-3 rounded-lg bg-bg-secondary">
                            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                              <BarChart3 className="w-3 h-3" /> Top 10
                            </div>
                            <p className="font-bold">{top10?.toFixed(0)}%</p>
                          </div>
                          <div className="p-3 rounded-lg bg-bg-secondary">
                            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                              <Target className="w-3 h-3" /> Avg Place
                            </div>
                            <p className="font-bold">#{s.avgPlacement.toFixed(0)}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-text-muted text-sm mb-4">
                          No logged sessions for {poi.name} yet. Log a session
                          to see your stats.
                        </p>
                      )}

                      {/* Sessions for this POI */}
                      {filteredSessions.filter((x) => x.poiId === poi.id).length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                            Recent Sessions
                          </h4>
                          <div className="space-y-2">
                            {filteredSessions
                              .filter((x) => x.poiId === poi.id)
                              .slice(0, 5)
                              .map((sess) => (
                                <div
                                  key={sess.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/50"
                                >
                                  <div className="text-xs text-text-secondary">
                                    <span className="uppercase font-bold text-text-primary">
                                      {sess.gameMode}
                                    </span>{" "}
                                    • {sess.squadSize} • {sess.gamesPlayed} game
                                    {sess.gamesPlayed !== 1 ? "s" : ""}
                                    {sess.avgPlacement && (
                                      <span> • avg #{sess.avgPlacement}</span>
                                    )}
                                    {sess.notes && (
                                      <p className="text-text-muted mt-0.5 italic">
                                        “{sess.notes}”
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleDelete(sess.id)}
                                    className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
