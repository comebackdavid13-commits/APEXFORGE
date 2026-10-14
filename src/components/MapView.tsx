"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map as MapIcon,
  MapPin,
  ChevronRight,
  Navigation,
  Users,
  Crosshair,
  Shield,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  Route,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import {
  pois,
  recommendedRoutes,
  weapons,
  metaLoadout,
  modeLoadouts,
  zeroBuildLoadouts,
  type POI,
  type DropRoute,
  type ModeLoadoutSet,
} from "@/lib/fortnite-data";
import {
  labelPositions,
  mapLayers,
  layerDefinitions,
  type LayerKey,
} from "@/lib/map-layers";
import {
  ChestIcon,
  AmmoBoxIcon,
  VehicleIcon,
  VendingIcon,
  WeaponTypeIcon,
  WeaponImage,
} from "@/components/icons";

interface MapViewProps {
  inputDevice: "kbm" | "controller";
}

type ViewMode = "map" | "routes" | "meta";

const lootBadge: Record<string, string> = {
  S: "bg-yellow-400 text-black",
  A: "bg-purple-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-gray-500 text-white",
};

const contestDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-400",
  low: "bg-green-500",
};

// ── Interactive real map with pan/zoom ──
function InteractiveMap({
  selectedPoi,
  onSelectPoi,
  activeRoute,
}: {
  selectedPoi: POI | null;
  onSelectPoi: (poi: POI | null) => void;
  activeRoute: DropRoute | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  // Toggleable map layers
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    poiNames: true,
    chests: false,
    ammoBoxes: false,
    vehicles: false,
    vendingMachines: false,
  });

  const clampPan = useCallback(
    (x: number, y: number, z: number) => {
      const el = containerRef.current;
      if (!el) return { x, y };
      const max = (el.clientWidth * (z - 1)) / 2;
      return {
        x: Math.max(-max, Math.min(max, x)),
        y: Math.max(-max, Math.min(max, y)),
      };
    },
    []
  );

  const applyZoom = useCallback(
    (next: number) => {
      const z = Math.max(1, Math.min(3, next));
      setZoom(z);
      setPan((p) => clampPan(p.x, p.y, z));
    },
    [clampPan]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => clampPan(p.x + dx, p.y + dy, zoom));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  // Route path points — resolve pathIds to POI positions ("zone" = map center endpoint)
  const routePoints: { x: number; y: number; label: string; isZone?: boolean }[] = [];
  if (activeRoute) {
    for (const id of activeRoute.pathIds) {
      if (id === "zone") {
        routePoints.push({ x: 47, y: 50, label: "Zone", isZone: true });
      } else {
        const found = pois.find((p) => p.id === id);
        if (found)
          routePoints.push({ x: found.gridPosition.x, y: found.gridPosition.y, label: found.name });
      }
    }
  }

  return (
    <div className="relative bg-black/40 border border-border rounded-2xl overflow-hidden select-none">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        <button
          onClick={() => applyZoom(zoom + 0.5)}
          className="w-9 h-9 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyZoom(zoom - 0.5)}
          className="w-9 h-9 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="w-9 h-9 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Title chip */}
      <div className="absolute top-3 left-3 z-30 bg-black/70 backdrop-blur border border-white/10 rounded-lg px-3 py-1.5 pointer-events-none">
        <span className="text-white text-xs font-bold tracking-wide">
          SHATTERED COAST
        </span>
        <span className="text-white/50 text-xs ml-2">C7S3</span>
      </div>

      {/* Layer toggles */}
      <div className="px-3 py-2.5 border-b border-border bg-bg-secondary/60 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">
          Layers
        </span>
        {layerDefinitions.map((layer) => {
          const on = layers[layer.key];
          const LIcon =
            layer.key === "chests"
              ? ChestIcon
              : layer.key === "ammoBoxes"
              ? AmmoBoxIcon
              : layer.key === "vehicles"
              ? VehicleIcon
              : layer.key === "vendingMachines"
              ? VendingIcon
              : null;
          return (
            <button
              key={layer.key}
              onClick={() =>
                setLayers((l) => ({ ...l, [layer.key]: !l[layer.key] }))
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                on
                  ? "bg-accent/25 text-white border border-accent/40"
                  : "bg-black/30 text-text-muted border border-border hover:text-text-secondary"
              }`}
            >
              {LIcon && (
                <span className={`${layer.color} ${on ? "" : "opacity-40"}`}>
                  <LIcon className="w-3.5 h-3.5" />
                </span>
              )}
              {layer.label}
              {layer.count !== null && (
                <span className={`${on ? "text-white/60" : "text-text-muted"} text-[9px]`}>
                  {layer.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map viewport */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square overflow-hidden cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={(e) => applyZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25))}
      >
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
          }}
        >
          {/* Real map image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/shattered-coast-map.png"
            alt="Shattered Coast map"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Chest layer */}
          {layers.chests &&
            mapLayers.chests.map((p, i) => (
              <span
                key={`chest-${i}`}
                className="absolute z-[5] text-yellow-400"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) scale(${Math.max(
                    0.6,
                    1 / Math.pow(zoom, 0.7)
                  )})`,
                }}
                title="Chest"
              >
                <ChestIcon className="w-3 h-3 drop-shadow-[0_1px_1.5px_rgba(0,0,0,1)]" />
              </span>
            ))}

          {/* Ammo box layer */}
          {layers.ammoBoxes &&
            mapLayers.ammoBoxes.map((p, i) => (
              <span
                key={`ammo-${i}`}
                className="absolute z-[5] text-green-500"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) scale(${Math.max(
                    0.6,
                    1 / Math.pow(zoom, 0.7)
                  )})`,
                }}
                title="Ammo Box"
              >
                <AmmoBoxIcon className="w-3 h-3 drop-shadow-[0_1px_1.5px_rgba(0,0,0,1)]" />
              </span>
            ))}

          {/* Vehicle layer */}
          {layers.vehicles &&
            mapLayers.vehicles.map((p, i) => (
              <span
                key={`veh-${i}`}
                className="absolute z-[5] text-sky-400"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) scale(${Math.max(
                    0.6,
                    1 / Math.pow(zoom, 0.7)
                  )})`,
                }}
                title="Vehicle"
              >
                <VehicleIcon className="w-3.5 h-3.5 drop-shadow-[0_1px_1.5px_rgba(0,0,0,1)]" />
              </span>
            ))}

          {/* Vending machine layer */}
          {layers.vendingMachines &&
            mapLayers.vendingMachines.map((p, i) => (
              <span
                key={`vend-${i}`}
                className="absolute z-[5] text-fuchsia-400"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) scale(${Math.max(
                    0.6,
                    1 / Math.pow(zoom, 0.7)
                  )})`,
                }}
                title="Vending Machine"
              >
                <VendingIcon className="w-3 h-3 drop-shadow-[0_1px_1.5px_rgba(0,0,0,1)]" />
              </span>
            ))}

          {/* Route path layer */}
          {routePoints.length > 1 && (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <polyline
                points={routePoints.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="rgba(168,85,247,0.9)"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1.5,1.2"
              />
              {routePoints.map((p, i) =>
                p.isZone ? (
                  // Zone endpoint: storm circle marker
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.2"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="0.55"
                      strokeDasharray="1.2,0.9"
                      opacity="0.9"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="1.7"
                      fill="#a855f7"
                      stroke="white"
                      strokeWidth="0.45"
                    />
                  </g>
                ) : (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="1.6"
                      fill="#a855f7"
                      stroke="white"
                      strokeWidth="0.45"
                    />
                    <text
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="2.4"
                      fontWeight="bold"
                    >
                      {i + 1}
                    </text>
                  </g>
                )
              )}
            </svg>
          )}

          {/* Invisible larger hit-areas at true POI centers (so clicking artwork works too) */}
          {pois.map((poi) => {
            const isSelected = selectedPoi?.id === poi.id;
            return (
              <button
                key={`hit-${poi.id}`}
                onClick={() => {
                  if (!moved.current) onSelectPoi(isSelected ? null : poi);
                }}
                className="absolute z-10"
                style={{
                  left: `${poi.gridPosition.x}%`,
                  top: `${poi.gridPosition.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 36,
                  height: 36,
                }}
                aria-label={poi.name}
              />
            );
          })}

          {/* POI name labels at official label positions (counter-scaled for zoom) */}
          {layers.poiNames &&
            pois.map((poi) => {
              const lp = labelPositions[poi.id] || poi.gridPosition;
              const isSelected = selectedPoi?.id === poi.id;
              return (
                <button
                  key={`label-${poi.id}`}
                  onClick={() => {
                    if (!moved.current) onSelectPoi(isSelected ? null : poi);
                  }}
                  className="absolute z-20 group"
                  style={{
                    left: `${lp.x}%`,
                    top: `${lp.y}%`,
                    transform: `translate(-50%, -50%) scale(${Math.max(
                      0.55,
                      1 / Math.pow(zoom, 0.65)
                    )})`,
                    transformOrigin: "center",
                  }}
                >
                  <span
                    className={`block px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide text-[11px] whitespace-nowrap transition-all ${
                      isSelected
                        ? "text-accent-light bg-accent/20"
                        : "text-white group-hover:text-accent-light"
                    }`}
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.9)",
                    }}
                  >
                    {poi.name}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-border bg-bg-secondary/60 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className="text-text-muted font-medium">Traffic:</span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className={`w-2.5 h-2.5 rounded-full ${contestDot.high}`} /> High
        </span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className={`w-2.5 h-2.5 rounded-full ${contestDot.medium}`} /> Medium
        </span>
        <span className="flex items-center gap-1.5 text-text-secondary">
          <span className={`w-2.5 h-2.5 rounded-full ${contestDot.low}`} /> Low
        </span>
        <span className="text-text-muted ml-auto hidden sm:block">
          Scroll to zoom • Drag to pan
        </span>
      </div>
    </div>
  );
}

// ── Loadout slot card with real weapon render + silhouette fallback ──
function LoadoutSlot({
  slot,
  item,
  type,
  label,
  img,
}: {
  slot: string;
  item: string;
  type: "shotgun" | "ar" | "smg" | "heals" | "utility";
  label: string;
  img?: string;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="p-3 rounded-xl bg-bg-card/50 border border-border/50 hover:border-accent/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          {slot}
        </span>
        <span className="text-[10px] text-accent">{label}</span>
      </div>
      <div className="h-12 flex items-center justify-center my-1 text-text-primary/90">
        {img && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={item}
            loading="lazy"
            draggable={false}
            onError={() => setImgError(true)}
            className="h-full w-auto object-contain"
            style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.55))" }}
          />
        ) : (
          <WeaponTypeIcon type={type} className="h-8 w-auto" />
        )}
      </div>
      <p className="font-semibold text-xs text-center leading-tight">{item}</p>
    </div>
  );
}

// ── Role-based loadout section with Solo/Duo/Trio/Squad modes ──
function RoleLoadoutSection() {
  const [modeId, setModeId] = useState<ModeLoadoutSet["id"]>("solo");
  const [compMode, setCompMode] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const mode = modeLoadouts.find((m) => m.id === modeId) || modeLoadouts[0];

  const gridCols =
    mode.roles.length === 1
      ? "grid-cols-1 max-w-xl"
      : mode.roles.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : mode.roles.length === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-blue/5 border border-accent/20">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          C7S3 Meta Loadouts
        </h3>
        <div className="flex items-center gap-2">
          {/* Pub / Comp toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-border">
            <button
              onClick={() => setCompMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !compMode
                  ? "bg-accent-cyan/80 text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Pubs
            </button>
            <button
              onClick={() => setCompMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                compMode
                  ? "bg-gold/80 text-black"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Comp
            </button>
          </div>
          {/* Mode selector */}
          <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-border">
            {modeLoadouts.map((m) => (
              <button
                key={m.id}
                onClick={() => setModeId(m.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  modeId === m.id
                    ? "bg-accent text-white shadow-[0_0_12px_rgba(108,92,231,0.4)]"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {compMode && (
        <div className="mb-5 px-3 py-2 rounded-lg bg-gold/10 border border-gold/25 text-[11px] text-gold/90 leading-snug">
          Competitive mode — items disabled in comp playlists (like Rift-to-Go)
          are swapped for comp-legal alternatives.
        </div>
      )}

      <p className="text-text-secondary text-xs mb-5">
        {mode.id === "solo"
          ? "One loadout to cover everything yourself."
          : mode.id === "duo"
          ? "IGL leads the plan — the Fragger opens the fight."
          : mode.id === "trio"
          ? "IGL + Entry + Rifler: call it, break it, beam it."
          : "Full squad roles: call it, break it, clean it, support it."}
      </p>

      <div className={`grid ${gridCols} gap-4`}>
        {mode.roles.map((role) => (
          <motion.div
            key={`${mode.id}-${role.role}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-bg-card/60 border border-border overflow-hidden"
          >
            {/* Role header */}
            <div className="px-4 pt-4 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${role.badge}`}
                >
                  {role.role}
                </span>
                <Users className="w-4 h-4 text-text-muted" />
              </div>
              <p className="text-text-secondary text-[11px] leading-snug">
                {role.tagline}
              </p>
            </div>

            {/* Slots */}
            <div className="divide-y divide-border/50">
              {role.slots.map((rawSlot, si) => {
                const key = `${mode.id}-${role.role}-${si}`;
                const swapped =
                  compMode && rawSlot.noComp && rawSlot.compAlternative
                    ? rawSlot.compAlternative
                    : null;
                const slot = swapped || rawSlot;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      swapped ? "bg-gold/[0.06]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="text-[9px] text-text-muted font-bold w-3">
                      {si + 1}
                    </span>
                    <div className="h-9 w-16 flex items-center justify-center flex-shrink-0">
                      {slot.image && !imgErrors[key] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slot.image}
                          alt={slot.item}
                          loading="lazy"
                          draggable={false}
                          onError={() =>
                            setImgErrors((e) => ({ ...e, [key]: true }))
                          }
                          className="max-h-9 w-auto object-contain"
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                          }}
                        />
                      ) : (
                        <WeaponTypeIcon
                          type={slot.type}
                          className="h-6 w-auto text-text-secondary"
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium leading-tight flex-1">
                      {slot.item}
                    </span>
                    {swapped && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30 uppercase tracking-wide flex-shrink-0">
                        Comp Swap
                      </span>
                    )}
                    {!compMode && rawSlot.noComp && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted border border-border uppercase tracking-wide flex-shrink-0">
                        Pubs Only
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="px-4 py-3 bg-black/20">
              <ul className="space-y-1.5">
                {role.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex gap-1.5 text-[11px] text-text-secondary leading-snug"
                  >
                    <span className={role.accent}>▸</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-text-muted text-xs mt-5">{metaLoadout.note}</p>
    </div>
  );
}

export function MapView({ inputDevice }: MapViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [activeRoute, setActiveRoute] = useState<DropRoute | null>(null);
  const [liveMeta, setLiveMeta] = useState<{
    lastUpdated: string;
    patchNotes: { id: string; title: string; body: string; date: string }[];
    weaponUpdates: { weaponName: string; status: "buffed" | "nerfed" | "vaulted" | "unchanged"; reason: string; patchDate: string }[];
    activeSeason: string;
  } | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);

  // Live meta sync — poll every 30 minutes
  const loadLiveMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const res = await fetch("/api/live-meta");
      if (res.ok) {
        const data = await res.json();
        setLiveMeta(data);
      }
    } catch (err) {
      console.error("Live meta error:", err);
    }
    setMetaLoading(false);
  }, []);

  useEffect(() => {
    loadLiveMeta();
    const timer = setInterval(loadLiveMeta, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, [loadLiveMeta]);

  // Compute live tier list — defaults to static if no live data
  function bumpTier(
    tier: "S" | "A" | "B" | "C" | "D",
    direction: "up" | "down"
  ): "S" | "A" | "B" | "C" | "D" {
    const order: ("S" | "A" | "B" | "C" | "D")[] = ["S", "A", "B", "C", "D"];
    const idx = order.indexOf(tier);
    if (direction === "up") {
      return order[Math.max(0, idx - 1)] || tier;
    }
    return order[Math.min(order.length - 1, idx + 1)] || tier;
  }

  const liveWeapons = liveMeta
    ? weapons.map((w) => {
        const override = liveMeta.weaponUpdates.find(
          (u) => u.weaponName.toLowerCase() === w.name.toLowerCase()
        );
        if (override) {
          const lt = override.status === "buffed" ? bumpTier(w.tier, "up") : override.status === "nerfed" ? bumpTier(w.tier, "down") : w.tier;
          return { ...w, liveTier: lt, status: override.status, reason: override.reason };
        }
        return { ...w, liveTier: w.tier, status: "unchanged" as const };
      })
    : weapons.map((w) => ({ ...w, liveTier: w.tier, status: "unchanged" as const }));

  const openRoute = (route: DropRoute) => {
    setActiveRoute((r) => (r?.name === route.name ? null : route));
    setViewMode("routes");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-accent" />
            Shattered Coast — Chapter 7 Season 3
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Real in-game map with POIs, drop routes, and current meta
          </p>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: "map", label: "POI Map", icon: <MapPin className="w-4 h-4" /> },
          { id: "routes", label: "Drop Routes", icon: <Navigation className="w-4 h-4" /> },
          { id: "meta", label: "Meta & Loadout", icon: <Crosshair className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as ViewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === tab.id
                ? "bg-accent/20 text-accent-light border border-accent/30"
                : "bg-bg-card text-text-secondary border border-border hover:border-border-light"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── MAP VIEW ── */}
      {viewMode === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <InteractiveMap
              selectedPoi={selectedPoi}
              onSelectPoi={setSelectedPoi}
              activeRoute={null}
            />
          </div>

          {/* POI Details Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedPoi ? (
                <motion.div
                  key={selectedPoi.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border bg-bg-secondary/40">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{selectedPoi.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              lootBadge[selectedPoi.lootTier]
                            }`}
                          >
                            {selectedPoi.lootTier}-TIER LOOT
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-text-secondary capitalize">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                contestDot[selectedPoi.contestLevel]
                              }`}
                            />
                            {selectedPoi.contestLevel} traffic
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPoi(null)}
                        className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <p className="text-text-secondary text-sm">
                      {selectedPoi.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-bg-secondary">
                        <span className="text-xs text-text-muted">
                          Chest Spawns
                        </span>
                        <p className="text-lg font-bold">{selectedPoi.chestCount}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-bg-secondary">
                        <span className="text-xs text-text-muted">Biome</span>
                        <p className="text-lg font-bold capitalize">
                          {selectedPoi.biome}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Rotate To
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPoi.rotateTowards.map((targetId) => {
                          const target = pois.find((p) => p.id === targetId);
                          if (!target) return null;
                          return (
                            <button
                              key={targetId}
                              onClick={() => setSelectedPoi(target)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-hover transition-colors text-xs font-medium"
                            >
                              <ChevronRight className="w-3 h-3 text-accent" />
                              {target.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Pro Tips
                      </h4>
                      <ul className="space-y-2">
                        {selectedPoi.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-text-secondary"
                          >
                            <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-bg-card border border-border rounded-2xl p-8 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Select a POI</h3>
                  <p className="text-text-secondary text-sm">
                    Click any marker on the map for loot info, rotation paths,
                    and pro tips.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick list */}
            <div className="mt-4 bg-bg-card border border-border rounded-2xl p-4">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                All Named Locations
              </h4>
              <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto">
                {pois.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() =>
                      setSelectedPoi(selectedPoi?.id === poi.id ? null : poi)
                    }
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                      selectedPoi?.id === poi.id
                        ? "bg-accent/15 border border-accent/30"
                        : "bg-bg-secondary hover:bg-bg-hover border border-transparent"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                        lootBadge[poi.lootTier]
                      }`}
                    >
                      {poi.lootTier}
                    </span>
                    <span className="text-xs font-medium truncate">
                      {poi.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ROUTES VIEW ── */}
      {viewMode === "routes" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3 order-2 lg:order-1">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm">
                  AI-Recommended Routes
                </span>
              </div>
              <p className="text-text-secondary text-xs">
                Click a route to draw its rotation path on the map.
              </p>
            </div>

            {recommendedRoutes.map((route) => {
              const isActive = activeRoute?.name === route.name;
              return (
                <button
                  key={route.name}
                  onClick={() =>
                    setActiveRoute(isActive ? null : route)
                  }
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-accent/10 border-accent/40"
                      : "bg-bg-card border-border hover:border-border-light"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-sm">{route.name}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                          route.playstyle === "safe"
                            ? "bg-green-500/15 text-green-400"
                            : route.playstyle === "balanced"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {route.playstyle}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1 capitalize">
                        <Users className="w-3 h-3" />
                        {route.mode === "all" ? "all" : route.mode}
                      </span>
                    </div>
                  </div>
                  <p className="text-text-secondary text-xs mb-3">
                    {route.description}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {route.rotationPath.map((stop, i) => (
                      <div key={i} className="flex items-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            i === 0
                              ? "bg-accent text-white"
                              : "bg-bg-secondary text-text-secondary"
                          }`}
                        >
                          {stop}
                        </span>
                        {i < route.rotationPath.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-text-muted mx-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                  {isActive && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-accent-light">
                      <Route className="w-3.5 h-3.5" /> Showing path on map
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <InteractiveMap
              selectedPoi={selectedPoi}
              onSelectPoi={setSelectedPoi}
              activeRoute={activeRoute}
            />
            {activeRoute && (
              <div className="mt-4 p-4 rounded-xl bg-bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Route className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-sm">
                    {activeRoute.name}
                  </span>
                </div>
                <p className="text-text-secondary text-sm">
                  {activeRoute.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── META VIEW ── */}
      {viewMode === "meta" && (
        <div className="space-y-6">
          {/* Live meta banner — patch notes + active season */}
          {liveMeta && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm">Live Meta</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    {liveMeta.activeSeason}
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  Auto-updated every 30 min •{" "}
                  {new Date(liveMeta.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
              {liveMeta.patchNotes.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-amber-300 mb-1">
                    Latest patch note
                  </h4>
                  <p className="text-sm text-text-secondary">
                    <span className="font-bold text-text-primary">
                      {liveMeta.patchNotes[0].title}
                    </span>
                    {" — "}
                    {liveMeta.patchNotes[0].body
                      .replace(/\n/g, " ")
                      .slice(0, 250)}
                    {liveMeta.patchNotes[0].body.length > 250 && "…"}
                  </p>
                </div>
              )}
              {liveMeta.weaponUpdates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {liveMeta.weaponUpdates.slice(0, 6).map((u) => (
                    <span
                      key={u.weaponName}
                      className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1 ${
                        u.status === "buffed"
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : u.status === "nerfed"
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : "bg-bg-secondary text-text-secondary border border-border"
                      }`}
                    >
                      {u.status === "buffed" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : u.status === "nerfed" ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {u.weaponName} {u.status}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role-based loadouts per team mode */}
          <RoleLoadoutSection />

          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold">Weapon Tier List</h3>
              {metaLoading ? (
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Syncing live meta…
                </span>
              ) : (
                <button
                  onClick={loadLiveMeta}
                  className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh now
                </button>
              )}
            </div>
            {["S", "A", "B", "C", "D"].map((tier) => {
              const tierWeapons = liveWeapons.filter(
                (w) => w.liveTier === tier
              );
              if (tierWeapons.length === 0) return null;
              const tierConfig: Record<string, { color: string; label: string }> = {
                S: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Must Pick" },
                A: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Strong" },
                B: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Good" },
                C: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "Situational" },
                D: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Avoid" },
              };
              const config = tierConfig[tier];
              return (
                <div key={tier} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${config.color}`}
                    >
                      {tier}
                    </span>
                    <span className="text-sm text-text-muted">{config.label}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tierWeapons.map((weapon) => {
                      const liveWeapon = liveWeapons.find(
                        (lw) => lw.name === weapon.name
                      );
                      const status = liveWeapon?.status || "unchanged";
                      return (
                      <div
                        key={weapon.name}
                        className="p-4 rounded-xl bg-bg-card border border-border hover:border-border-light transition-colors relative"
                      >
                        {status !== "unchanged" && (
                          <span
                            className={`absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              status === "buffed"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {status === "buffed" ? (
                              <TrendingUp className="w-2.5 h-2.5" />
                            ) : (
                              <TrendingDown className="w-2.5 h-2.5" />
                            )}
                            {status.toUpperCase()}
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-14 flex items-center justify-start flex-1 min-w-0">
                            <WeaponImage
                              weapon={weapon}
                              className="h-13 w-auto max-h-14 object-contain"
                              iconClassName={`h-8 w-auto ${
                                tier === "S"
                                  ? "text-yellow-400"
                                  : tier === "A"
                                  ? "text-purple-400"
                                  : tier === "B"
                                  ? "text-blue-400"
                                  : tier === "C"
                                  ? "text-gray-400"
                                  : "text-red-400"
                              }`}
                            />
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-bg-secondary text-text-muted capitalize flex-shrink-0">
                            {weapon.type}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1.5">
                          {weapon.name}
                        </h4>
                        <p className="text-text-secondary text-xs mb-2">
                          {weapon.description}
                        </p>
                        <p className="text-xs text-accent">
                          Best for: {weapon.bestFor}
                        </p>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-xl bg-bg-card border border-border">
            <h3 className="font-semibold mb-3">
              {inputDevice === "controller" ? "Controller" : "KBM"} Tips for
              This Meta
            </h3>
            {inputDevice === "controller" ? (
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Striker Pump + Flex SMG is your bread and butter. Practice
                  quick-swapping.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Use ADS on Flex SMG at mid-range to maximize aim assist
                  tracking.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Surgical Burst rewards controller tracking — tap fire for
                  accuracy.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Overdrive Grenades are crucial for repositioning quickly.
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Striker Pump rewards flick shots — warm up in Skaavok before
                  queuing.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Surgical Burst has zero bloom — abuse this with quick peeks.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Hip-fire Flex SMG in close range for faster movement speed.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  Your edit speed advantage shines — piece control into pump
                  shots.
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
