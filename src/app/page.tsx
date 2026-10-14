"use client";

import { useState, useEffect, useCallback } from "react";
import { LandingHero } from "@/components/LandingHero";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { WeaknessSelection } from "@/components/WeaknessSelection";
import { Dashboard } from "@/components/Dashboard";
import { generateTrainingPlan } from "@/lib/plan-generator";
import type { OnboardingData, SkillRating, TrainingPlan } from "@/lib/types";

type AppView = "landing" | "onboarding" | "weaknesses" | "dashboard" | "generating";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("apexforge_session");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("apexforge_session", sid);
  }
  return sid;
}

export default function Home() {
  const [view, setView] = useState<AppView>("landing");
  const [sessionId, setSessionId] = useState("");
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [ratings, setRatings] = useState<SkillRating[]>([]);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [genStep, setGenStep] = useState(0);

  // Initialize session and check for existing profile
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);

    async function checkProfile() {
      try {
        const res = await fetch(`/api/profile?sessionId=${sid}`);
        const data = await res.json();
        
        if (data.profile && data.profile.onboardingComplete) {
          // Load saved profile data
          setOnboardingData({
            epicName: data.profile.epicName || "",
            reloadRank: data.profile.reloadRank || "",
            brRank: data.profile.brRank || "",
            peakReloadRank: data.profile.peakReloadRank || "",
            peakBrRank: data.profile.peakBrRank || "",
            inputDevice: data.profile.inputDevice || "kbm",
            playtimeHoursPerDay: data.profile.playtimeHoursPerDay || 2,
            playtimeDaysPerWeek: data.profile.playtimeDaysPerWeek || 5,
            goals: data.profile.goals || [],
          });

          // Load existing weakness ratings
          const weakRes = await fetch(`/api/weaknesses?sessionId=${sid}`);
          const weakData = await weakRes.json();
          if (weakData.ratings && weakData.ratings.length > 0) {
            setRatings(
              weakData.ratings.map((r: { category: string; skill: string; rating: number }) => ({
                category: r.category,
                skill: r.skill,
                rating: r.rating,
              }))
            );
          }

          // Load existing plan
          const planRes = await fetch(`/api/plan?sessionId=${sid}`);
          const planData = await planRes.json();
          if (planData.plan) {
            setPlan(planData.plan as TrainingPlan);
          }

          setView("dashboard");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
      setLoading(false);
    }

    checkProfile();
  }, []);

  const handleStartOnboarding = useCallback(() => {
    setView("onboarding");
  }, []);

  const handleOnboardingComplete = useCallback(
    async (data: OnboardingData) => {
      setOnboardingData(data);
      // Save profile (not complete until weaknesses done)
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...data,
          onboardingComplete: false,
        }),
      });
      setView("weaknesses");
    },
    [sessionId]
  );

  const handleWeaknessComplete = useCallback(
    async (newRatings: SkillRating[]) => {
      setRatings(newRatings);
      setView("generating");
      setGenStep(0);

      const onboarding = onboardingData;

      // ── Bulletproof plan generation ──
      // 1. ALWAYS generate a local plan instantly (guaranteed to work)
      const localPlan: TrainingPlan = onboarding
        ? generateTrainingPlan(onboarding, newRatings)
        : generateTrainingPlan(
            {
              epicName: "Player",
              reloadRank: "Gold",
              brRank: "Gold",
              peakReloadRank: "Platinum",
              peakBrRank: "Platinum",
              inputDevice: "kbm",
              playtimeHoursPerDay: 2,
              playtimeDaysPerWeek: 5,
              goals: [],
            },
            newRatings
          );

      // Helper: fetch with timeout so nothing hangs forever
      const fetchSafe = async (
        url: string,
        options: RequestInit,
        timeoutMs = 12000
      ): Promise<Response | null> => {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeoutMs);
          const res = await fetch(url, { ...options, signal: ctrl.signal });
          clearTimeout(timer);
          return res;
        } catch {
          return null;
        }
      };

      const steps: (() => Promise<void>)[] = [
        // Step 1: save weakness ratings
        async () => {
          setGenStep(0);
          for (let attempt = 0; attempt < 3; attempt++) {
            const res = await fetchSafe(
              "/api/weaknesses",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, ratings: newRatings }),
              },
              8000
            );
            if (res?.ok) return;
          }
        },
        // Step 2: mark onboarding complete
        async () => {
          setGenStep(1);
          if (!onboarding) return;
          for (let attempt = 0; attempt < 3; attempt++) {
            const res = await fetchSafe(
              "/api/profile",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId,
                  ...onboarding,
                  onboardingComplete: true,
                }),
              },
              8000
            );
            if (res?.ok) return;
          }
        },
        // Step 3: generate + persist plan via API (with local fallback)
        async () => {
          setGenStep(2);
          let finalPlan: TrainingPlan | null = null;
          for (let attempt = 0; attempt < 2; attempt++) {
            const res = await fetchSafe(
              "/api/plan",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId,
                  // Send full context so the API never 404s even if profile save failed
                  onboarding: onboarding ?? undefined,
                  ratings: newRatings,
                }),
              },
              10000
            );
            if (res?.ok) {
              try {
                const data = await res.json();
                if (data?.plan && Array.isArray(data.plan.dailyPlans)) {
                  finalPlan = data.plan as TrainingPlan;
                  break;
                }
              } catch {
                // fall through to retry/fallback
              }
            }
          }
          // Fallback: local plan (same generator the API uses) — ALWAYS succeeds
          setPlan(finalPlan ?? localPlan);
        },
      ];

      // Run every step; never let one failure block the others
      for (const step of steps) {
        try {
          await step();
        } catch {
          // continue — next step
        }
      }

      // Micro-delay so the user sees completion, then go to dashboard — ALWAYS
      setGenStep(3);
      await new Promise((r) => setTimeout(r, 600));
      setView("dashboard");
    },
    [sessionId, onboardingData]
  );

  const handleResetProfile = useCallback(() => {
    localStorage.removeItem("apexforge_session");
    const newSid = crypto.randomUUID();
    localStorage.setItem("apexforge_session", newSid);
    setSessionId(newSid);
    setOnboardingData(null);
    setRatings([]);
    setPlan(null);
    setView("landing");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading ApexForge...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {view === "landing" && <LandingHero onStart={handleStartOnboarding} />}
      {view === "onboarding" && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
      {view === "weaknesses" && (
        <WeaknessSelection onComplete={handleWeaknessComplete} />
      )}
      {view === "generating" && (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
          <div className="fixed inset-0 z-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[200px] animate-pulse" />
          </div>
          <div className="relative z-10 w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-accent-blue animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-4 border-transparent border-t-white/90 animate-spin" />
            </div>
            <h2 className="text-2xl font-black mb-2">
              Building Your Plan<span className="animate-pulse">…</span>
            </h2>
            <p className="text-text-secondary text-sm mb-8">
              Analyzing your profile and crafting a personalized training schedule
            </p>
            <div className="space-y-3 text-left">
              {[
                "Saving your skill ratings",
                "Finalizing your profile",
                "Generating your training plan",
                "Loading your dashboard",
              ].map((label, i) => {
                const state =
                  i < genStep ? "done" : i === genStep ? "active" : "pending";
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${
                      state === "done"
                        ? "bg-success/10 border-success/30"
                        : state === "active"
                        ? "bg-accent/15 border-accent/40"
                        : "bg-bg-card border-border opacity-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        state === "done"
                          ? "bg-success text-white"
                          : state === "active"
                          ? "bg-accent text-white"
                          : "bg-bg-tertiary text-text-muted"
                      }`}
                    >
                      {state === "done" ? (
                        "✓"
                      ) : state === "active" ? (
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        state === "pending" ? "text-text-muted" : "text-text-primary"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {view === "dashboard" && onboardingData && (
        <Dashboard
          sessionId={sessionId}
          onboarding={onboardingData}
          ratings={ratings}
          plan={plan}
          onReset={handleResetProfile}
        />
      )}
    </main>
  );
}
