"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  LogOut,
  ChevronRight,
  Target,
  Clock,
  Gamepad2,
  Award,
  Keyboard,
  Dumbbell,
  Trophy,
  Map,
  Edit3,
  Crosshair,
  Users,
  Sparkles,
  Flame,
  RotateCcw,
  Loader2,
  ChevronLeft,
  Video,
  ClipboardCheck,
  BarChart3,
  ChevronRight as RightArrow,
} from "lucide-react";
import type { OnboardingData, SkillRating, TrainingPlan } from "@/lib/types";
import { TrainingPlanView } from "./TrainingPlanView";
import { WeaknessOverview } from "./WeaknessOverview";
import { AICoach } from "./AICoach";
import { WarmupBuilder } from "./WarmupBuilder";
import { TournamentTracker } from "./TournamentTracker";
import { MapView } from "./MapView";
import { ProfileEditor } from "./ProfileEditor";
import { WeaponCalculator } from "./WeaponCalculator";
import { RankTracker } from "./RankTracker";
import { ProgressCharts } from "./ProgressCharts";
import { SessionReplayChecklist } from "./SessionReplayChecklist";
import { ReRateModal } from "./ReRateModal";
import { VodNotes } from "./VodNotes";
import { DuoPractice } from "./DuoPractice";
import { weaknessCategories } from "@/lib/weaknesses";
import { generateTrainingPlan } from "@/lib/plan-generator";

interface DashboardProps {
  sessionId: string;
  onboarding: OnboardingData;
  ratings: SkillRating[];
  plan: TrainingPlan | null;
  onReset: () => void;
}

type Tab = "overview" | "plan" | "warmup" | "tournament" | "map" | "weapons" | "duo" | "replay" | "deaths" | "skills" | "coach";

function PlanTab({
  sessionId,
  onboarding,
  ratings,
  plan,
}: {
  sessionId: string;
  onboarding: OnboardingData;
  ratings: SkillRating[];
  plan: TrainingPlan | null;
}) {
  const [localPlan, setLocalPlan] = useState<TrainingPlan | null>(plan);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    setLocalPlan(plan);
  }, [plan]);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, onboarding, ratings }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.plan) {
          setLocalPlan(data.plan as TrainingPlan);
          setRegenerating(false);
          return;
        }
      }
    } catch {}
    setLocalPlan(generateTrainingPlan(onboarding, ratings));
    setRegenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Training Plan</h1>
          <p className="text-text-secondary mt-1">
            Your personalized weekly training schedule
          </p>
        </div>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-card border border-border text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all disabled:opacity-50"
        >
          {regenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          Regenerate
        </button>
      </div>
      <div className="mt-6">
        {localPlan ? (
          <TrainingPlanView plan={localPlan} />
        ) : (
          <div className="p-10 text-center rounded-2xl bg-bg-card border border-border">
            <Calendar className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary mb-4">No plan generated yet.</p>
            <button
              onClick={regenerate}
              disabled={regenerating}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all disabled:opacity-50"
            >
              {regenerating ? "Generating…" : "Generate My Plan"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const rankColors: Record<string, { bg: string; text: string; glow: string }> = {
  Unranked: { bg: "bg-gray-500/10", text: "text-gray-400", glow: "shadow-gray-500/20" },
  Bronze: { bg: "bg-orange-800/20", text: "text-orange-400", glow: "shadow-orange-500/20" },
  Silver: { bg: "bg-slate-400/10", text: "text-slate-300", glow: "shadow-slate-400/20" },
  Gold: { bg: "bg-yellow-500/10", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  Platinum: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  Diamond: { bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
  Elite: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "shadow-violet-500/20" },
  Champion: { bg: "bg-pink-500/10", text: "text-pink-400", glow: "shadow-pink-500/20" },
  Unreal: { bg: "bg-red-500/10", text: "text-red-400", glow: "shadow-red-500/20" },
  "Unreal Legends": { bg: "bg-amber-500/15", text: "text-amber-300", glow: "shadow-amber-500/30" },
};

export function Dashboard({
  sessionId,
  onboarding: initialOnboarding,
  ratings,
  plan,
  onReset,
}: DashboardProps) {
  const [onboarding, setOnboarding] = useState(initialOnboarding);
  const [currentRatings, setCurrentRatings] = useState<SkillRating[]>(ratings);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showReRate, setShowReRate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOnboarding(initialOnboarding);
  }, [initialOnboarding]);

  useEffect(() => {
    setCurrentRatings(ratings);
  }, [ratings]);

  const avgRating =
    currentRatings.length > 0
      ? currentRatings.reduce((s, r) => s + r.rating, 0) / currentRatings.length
      : 0;
  const weakestSkills = [...currentRatings].sort((a, b) => a.rating - b.rating).slice(0, 3);
  const strongestSkills = [...currentRatings].sort((a, b) => b.rating - a.rating).slice(0, 3);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "plan", label: "Training", icon: <Calendar className="w-4 h-4" /> },
    { id: "warmup", label: "Warm-Up", icon: <Dumbbell className="w-4 h-4" /> },
    { id: "map", label: "Map", icon: <Map className="w-4 h-4" /> },
    { id: "weapons", label: "Weapons", icon: <Crosshair className="w-4 h-4" /> },
    { id: "duo", label: "Duo", icon: <Users className="w-4 h-4" /> },
    { id: "tournament", label: "Tourneys", icon: <Trophy className="w-4 h-4" /> },
    { id: "replay", label: "Replay", icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: "deaths", label: "Deaths", icon: <Video className="w-4 h-4" /> },
    { id: "skills", label: "Skills", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "coach", label: "Coach", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const activeIdx = tabs.findIndex((t) => t.id === activeTab);

  function goToTab(direction: 1 | -1) {
    const next = (activeIdx + direction + tabs.length) % tabs.length;
    setActiveTab(tabs[next].id);
  }

  // ── Touch / swipe support on the tab strip ──
  function onTabTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  }
  function onTabTouchEnd(e: React.TouchEvent) {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    // Only horizontal swipes, >60px, |dx| > 2*|dy|
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
      goToTab(dx < 0 ? 1 : -1);
    }
    setTouchStart(null);
  }

  // ── Wheel / horizontal scroll on the tab strip (desktop) ──
  function onTabWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaX) < 20 && Math.abs(e.deltaY) < 5) return;
    // We treat natural trackpad horizontal scroll as next/prev
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      goToTab(e.deltaX > 0 ? 1 : -1);
    }
  }

  function findSkillName(category: string, skillId: string): string {
    const cat = weaknessCategories.find((c) => c.id === category);
    const skill = cat?.skills.find((s) => s.id === skillId);
    return skill?.name || skillId;
  }

  const brStyle = rankColors[onboarding.brRank] || rankColors.Unranked;
  const reloadStyle = rankColors[onboarding.reloadRank] || rankColors.Unranked;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[150px]" />
      </div>

      {showProfileEditor && (
        <ProfileEditor
          sessionId={sessionId}
          onboarding={onboarding}
          onUpdate={setOnboarding}
          onClose={() => setShowProfileEditor(false)}
        />
      )}

      {showReRate && (
        <ReRateModal
          currentRatings={currentRatings}
          onClose={() => setShowReRate(false)}
          onSave={async (ratings) => {
            await fetch("/api/weaknesses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, ratings }),
            });
            setCurrentRatings(ratings);
            setShowReRate(false);
          }}
        />
      )}

      <header className="sticky top-0 z-40 bg-bg-primary/85 backdrop-blur-2xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center shadow-lg shadow-accent/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight">
                Apex<span className="text-accent-light">Forge</span>
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-2xl bg-bg-secondary/50 border border-border/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-accent text-white shadow-lg shadow-accent/25"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold">{onboarding.epicName}</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  {onboarding.inputDevice === "kbm" ? "KBM" : "Controller"}
                </span>
              </div>
              <button
                onClick={onReset}
                className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Reset profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE / SWIPEABLE TOP TAB STRIP ── */}
        <div
          className="lg:hidden border-t border-border/60 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onTouchStart={onTabTouchStart}
          onTouchEnd={onTabTouchEnd}
          onWheel={onTabWheel}
        >
          <div className="flex px-3 py-2 gap-1 select-none" style={{ minWidth: 'max-content' }}>
            {tabs.map((tab, i) => {
              const isActive = activeTab === tab.id;
              const isAdjacent = Math.abs(i - activeIdx) === 1;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-accent text-white"
                      : isAdjacent
                      ? "text-text-secondary bg-bg-secondary/60"
                      : "text-text-muted bg-bg-secondary/30"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Swipe gesture catcher on desktop too (so trackpad swipe works) ── */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        onTouchStart={(e) => {
          const t = e.touches[0];
          setTouchStart({ x: t.clientX, y: t.clientY });
        }}
        onTouchEnd={(e) => {
          if (!touchStart) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - touchStart.x;
          const dy = t.clientY - touchStart.y;
          if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
            goToTab(dx < 0 ? 1 : -1);
          }
          setTouchStart(null);
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
          e.preventDefault();
          goToTab(e.deltaX > 0 ? 1 : -1);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/15 via-bg-card to-accent-blue/10 border border-accent/20 p-6 sm:p-8">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
                  <div className="relative z-10">
                    <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-xs font-bold mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      Chapter 7 Season 3
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl font-black mb-2">
                      Welcome back, {onboarding.epicName}
                    </h1>
                    <p className="text-text-secondary max-w-xl">
                      Your training plan is active. Track your rank climb, log deaths for AI coaching,
                      and review your weaknesses.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    onClick={() => setShowProfileEditor(true)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-2xl border text-left transition-all group ${brStyle.bg} ${brStyle.text} border-current/20`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">BR</span>
                    </div>
                    <p className="text-2xl font-black">{onboarding.brRank}</p>
                  </motion.button>
                  <motion.button
                    onClick={() => setShowProfileEditor(true)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-2xl border text-left transition-all group ${reloadStyle.bg} ${reloadStyle.text} border-current/20`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Reload</span>
                    </div>
                    <p className="text-2xl font-black">{onboarding.reloadRank}</p>
                  </motion.button>
                  <div className="p-5 rounded-2xl bg-bg-card border border-border flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-3">
                      {onboarding.inputDevice === "kbm" ? (
                        <Keyboard className="w-4 h-4 text-warning" />
                      ) : (
                        <Gamepad2 className="w-4 h-4 text-warning" />
                      )}
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Input</span>
                    </div>
                    <p className="text-2xl font-black">
                      {onboarding.inputDevice === "kbm" ? "KBM" : "Controller"}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-bg-card border border-border flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-success" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Weekly</span>
                    </div>
                    <p className="text-2xl font-black">
                      {onboarding.playtimeHoursPerDay * onboarding.playtimeDaysPerWeek}h
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {plan && plan.dailyPlans.length > 0 && (
                      <div className="rounded-2xl bg-bg-card border border-border p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <h2 className="font-bold">Today&apos;s Training</h2>
                              <p className="text-xs text-text-muted">{plan.dailyPlans[0].day} • {plan.dailyPlans[0].focus}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab("plan")}
                            className="text-xs text-accent hover:text-accent-light flex items-center gap-1 font-semibold"
                          >
                            Full plan <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {plan.dailyPlans[0].sessions.slice(0, 4).map((session, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary/40 border border-border/40"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  session.type === "warmup"
                                    ? "bg-warning/10 text-warning"
                                    : session.type === "creative"
                                    ? "bg-accent/10 text-accent"
                                    : session.type === "ranked"
                                    ? "bg-accent-cyan/10 text-accent-cyan"
                                    : session.type === "vod"
                                    ? "bg-text-secondary/10 text-text-secondary"
                                    : "bg-success/10 text-success"
                                }`}
                              >
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session.title}</p>
                                <p className="text-xs text-text-muted">{session.duration}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Quick Actions</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { tab: "plan" as Tab, icon: <Calendar className="w-5 h-5" />, title: "Training", desc: "Daily plan", color: "from-accent/15 to-accent/5 border-accent/20 text-accent" },
                          { tab: "warmup" as Tab, icon: <Dumbbell className="w-5 h-5" />, title: "Warm-Up", desc: "Start routine", color: "from-warning/15 to-warning/5 border-warning/20 text-warning" },
                          { tab: "duo" as Tab, icon: <Users className="w-5 h-5" />, title: "Duo", desc: "With partner", color: "from-cyan-500/15 to-cyan-500/5 border-cyan-500/20 text-cyan-400" },
                          { tab: "map" as Tab, icon: <Map className="w-5 h-5" />, title: "Map", desc: "POIs & meta", color: "from-success/15 to-success/5 border-success/20 text-success" },
                          { tab: "weapons" as Tab, icon: <Crosshair className="w-5 h-5" />, title: "Weapons", desc: "Damage calc", color: "from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-400" },
                          { tab: "coach" as Tab, icon: <MessageSquare className="w-5 h-5" />, title: "AI Coach", desc: "Ask anything", color: "from-accent-cyan/15 to-accent-cyan/5 border-accent-cyan/20 text-accent-cyan" },
                        ].map((action) => (
                          <button
                            key={action.tab}
                            onClick={() => {
                              setActiveTab(action.tab);
                              if (action.tab === "coach") setChatOpen(true);
                            }}
                            className={`group p-4 rounded-2xl bg-gradient-to-br ${action.color} border text-left transition-all hover:scale-[1.02] hover:shadow-lg`}
                          >
                            <div className="mb-3 transition-transform group-hover:scale-110">{action.icon}</div>
                            <h3 className="font-bold text-sm">{action.title}</h3>
                            <p className="text-[10px] opacity-70 mt-0.5">{action.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {onboarding.goals.length > 0 && (
                      <div className="rounded-2xl bg-bg-card border border-border p-5">
                        <h2 className="font-bold mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-gold" />
                          Your Goals
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {onboarding.goals.map((goal) => (
                            <span
                              key={goal}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/5 border border-gold/20 text-sm text-text-secondary"
                            >
                              <ChevronRight className="w-3 h-3 text-gold" />
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl bg-bg-card border border-border p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold flex items-center gap-2">
                          <Flame className="w-4 h-4 text-danger" />
                          Focus Areas
                        </h2>
                        <button
                          onClick={() => setShowReRate(true)}
                          className="text-xs text-accent hover:text-accent-light font-semibold"
                        >
                          Re-rate
                        </button>
                      </div>
                      <div className="space-y-3">
                        {weakestSkills.map((skill) => (
                          <div
                            key={`${skill.category}-${skill.skill}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary/40"
                          >
                            <div>
                              <p className="text-sm font-semibold">{findSkillName(skill.category, skill.skill)}</p>
                              <p className="text-xs text-text-muted capitalize">{skill.category.replace("-", " ")}</p>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <div
                                  key={n}
                                  className={`w-1.5 h-6 rounded-sm ${
                                    n <= skill.rating
                                      ? skill.rating <= 2
                                        ? "bg-danger"
                                        : skill.rating === 3
                                        ? "bg-text-secondary"
                                        : "bg-accent"
                                      : "bg-bg-tertiary"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/10 text-center">
                        <p className="text-xs text-text-muted mb-1">Overall Skill Rating</p>
                        <p className="text-2xl font-black gradient-text">{avgRating.toFixed(1)}<span className="text-sm text-text-muted">/5</span></p>
                      </div>
                    </div>

                    <RankTracker
                      sessionId={sessionId}
                      brRank={onboarding.brRank}
                      reloadRank={onboarding.reloadRank}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "plan" && (
              <PlanTab
                sessionId={sessionId}
                onboarding={onboarding}
                ratings={currentRatings}
                plan={plan}
              />
            )}

            {activeTab === "warmup" && (
              <div>
                <WarmupBuilder sessionId={sessionId} />
              </div>
            )}

            {activeTab === "skills" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Skill Ratings</h1>
                <p className="text-text-secondary text-sm mt-1">
                  View your self-assessment or update it any time
                </p>
              </div>
              <button
                onClick={() => setShowReRate(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-accent to-accent-blue text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all self-start"
              >
                <Flame className="w-4 h-4" />
                Re-Rate Skills
              </button>
            </div>
            <WeaknessOverview ratings={currentRatings} />
          </motion.div>
        )}

        {activeTab === "replay" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SessionReplayChecklist sessionId={sessionId} />
          </motion.div>
        )}

        {activeTab === "deaths" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <VodNotes sessionId={sessionId} />
          </motion.div>
        )}

        {activeTab === "tournament" && (
              <div>
                <TournamentTracker sessionId={sessionId} />
              </div>
            )}

            {activeTab === "map" && (
              <div>
                <MapView inputDevice={onboarding.inputDevice} />
              </div>
            )}

            {activeTab === "weapons" && (
              <div>
                <WeaponCalculator />
              </div>
            )}

            {activeTab === "duo" && (
              <DuoPractice
                sessionId={sessionId}
                onboarding={onboarding}
                currentRatings={currentRatings}
              />
            )}


            {activeTab === "coach" && (
              <div className="max-w-3xl mx-auto">
                <div className="h-[calc(100vh-200px)] bg-bg-card border border-border rounded-2xl overflow-hidden">
                  <AICoach
                    sessionId={sessionId}
                    isOpen={true}
                    onToggle={() => setChatOpen(!chatOpen)}
                    mode="sidebar"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {activeTab !== "coach" && (
        <AICoach
          sessionId={sessionId}
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          mode="floating"
        />
      )}
    </div>
  );
}
