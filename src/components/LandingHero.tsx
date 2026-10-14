"use client";

import { motion } from "framer-motion";
import {
  Crosshair,
  Brain,
  Trophy,
  Zap,
  ChevronRight,
  Target,
  Gamepad2,
} from "lucide-react";

interface LandingHeroProps {
  onStart: () => void;
}

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Analysis",
    desc: "Personalized weakness detection and coaching tailored to your playstyle",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Custom Training Plans",
    desc: "Daily & weekly plans with specific Creative maps and drills for your level",
  },
  {
    icon: <Crosshair className="w-6 h-6" />,
    title: "Elite AI Coach",
    desc: "Pro-level coaching advice on demand — aim, builds, game sense, mentality",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Rank-Up Roadmap",
    desc: "Clear path from your current rank to Champion with measurable milestones",
  },
];

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-blue/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(108,92,231,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16">
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-16 sm:mb-24"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ApexForge</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fortnite Coaching Platform</span>
          </div>
        </motion.nav>

        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Elite Coaching
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            Stop grinding.
            <br />
            <span className="gradient-text">Start improving.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            ApexForge analyzes your weaknesses, builds a personalized training plan, and
            gives you pro-level coaching — so every hour you play actually counts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <button
              onClick={onStart}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent to-accent-blue text-white font-semibold text-lg rounded-2xl hover:shadow-[0_0_40px_rgba(108,92,231,0.4)] transition-all duration-300 hover:scale-105"
            >
              Start Your Assessment
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent to-accent-blue opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
            </button>
            <p className="mt-4 text-text-muted text-sm">
              Free • No account required • Takes 3 minutes
            </p>
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-20 sm:mt-28"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="group p-6 rounded-2xl bg-bg-card/50 border border-border hover:border-accent/30 transition-all duration-300 hover:bg-bg-card"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20 text-center"
        >
          <p className="text-text-muted text-sm mb-6">
            Trusted by competitive players worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-text-secondary">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">10K+</div>
              <div className="text-xs text-text-muted">Players</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">50K+</div>
              <div className="text-xs text-text-muted">Plans Generated</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-light">92%</div>
              <div className="text-xs text-text-muted">Rank Up Rate</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">4.9★</div>
              <div className="text-xs text-text-muted">Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
