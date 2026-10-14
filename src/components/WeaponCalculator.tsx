"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair,
  ChevronDown,
  Scale,
  Zap,
  Shield,
  Clock,
  Swords,
} from "lucide-react";
import {
  weaponStats,
  rarities,
  type WeaponStat,
  type Rarity,
  calculateDPS,
  shotsToKillTable,
} from "@/lib/weapon-stats";

const hpOptions = [100, 150, 200, 250];

export function WeaponCalculator() {
  const [selectedA, setSelectedA] = useState<WeaponStat>(weaponStats[0]);
  const [selectedB, setSelectedB] = useState<WeaponStat>(weaponStats[6]);
  const [rarityA, setRarityA] = useState<Rarity>("Epic");
  const [rarityB, setRarityB] = useState<Rarity>("Epic");
  const [compareMode, setCompareMode] = useState(false);

  const dpsA = useMemo(() => calculateDPS(selectedA, rarityA), [selectedA, rarityA]);
  const dpsB = useMemo(() => calculateDPS(selectedB, rarityB), [selectedB, rarityB]);

  const statA = selectedA.stats[rarityA];
  const statB = selectedB.stats[rarityB];

  const killTableA = useMemo(
    () => shotsToKillTable(selectedA, rarityA),
    [selectedA, rarityA]
  );
  const killTableB = useMemo(
    () => shotsToKillTable(selectedB, rarityB),
    [selectedB, rarityB]
  );

  const WeaponCard = ({
    weapon,
    rarity,
    setWeapon,
    setRarity,
    dps,
    stat,
    killTable,
    side,
  }: {
    weapon: WeaponStat;
    rarity: Rarity;
    setWeapon: (w: WeaponStat) => void;
    setRarity: (r: Rarity) => void;
    dps: number;
    stat: { damage: number; fireRate: number; reload: number; mag: number };
    killTable: { hp: number; body: number; head: number }[];
    side: "left" | "right";
  }) => {
    const [showPicker, setShowPicker] = useState(false);

    return (
      <div
        className={`rounded-2xl bg-bg-card border border-border overflow-hidden ${
          compareMode && side === "right" ? "border-accent/40" : ""
        }`}
      >
        {/* Header / picker */}
        <div className="p-5 border-b border-border">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-4">
              {weapon.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={weapon.image}
                  alt={weapon.name}
                  className="w-20 h-20 object-contain"
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-bg-secondary flex items-center justify-center">
                  <Crosshair className="w-8 h-8 text-text-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg truncate">{weapon.name}</h3>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform ${
                      showPicker ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <p className="text-text-secondary text-xs mt-0.5">
                  {weapon.type} • {weapon.ammo} ammo
                </p>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {weaponStats.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setWeapon(w);
                        setShowPicker(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                        w.id === weapon.id
                          ? "bg-accent/20 border border-accent/30"
                          : "bg-bg-secondary hover:bg-bg-hover"
                      }`}
                    >
                      {w.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.image}
                          alt={w.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Crosshair className="w-4 h-4 text-text-muted" />
                      )}
                      <span className="truncate">{w.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rarity selector */}
          <div className="flex gap-1 mt-4 flex-wrap">
            {rarities.map((r: Rarity) => (
              <button
                key={r}
                onClick={() => setRarity(r)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  rarity === r
                    ? "bg-accent text-white"
                    : "bg-bg-secondary text-text-muted hover:text-text-primary"
                }`}
              >
                {r.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-bg-secondary">
              <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                <Zap className="w-3 h-3" /> DPS
              </div>
              <p className="text-xl font-bold text-accent-light">{dps}</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary">
              <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
                <Swords className="w-3 h-3" /> Damage
              </div>
              <p className="text-xl font-bold">{stat.damage}</p>
              <p className="text-[10px] text-text-muted">
                HS: {Math.round(stat.damage * weapon.headshotMultiplier)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-2.5 rounded-xl bg-bg-secondary text-center">
              <p className="text-[10px] text-text-muted">Fire Rate</p>
              <p className="font-bold text-sm">{stat.fireRate}/s</p>
            </div>
            <div className="p-2.5 rounded-xl bg-bg-secondary text-center">
              <p className="text-[10px] text-text-muted">Reload</p>
              <p className="font-bold text-sm">{stat.reload}s</p>
            </div>
            <div className="p-2.5 rounded-xl bg-bg-secondary text-center">
              <p className="text-[10px] text-text-muted">Mag</p>
              <p className="font-bold text-sm">{stat.mag}</p>
            </div>
          </div>

          {/* Shots to kill */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Shots to Kill
            </h4>
            <div className="space-y-1.5">
              {killTable.map((row) => (
                <div
                  key={row.hp}
                  className="flex items-center justify-between p-2 rounded-lg bg-bg-secondary/50 text-xs"
                >
                  <span className="text-text-secondary">{row.hp} HP</span>
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary">
                      Body{" "}
                      <span className="text-white font-bold">{row.body}</span>
                    </span>
                    <span className="text-accent-light">
                      Head{" "}
                      <span className="font-bold">{row.head}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TTK rows */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Time to Kill
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {hpOptions.map((hp) => {
                const seconds = hp / dps;
                return (
                  <div
                    key={hp}
                    className="p-2 rounded-lg bg-bg-secondary/50 text-xs flex justify-between"
                  >
                    <span className="text-text-secondary">{hp} HP</span>
                    <span className="font-bold">
                      {seconds < 0.01 ? "—" : `${seconds.toFixed(2)}s`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-accent" />
            Weapon Damage Calculator
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Compare DPS, shots to kill, and TTK across rarities
          </p>
        </div>
        <button
          onClick={() => setCompareMode((c) => !c)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all self-start ${
            compareMode
              ? "bg-accent text-white"
              : "bg-bg-card text-text-secondary border border-border hover:border-accent/40"
          }`}
        >
          <Scale className="w-4 h-4" />
          {compareMode ? "Single Weapon" : "Compare Two"}
        </button>
      </div>

      {/* Cards */}
      <div className={`grid gap-6 ${compareMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>
        <WeaponCard
          weapon={selectedA}
          rarity={rarityA}
          setWeapon={setSelectedA}
          setRarity={setRarityA}
          dps={dpsA}
          stat={statA}
          killTable={killTableA}
          side="left"
        />
        {compareMode && (
          <WeaponCard
            weapon={selectedB}
            rarity={rarityB}
            setWeapon={setSelectedB}
            setRarity={setRarityB}
            dps={dpsB}
            stat={statB}
            killTable={killTableB}
            side="right"
          />
        )}
      </div>

      {/* Comparison summary */}
      {compareMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 rounded-2xl bg-bg-card border border-border"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-accent" />
            Quick Comparison
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-bg-secondary">
              <p className="text-[10px] text-text-muted mb-1">Higher DPS</p>
              <p className="font-bold text-sm">
                {dpsA > dpsB
                  ? selectedA.name
                  : dpsB > dpsA
                  ? selectedB.name
                  : "Tie"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary">
              <p className="text-[10px] text-text-muted mb-1">Better Body TTK 200HP</p>
              <p className="font-bold text-sm">
                {200 / dpsA < 200 / dpsB
                  ? selectedA.name
                  : 200 / dpsB < 200 / dpsA
                  ? selectedB.name
                  : "Tie"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary">
              <p className="text-[10px] text-text-muted mb-1">Higher Damage/Shot</p>
              <p className="font-bold text-sm">
                {statA.damage > statB.damage
                  ? selectedA.name
                  : statB.damage > statA.damage
                  ? selectedB.name
                  : "Tie"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary">
              <p className="text-[10px] text-text-muted mb-1">Bigger Mag</p>
              <p className="font-bold text-sm">
                {statA.mag > statB.mag
                  ? selectedA.name
                  : statB.mag > statA.mag
                  ? selectedB.name
                  : "Tie"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
