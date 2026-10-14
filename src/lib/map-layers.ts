// Types only used in comments; spawn data comes from generated-spawns.json

// ════════════════════════════════════════════════════════════════════════════
// MAP LAYERS — toggleable markers (chests, ammo, vehicles, vending machines)
// Chest positions are estimated spawn areas generated deterministically
// around each POI's true in-game center (from the official Fortnite API).
// ════════════════════════════════════════════════════════════════════════════

// ── Official label anchor points extracted from Epic's labeled map render ──
// (computed by diffing the blank vs labeled 2048px official maps)
export const labelPositions: Record<string, { x: number; y: number }> = {
  "lifty-lodge": { x: 28.4, y: 20.9 },
  "latte-landing": { x: 56.0, y: 24.8 },
  wonkeeland: { x: 69.3, y: 32.6 },
  "chopped-shop": { x: 16.8, y: 35.1 },
  battlewoods: { x: 35.4, y: 36.9 },
  "calamari-canyon": { x: 24.1, y: 50.0 },
  "frosted-flats": { x: 57.3, y: 48.8 },
  "golden-grove": { x: 73.0, y: 54.5 },
  "sinister-strip": { x: 41.5, y: 62.1 },
  "heatwave-harbor": { x: 20.9, y: 68.2 },
  "shaken-sanctuary": { x: 60.8, y: 67.3 },
  "sunken-shores": { x: 42.5, y: 78.4 },
  "cluster-coast": { x: 68.0, y: 80.0 },
  "zero-point": { x: 47.0, y: 45.2 }, // above the center glow
};

export interface LayerPoint {
  x: number;
  y: number;
  poiId: string;
}

export interface MapLayers {
  chests: LayerPoint[];
  ammoBoxes: LayerPoint[];
  vehicles: LayerPoint[];
  vendingMachines: LayerPoint[];
}

// Positions were generated against the real 2048px map render —
// every marker was pixel-verified to sit on land (not ocean/rivers).
import generatedSpawns from "./generated-spawns.json";

function buildLayers(): MapLayers {
  return {
    chests: generatedSpawns.chests as LayerPoint[],
    ammoBoxes: generatedSpawns.ammo as LayerPoint[],
    vehicles: generatedSpawns.vehicles as LayerPoint[],
    vendingMachines: generatedSpawns.vending as LayerPoint[],
  };
}

export const mapLayers = buildLayers();

export type LayerKey = "poiNames" | "chests" | "ammoBoxes" | "vehicles" | "vendingMachines";

export const layerDefinitions: {
  key: LayerKey;
  label: string;
  color: string; // tailwind text color for the button icon
  dotClass: string; // marker style
  count: number | null; // null for poi names
}[] = [
  {
    key: "poiNames",
    label: "POI Names",
    color: "text-white",
    dotClass: "",
    count: null,
  },
  {
    key: "chests",
    label: "Chests",
    color: "text-yellow-400",
    dotClass: "bg-yellow-400 border-yellow-900",
    count: mapLayers.chests.length,
  },
  {
    key: "ammoBoxes",
    label: "Ammo Boxes",
    color: "text-green-400",
    dotClass: "bg-green-500 border-green-950",
    count: mapLayers.ammoBoxes.length,
  },
  {
    key: "vehicles",
    label: "Vehicles",
    color: "text-sky-400",
    dotClass: "bg-sky-400 border-sky-900",
    count: mapLayers.vehicles.length,
  },
  {
    key: "vendingMachines",
    label: "Vending",
    color: "text-fuchsia-400",
    dotClass: "bg-fuchsia-400 border-fuchsia-900",
    count: mapLayers.vendingMachines.length,
  },
];
