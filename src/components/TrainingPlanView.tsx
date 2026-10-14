"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Dumbbell,
  Gamepad2,
  Trophy,
  Eye,
  Coffee,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import type { TrainingPlan, DayPlan } from "@/lib/types";

interface TrainingPlanViewProps {
  plan: TrainingPlan;
}

const sessionIcons: Record<string, React.ReactNode> = {
  warmup: <Dumbbell className="w-4 h-4" />,
  creative: <Gamepad2 className="w-4 h-4" />,
  ranked: <Trophy className="w-4 h-4" />,
  vod: <Eye className="w-4 h-4" />,
  rest: <Coffee className="w-4 h-4" />,
  workshop: <Lightbulb className="w-4 h-4" />,
};

const sessionColors: Record<string, string> = {
  warmup: "text-warning bg-warning/10 border-warning/20",
  creative: "text-accent-light bg-accent/10 border-accent/20",
  ranked: "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20",
  vod: "text-text-primary bg-text-secondary/10 border-text-secondary/20",
  rest: "text-success bg-success/10 border-success/20",
  workshop: "text-gold bg-gold/10 border-gold/20",
};

function DayCard({ dayPlan, index }: { dayPlan: DayPlan; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isRestDay = dayPlan.sessions.length === 1 && dayPlan.sessions[0].type === "rest";

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border overflow-hidden transition-all ${
        isRestDay
          ? "bg-bg-secondary/30 border-border/30"
          : "bg-bg-secondary/50 border-border/50"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-bg-hover/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
              isRestDay
                ? "bg-success/10 text-success"
                : "bg-accent/10 text-accent-light"
            }`}
          >
            {dayPlan.day.slice(0, 3)}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">{dayPlan.day}</h3>
            <p className="text-text-muted text-xs">{dayPlan.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">
            {dayPlan.sessions.length} session{dayPlan.sessions.length !== 1 ? "s" : ""}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-muted"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {dayPlan.sessions.map((session, si) => (
                <div
                  key={si}
                  className={`p-4 rounded-lg border ${sessionColors[session.type] || sessionColors.creative}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {sessionIcons[session.type]}
                      <span className="font-semibold text-sm">{session.title}</span>
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap opacity-80">
                      {session.duration}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-80">
                    {session.description}
                  </p>
                  {session.mapCode && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                        Map Code:
                      </span>
                      <button
                        onClick={() => copyCode(session.mapCode!)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/20 text-xs font-mono hover:bg-black/30 transition-colors"
                      >
                        {session.mapCode}
                        {copiedCode === session.mapCode ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TrainingPlanView({ plan }: TrainingPlanViewProps) {
  return (
    <div>
      {/* Overview */}
      <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Weekly Overview</h3>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          {plan.weeklyOverview}
        </p>
      </div>

      {/* Daily plans */}
      <div className="space-y-3">
        {plan.dailyPlans.map((dp, i) => (
          <DayCard key={dp.day} dayPlan={dp} index={i} />
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl bg-bg-secondary/50 border border-border/50">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gold" />
          Coach&apos;s Tips
        </h3>
        <ul className="space-y-2">
          {plan.tips.map((tip, i) => (
            <li key={i} className="text-text-secondary text-sm flex gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
