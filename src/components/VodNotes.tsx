"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Skull,
  Target,
  MapPin,
  Trophy,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import type { VodNote } from "@/lib/types";

interface VodNotesProps {
  sessionId: string;
}

const gameModes = [
  { id: "br", label: "Battle Royale" },
  { id: "reload", label: "Reload" },
  { id: "creative", label: "Creative/Arena" },
];

const situations = [
  { id: "offspawn", label: "Off Spawn", icon: "🔥" },
  { id: "midgame", label: "Mid Game", icon: "🌀" },
  { id: "endgame", label: "End Game", icon: "🏆" },
  { id: "rotation", label: "Rotation", icon: "🏃" },
];

export function VodNotes({ sessionId }: VodNotesProps) {
  const [notes, setNotes] = useState<VodNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  // Form state
  const [gameMode, setGameMode] = useState("br");
  const [placement, setPlacement] = useState<string>("");
  const [elims, setElims] = useState<string>("");
  const [situation, setSituation] = useState<string>("");
  const [deathReason, setDeathReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Load notes
  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch(`/api/vod-notes?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.notes) {
          setNotes(data.notes);
        }
      } catch (err) {
        console.error("Failed to load VOD notes:", err);
      }
      setLoading(false);
    }
    loadNotes();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!deathReason.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/vod-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          gameMode,
          placement: placement ? parseInt(placement) : null,
          elimsBeforeDeath: elims ? parseInt(elims) : null,
          deathReason: deathReason.trim(),
          situation: situation || null,
          notes: additionalNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setExpandedNoteId(data.note.id);
        // Reset form
        setDeathReason("");
        setAdditionalNotes("");
        setPlacement("");
        setElims("");
        setSituation("");
        setShowForm(false);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await fetch(`/api/vod-notes?noteId=${noteId}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

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
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-accent" />
            Death Notes
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Log why you died and get AI coaching to improve
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showForm
              ? "bg-bg-tertiary text-text-secondary"
              : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Log Death
            </>
          )}
        </button>
      </div>

      {/* Add note form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 rounded-2xl bg-bg-card border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Skull className="w-4 h-4 text-danger" />
                Log a Death
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Game mode */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Game Mode
                  </label>
                  <div className="flex gap-2">
                    {gameModes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setGameMode(m.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          gameMode === m.id
                            ? "bg-accent/20 text-accent-light border border-accent/30"
                            : "bg-bg-secondary text-text-secondary border border-border hover:border-border-light"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Situation */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    When did you die?
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {situations.map((s) => (
                      <button
                        key={s.id}
                        onClick={() =>
                          setSituation(situation === s.id ? "" : s.id)
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          situation === s.id
                            ? "bg-accent/20 text-accent-light border border-accent/30"
                            : "bg-bg-secondary text-text-secondary border border-border hover:border-border-light"
                        }`}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Trophy className="w-3 h-3 inline mr-1" />
                    Placement (optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    placeholder="#"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <Target className="w-3 h-3 inline mr-1" />
                    Elims before death (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={elims}
                    onChange={(e) => setElims(e.target.value)}
                    placeholder="#"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm"
                  />
                </div>
              </div>

              {/* Death reason - main field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Why did you die? *
                </label>
                <textarea
                  value={deathReason}
                  onChange={(e) => setDeathReason(e.target.value)}
                  placeholder="e.g., 'Missed my shotgun shots in a box fight' or 'Got third partied while rotating' or 'Ran out of mats in endgame'"
                  rows={2}
                  className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm resize-none"
                />
              </div>

              {/* Additional notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any other context... what led up to it, how you felt, what you think you should have done..."
                  rows={2}
                  className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!deathReason.trim() || submitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  deathReason.trim() && !submitting
                    ? "bg-gradient-to-r from-accent to-accent-blue text-white hover:shadow-[0_0_30px_rgba(108,92,231,0.3)]"
                    : "bg-bg-tertiary text-text-muted cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get AI Analysis
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-bg-card border border-border">
          <Video className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">No death notes yet</p>
          <p className="text-text-muted text-sm">
            Log your deaths to get personalized coaching on how to improve
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const situationInfo = situations.find((s) => s.id === note.situation);

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-bg-card border border-border overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedNoteId(isExpanded ? null : note.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-bg-hover/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                      <Skull className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">
                        {note.deathReason}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                        <span className="capitalize">{note.gameMode}</span>
                        {situationInfo && (
                          <>
                            <span>•</span>
                            <span>
                              {situationInfo.icon} {situationInfo.label}
                            </span>
                          </>
                        )}
                        {note.placement && (
                          <>
                            <span>•</span>
                            <span>#{note.placement}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border pt-4">
                        {/* Stats row */}
                        {(note.placement || note.elimsBeforeDeath) && (
                          <div className="flex gap-4 mb-4">
                            {note.placement && (
                              <div className="px-3 py-2 rounded-lg bg-bg-secondary">
                                <span className="text-xs text-text-muted">
                                  Placement
                                </span>
                                <p className="font-bold">#{note.placement}</p>
                              </div>
                            )}
                            {note.elimsBeforeDeath !== null && (
                              <div className="px-3 py-2 rounded-lg bg-bg-secondary">
                                <span className="text-xs text-text-muted">
                                  Elims
                                </span>
                                <p className="font-bold">{note.elimsBeforeDeath}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* User notes */}
                        {note.notes && (
                          <div className="mb-4 p-3 rounded-lg bg-bg-secondary/50">
                            <p className="text-xs text-text-muted mb-1">
                              Your notes:
                            </p>
                            <p className="text-sm text-text-secondary">
                              {note.notes}
                            </p>
                          </div>
                        )}

                        {/* AI Analysis */}
                        {note.aiAnalysis && (
                          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-accent" />
                              <span className="font-semibold text-sm text-accent-light">
                                AI Coach Analysis
                              </span>
                            </div>
                            <div className="text-sm text-text-secondary leading-relaxed space-y-2">
                              {note.aiAnalysis.split("\n").map((line, i) => {
                                if (line.startsWith("**") && line.endsWith("**")) {
                                  return (
                                    <p
                                      key={i}
                                      className="font-bold text-text-primary"
                                    >
                                      {line.replace(/\*\*/g, "")}
                                    </p>
                                  );
                                }
                                if (line.startsWith("**")) {
                                  const parts = line.split("**");
                                  return (
                                    <p key={i}>
                                      {parts.map((part, j) =>
                                        j % 2 === 1 ? (
                                          <strong
                                            key={j}
                                            className="text-accent-light"
                                          >
                                            {part}
                                          </strong>
                                        ) : (
                                          <span key={j}>{part}</span>
                                        )
                                      )}
                                    </p>
                                  );
                                }
                                if (line.trim() === "") return <br key={i} />;
                                return <p key={i}>{line}</p>;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Delete button */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleDelete(note.id)}
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
