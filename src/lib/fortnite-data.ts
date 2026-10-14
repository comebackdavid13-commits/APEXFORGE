// ══════════════════════════════════════════════════════════════════════════════
// FORTNITE CHAPTER 7 SEASON 3 — "RUNNERS" — SHATTERED COAST
// Last updated: July 2025
// ══════════════════════════════════════════════════════════════════════════════

export interface POI {
  id: string;
  name: string;
  type: "named" | "landmark";
  biome: "tropical" | "primal" | "desert" | "snow" | "mixed";
  gridPosition: { x: number; y: number }; // 0-100 grid
  lootTier: "S" | "A" | "B" | "C"; // Loot density
  contestLevel: "high" | "medium" | "low";
  chestCount: number;
  description: string;
  rotateTowards: string[];
  tips: string[];
}

export interface Weapon {
  name: string;
  type: "shotgun" | "ar" | "smg" | "sniper" | "pistol" | "utility" | "explosive";
  tier: "S" | "A" | "B" | "C" | "D";
  description: string;
  bestFor: string;
  image?: string; // real render from fortnite.fandom.com
}

// ── SHATTERED COAST POIs (positions from official Fortnite API world coords) ──
export const pois: POI[] = [
  {
    id: "lifty-lodge",
    name: "Lifty Lodge",
    type: "named",
    biome: "snow",
    gridPosition: { x: 33.6, y: 25.4 },
    lootTier: "A",
    contestLevel: "medium",
    chestCount: 32,
    description: "Skiing-inspired POI in the snowy mountains, northwest corner. Massive ziplines for fast rotations.",
    rotateTowards: ["battlewoods", "chopped-shop", "latte-landing"],
    tips: [
      "Use the main zipline for fast height and rotation",
      "Multiple floors in the lodge — clear top to bottom",
      "Good mats from wooden structures"
    ]
  },
  {
    id: "latte-landing",
    name: "Latte Landing",
    type: "named",
    biome: "mixed",
    gridPosition: { x: 57.6, y: 28.6 },
    lootTier: "A",
    contestLevel: "medium",
    chestCount: 30,
    description: "Northern POI that survived from last season. Familiar reference point with good loot.",
    rotateTowards: ["frosted-flats", "wonkeeland", "lifty-lodge"],
    tips: [
      "Good landmark for navigation — center-north",
      "Solid loot without being the hottest drop",
      "Multiple rotation options from here"
    ]
  },
  {
    id: "wonkeeland",
    name: "Wonkeeland",
    type: "named",
    biome: "mixed",
    gridPosition: { x: 68.7, y: 35.4 },
    lootTier: "B",
    contestLevel: "low",
    chestCount: 22,
    description: "Survived from Season 2, in the orange eastern biome. Familiar layout for returning players.",
    rotateTowards: ["golden-grove", "frosted-flats", "latte-landing"],
    tips: [
      "Same layout as before — muscle memory works",
      "Orange biome = open fields, bring an AR",
      "Low contest but watch for players rotating through"
    ]
  },
  {
    id: "chopped-shop",
    name: "Chopped Shop",
    type: "named",
    biome: "mixed",
    gridPosition: { x: 22.7, y: 37.5 },
    lootTier: "B",
    contestLevel: "low",
    chestCount: 16,
    description: "Vehicle customization POI on the far west. Safe drop with guaranteed vehicles.",
    rotateTowards: ["calamari-canyon", "battlewoods", "lifty-lodge"],
    tips: [
      "Grab a vehicle here for fast rotations",
      "Edge of map — less traffic but long rotates",
      "Good for learning the game without constant fights"
    ]
  },
  {
    id: "battlewoods",
    name: "The Battlewoods",
    type: "named",
    biome: "primal",
    gridPosition: { x: 41.4, y: 39.1 },
    lootTier: "B",
    contestLevel: "medium",
    chestCount: 24,
    description: "Dense forest town replacing Battlewood Boulevard. Close-quarters fights between trees.",
    rotateTowards: ["frosted-flats", "calamari-canyon", "latte-landing", "lifty-lodge"],
    tips: [
      "Trees provide natural cover but limit sightlines",
      "Land on rooftops for height advantage",
      "Quick loot then rotate — not great for camping"
    ]
  },
  {
    id: "calamari-canyon",
    name: "Calamari Canyon",
    type: "named",
    biome: "desert",
    gridPosition: { x: 29.2, y: 50.3 },
    lootTier: "A",
    contestLevel: "medium",
    chestCount: 34,
    description: "Desert canyon west of the Zero Point. Elevation layers provide multiple angles for squads.",
    rotateTowards: ["sinister-strip", "heatwave-harbor", "chopped-shop"],
    tips: [
      "Excellent for squads — elevation gives angles",
      "Desert = open sightlines, bring AR",
      "Canyon walls provide natural cover for rotations"
    ]
  },
  {
    id: "frosted-flats",
    name: "Frosted Flats",
    type: "named",
    biome: "snow",
    gridPosition: { x: 57.7, y: 49.3 },
    lootTier: "B",
    contestLevel: "medium",
    chestCount: 22,
    description: "Icy flats just northeast of the Zero Point with FrosDeez store. Great central position.",
    rotateTowards: ["zero-point", "golden-grove", "latte-landing", "shaken-sanctuary"],
    tips: [
      "Right next to Zero Point — good for fast rotations",
      "FrosDeez store has guaranteed chest spawns",
      "Watch for third parties from Zero Point"
    ]
  },
  {
    id: "golden-grove",
    name: "Golden Grove",
    type: "named",
    biome: "primal",
    gridPosition: { x: 71.6, y: 54.2 },
    lootTier: "A",
    contestLevel: "medium",
    chestCount: 26,
    description: "Lush grove on the eastern side of the island. Good position with solid loot.",
    rotateTowards: ["shaken-sanctuary", "frosted-flats", "wonkeeland", "cluster-coast"],
    tips: [
      "Balanced position — not too edge, not center",
      "Mix of biomes nearby for varied fights",
      "Good stone from the grove structures"
    ]
  },
  {
    id: "sinister-strip",
    name: "Sinister Strip",
    type: "named",
    biome: "primal",
    gridPosition: { x: 44.1, y: 60.7 },
    lootTier: "A",
    contestLevel: "high",
    chestCount: 32,
    description: "Dark Voyager's propaganda piece in the green heartland. Great loot but high traffic.",
    rotateTowards: ["sunken-shores", "shaken-sanctuary", "calamari-canyon", "zero-point"],
    tips: [
      "Hot drop — expect fights immediately",
      "Buildings spread across the area, loot is decentralized",
      "Control the center building for best positioning"
    ]
  },
  {
    id: "heatwave-harbor",
    name: "Heatwave Harbor",
    type: "named",
    biome: "tropical",
    gridPosition: { x: 26.4, y: 66.0 },
    lootTier: "S",
    contestLevel: "medium",
    chestCount: 36,
    description: "Industrial port on the southwest coast. Excellent for squads. Water tower rally point.",
    rotateTowards: ["sunken-shores", "sinister-strip", "calamari-canyon"],
    tips: [
      "EXCELLENT for squads — enough loot for full team",
      "High ground near the port is a natural rally point",
      "Multiple buildings = split your team to loot faster",
      "Coastal position — plan rotations early"
    ]
  },
  {
    id: "shaken-sanctuary",
    name: "Shaken Sanctuary",
    type: "named",
    biome: "tropical",
    gridPosition: { x: 61.9, y: 65.3 },
    lootTier: "A",
    contestLevel: "medium",
    chestCount: 28,
    description: "Aftermath of the Visitor's betrayal in the green southeast. Solid loot and elevation.",
    rotateTowards: ["cluster-coast", "sunken-shores", "sinister-strip", "golden-grove"],
    tips: [
      "Multiple elevation levels — play height",
      "Good wood and stone from structures",
      "Central-south position gives flexible rotations"
    ]
  },
  {
    id: "sunken-shores",
    name: "Sunken Shores",
    type: "named",
    biome: "tropical",
    gridPosition: { x: 45.4, y: 74.8 },
    lootTier: "B",
    contestLevel: "low",
    chestCount: 20,
    description: "Flooded shoreline at the southern tip of the island. Safe but requires early rotation.",
    rotateTowards: ["heatwave-harbor", "sinister-strip", "shaken-sanctuary", "cluster-coast"],
    tips: [
      "Very safe drop but FAR from center",
      "MUST rotate early or storm will catch you",
      "Good for placement games in ranked"
    ]
  },
  {
    id: "cluster-coast",
    name: "Cluster Coast",
    type: "named",
    biome: "tropical",
    gridPosition: { x: 67.1, y: 76.2 },
    lootTier: "B",
    contestLevel: "low",
    chestCount: 18,
    description: "Runners Battle Pass themed POI on the southeast coast. Lower contest, decent loot.",
    rotateTowards: ["shaken-sanctuary", "sunken-shores", "golden-grove"],
    tips: [
      "Good for safe drops in ranked",
      "Coastal position — watch your storm rotations",
      "Cluster decorations provide some cover"
    ]
  },
  {
    id: "zero-point",
    name: "The Zero Point",
    type: "named",
    biome: "mixed",
    gridPosition: { x: 47.0, y: 49.9 },
    lootTier: "S",
    contestLevel: "high",
    chestCount: 30,
    description: "Dead center of the island with the exposed Zero Point glowing in the middle.",
    rotateTowards: ["frosted-flats", "sinister-strip", "calamari-canyon", "golden-grove", "battlewoods"],
    tips: [
      "Most central drop on the map — every zone reachable",
      "Zero Point area offers rifts for emergency escapes",
      "Expect constant action and third parties",
      "Risky for ranked — great for practice"
    ]
  },
];

// ── CHAPTER 7 SEASON 3 META WEAPONS ──
export const weapons: Weapon[] = [
  // S-TIER
  {
    name: "Striker Pump Shotgun",
    image: "/images/weapons/striker-pump.webp",
    type: "shotgun",
    tier: "S",
    description: "The undisputed king. Only true one-shot shotgun — 201 headshot damage at Legendary. Fast pullout time.",
    bestFor: "Box fights, peek shots, any close-range engagement"
  },
  {
    name: "Surgical Burst Rifle",
    image: "/images/weapons/surgical-burst.webp",
    type: "ar",
    tier: "S",
    description: "Incredible long-range damage with almost zero bloom and manageable recoil. Best AR in the game.",
    bestFor: "Mid to long range tags, beaming, zone pressure"
  },
  {
    name: "Flex SMG",
    image: "/images/weapons/flex-smg.webp",
    type: "smg",
    tier: "S",
    description: "Hybrid weapon — hip fire for spread, ADS for tight mid-range laser. Very versatile.",
    bestFor: "Close to mid range, Zero Build, finishing fights"
  },
  // A-TIER
  {
    name: "Chaos Reloader Shotgun",
    image: "/images/weapons/chaos-reloader.webp",
    type: "shotgun",
    tier: "A",
    description: "Hip fire = Gatekeeper spread, ADS = mid-range laser. 3-round mag forces reloads. Farm Skeletor for Mythic.",
    bestFor: "Zero Build, versatile ranges, when you can't find Striker Pump"
  },
  {
    name: "Hunting Rifle",
    image: "/images/weapons/hunting-rifle.webp",
    type: "sniper",
    tier: "A",
    description: "Classic sniper with clean scope. High skill ceiling but devastating in the right hands.",
    bestFor: "Long range picks, opening fights, rotation pressure"
  },
  {
    name: "Overdrive Grenades",
    image: "/images/weapons/overdrive-grenades.webp",
    type: "utility",
    tier: "A",
    description: "Mobility grenades that keep you moving. Essential for rotations and escapes.",
    bestFor: "Rotations, escaping fights, repositioning"
  },
  // B-TIER
  {
    name: "Extending Focus Shotgun",
    image: "/images/weapons/focus-shotgun.webp",
    type: "shotgun",
    tier: "B",
    description: "Solid shotgun option when Striker isn't available. Reliable but not meta-defining.",
    bestFor: "Backup shotgun, early game before you find better"
  },
  {
    name: "Maven Auto Shotgun",
    image: "/images/weapons/maven-auto.webp",
    type: "shotgun",
    tier: "B",
    description: "Auto shotgun for spray playstyle. Good for controller players who want consistent damage.",
    bestFor: "Spray and pray, controller players, panic situations"
  },
  {
    name: "Stinger SMG",
    image: "/images/weapons/stinger-smg.webp",
    type: "smg",
    tier: "B",
    description: "Reliable SMG that's been in the game forever. You know what you're getting.",
    bestFor: "Close range spray, breaking builds, consistent DPS"
  },
  {
    name: "Rift-to-Go",
    image: "/images/weapons/rift-to-go.webp",
    type: "utility",
    tier: "B",
    description: "Emergency escape or rotation tool. Always valuable to have one.",
    bestFor: "Emergency escapes, fast rotations, getting out of storm"
  },
  // C-TIER
  {
    name: "Chaos Exploder Rifle",
    image: "/images/weapons/chaos-exploder.webp",
    type: "ar",
    tier: "C",
    description: "Fell off hard after nerfs. Used to be meta, now just decent. Pick up if nothing else.",
    bestFor: "When you can't find Surgical Burst, splash damage"
  },
  {
    name: "Ranger Pistol",
    image: "/images/weapons/ranger-pistol.webp",
    type: "pistol",
    tier: "C",
    description: "Niche pistol with some utility. Not worth a slot in most loadouts.",
    bestFor: "Early game, trick shots, when desperate"
  },
  {
    name: "Seven Sliders",
    image: "/images/weapons/seven-sliders.webp",
    type: "utility",
    tier: "C",
    description: "Movement utility but Overdrive Grenades are better. Situational use.",
    bestFor: "Mobility when you can't find Overdrive"
  },
  {
    name: "Shield Breaker EMP",
    image: "/images/weapons/shield-breaker.webp",
    type: "utility",
    tier: "C",
    description: "Anti-shield utility. Niche but can be powerful in specific situations.",
    bestFor: "Breaking shields before pushing, endgame plays"
  },
  // D-TIER (AVOID)
  {
    name: "Lancehead Pistol",
    image: "/images/weapons/lancehead-pistol.webp",
    type: "pistol",
    tier: "D",
    description: "Including Mythic Baba Yaga variant — not worth your time. Leave it on the floor.",
    bestFor: "Nothing. Don't pick this up."
  },
  {
    name: "Business Turret",
    image: "/images/weapons/business-turret.webp",
    type: "utility",
    tier: "D",
    description: "Gimmick item. Sitting in a turret gets you killed. Avoid entirely.",
    bestFor: "Memes only. Not competitive."
  },
];

// ── RECOMMENDED LOADOUT ──
export const metaLoadout = {
  slot1: "Striker Pump Shotgun",
  slot2: "Surgical Burst Rifle", 
  slot3: "Flex SMG (or Overdrive Grenades)",
  slot4: "Heals (Med Kit / Shield Potions)",
  slot5: "Utility (Rift-to-Go / Extra Heals)",
  note: "This loadout covers all ranges. Pump for close, SMG for spray, Burst for beaming. Adjust slot 3-5 based on what you find."
};

// ── ROLE-BASED LOADOUTS PER TEAM MODE ──
export type SlotType = "shotgun" | "ar" | "smg" | "sniper" | "pistol" | "utility" | "explosive" | "heals";

export interface LoadoutSlotItem {
  item: string;
  image: string; // render from /images/weapons/
  type: SlotType;
  noComp?: boolean; // not in competitive playlists
  compAlternative?: LoadoutSlotItem; // what comp players use instead
}

export interface RoleLoadout {
  role: string;
  tagline: string;
  accent: string; // tailwind text color class
  badge: string; // tailwind bg/border classes
  slots: LoadoutSlotItem[];
  tips: string[];
}

export interface ModeLoadoutSet {
  id: "solo" | "duo" | "trio" | "squad";
  label: string;
  roles: RoleLoadout[];
}

const W = (item: string, img: string, type: SlotType): LoadoutSlotItem => ({
  item,
  image: `/images/weapons/${img}.webp`,
  type,
});

export const modeLoadouts: ModeLoadoutSet[] = [
  {
    id: "solo",
    label: "Solo",
    roles: [
      {
        role: "All-Rounder",
        tagline: "Nobody's coming to save you — cover every range yourself.",
        accent: "text-yellow-400",
        badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        slots: [
          W("Striker Pump Shotgun", "striker-pump", "shotgun"),
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Flex SMG", "flex-smg", "smg"),
          W("Med Kit", "medkit", "heals"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
        ],
        tips: [
          "Full range coverage is mandatory in solos",
          "Carry mobility — there's no teammate to reboot you",
          "Swap Flex SMG for Shield Breaker EMP in stacked lobbies",
        ],
      },
    ],
  },
  {
    id: "duo",
    label: "Duo",
    roles: [
      {
        role: "IGL",
        tagline: "Shot-caller. You've decided rotates, tracks surge, carries the team load.",
        accent: "text-purple-400",
        badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        slots: [
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Chaos Reloader Shotgun", "chaos-reloader", "shotgun"),
          W("Shield Breaker EMP", "shield-breaker", "utility"),
          W("Med Kit", "medkit", "heals"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
        ],
        tips: [
          "Your fragger's life is worth more than your 50 damage",
          "Call rotates 15 seconds BEFORE zone moves",
          "Carry the extra heals — you're the walking reboot van",
        ],
      },
      {
        role: "Fragger",
        tagline: "First one in. Your job is the opening pick that starts every fight.",
        accent: "text-red-400",
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
        slots: [
          W("Striker Pump Shotgun", "striker-pump", "shotgun"),
          W("Flex SMG", "flex-smg", "smg"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
          W("Mini Shields", "shield-potion", "heals"),
          {
            item: "Rift-to-Go",
            image: "/images/weapons/rift-to-go.webp",
            type: "utility",
            noComp: true,
            compAlternative: {
              item: "Shield Potions",
              image: "/images/weapons/shield-potion.webp",
              type: "heals",
            },
          },
        ],
        tips: [
          "Never take a 50/50 without your IGL in trade range",
          "One pump threat wins you space — hold it, don't waste it",
          "Your job ends at the knock. Let the IGL finish the fight",
        ],
      },
    ],
  },
  {
    id: "trio",
    label: "Trio",
    roles: [
      {
        role: "IGL",
        tagline: "Decides everything. Keeps the trio unified through every rotate.",
        accent: "text-purple-400",
        badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        slots: [
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Chaos Reloader Shotgun", "chaos-reloader", "shotgun"),
          W("Shield Breaker EMP", "shield-breaker", "utility"),
          W("Med Kit", "medkit", "heals"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
        ],
        tips: [
          "One voice. One call. Even a wrong call beats no call",
          "Track both fraggers' HP constantly — call the resets",
          "EMP before every push. Cracked shields = free entry",
        ],
      },
      {
        role: "Entry Fragger",
        tagline: "The tip of the spear. First damage, first through the door.",
        accent: "text-red-400",
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
        slots: [
          W("Striker Pump Shotgun", "striker-pump", "shotgun"),
          W("Flex SMG", "flex-smg", "smg"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
          W("Mini Shields", "shield-potion", "heals"),
          {
            item: "Rift-to-Go",
            image: "/images/weapons/rift-to-go.webp",
            type: "utility",
            noComp: true,
            compAlternative: {
              item: "Shield Potions",
              image: "/images/weapons/shield-potion.webp",
              type: "heals",
            },
          },
        ],
        tips: [
          "Call before you dive — a surprise entry kills the trio",
          "Trade damage, don't trade your life",
          "Overdrive grenades = your get-out-of-jail card",
        ],
      },
      {
        role: "Rifler",
        tagline: "The beam. Holds angles, suppresses, finishes what the entry starts.",
        accent: "text-cyan-400",
        badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
        slots: [
          W("Hunting Rifle", "hunting-rifle", "sniper"),
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Stinger SMG", "stinger-smg", "smg"),
          W("Striker Pump Shotgun", "striker-pump", "shotgun"),
          W("Shield Potions", "shield-potion", "heals"),
        ],
        tips: [
          "One angle per fight. A missed flick loses everything — reset instead",
          "Your beam forces enemies to heal, which wins the entry his fight",
          "Hold the pump for when the fight comes TO you",
        ],
      },
    ],
  },
  {
    id: "squad",
    label: "Squad",
    roles: [
      {
        role: "IGL",
        tagline: "The brain. Surge tracking, drop calls, reset timing — you own it all.",
        accent: "text-purple-400",
        badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        slots: [
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Chaos Reloader Shotgun", "chaos-reloader", "shotgun"),
          W("Shield Breaker EMP", "shield-breaker", "utility"),
          W("Med Kit", "medkit", "heals"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
        ],
        tips: [
          "Four players moving as one beats four players fighting alone",
          "In stacked lobbies, surge tags are YOUR job — stay alive to do it",
          "Never let the squad take two fights at once",
        ],
      },
      {
        role: "Entry Fragger",
        tagline: "Breaks the box open. Turns 'we're fighting' into 'we're winning.'",
        accent: "text-red-400",
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
        slots: [
          W("Striker Pump Shotgun", "striker-pump", "shotgun"),
          W("Flex SMG", "flex-smg", "smg"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
          W("Mini Shields", "shield-potion", "heals"),
          {
            item: "Rift-to-Go",
            image: "/images/weapons/rift-to-go.webp",
            type: "utility",
            noComp: true,
            compAlternative: {
              item: "Shield Potions",
              image: "/images/weapons/shield-potion.webp",
              type: "heals",
            },
          },
        ],
        tips: [
          "Wait for the EMP call. Cracked shields = your green light",
          "Piece control > raw aim in 4v4 box chaos",
          "Die on their wall, not in the open — make trades possible",
        ],
      },
      {
        role: "Second Fragger",
        tagline: "The cleanup crew. Everything the entry starts, you finish.",
        accent: "text-orange-400",
        badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        slots: [
          W("Maven Auto Shotgun", "maven-auto", "shotgun"),
          W("Stinger SMG", "stinger-smg", "smg"),
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Mini Shields", "shield-potion", "heals"),
          W("Overdrive Grenades", "overdrive-grenades", "utility"),
        ],
        tips: [
          "Maven = forgiving follow-up damage in messy cleanup fights",
          "Stay one box behind the entry — close enough to trade, far enough to live",
          "Spray the played piece from entry: walls fall, fights end",
        ],
      },
      {
        role: "Support",
        tagline: "The insurance policy. Heals, ammo, restarts — the squad survives because of you.",
        accent: "text-green-400",
        badge: "bg-green-500/15 text-green-400 border-green-500/30",
        slots: [
          W("Surgical Burst Rifle", "surgical-burst", "ar"),
          W("Stinger SMG", "stinger-smg", "smg"),
          W("Med Kit", "medkit", "heals"),
          W("Shield Potions", "shield-potion", "heals"),
          {
            item: "Rift-to-Go",
            image: "/images/weapons/rift-to-go.webp",
            type: "utility",
            noComp: true,
            compAlternative: {
              item: "Shield Potions",
              image: "/images/weapons/shield-potion.webp",
              type: "heals",
            },
          },
        ],
        tips: [
          "Two heal slots minimum — you're the squad's 401(k)",
          "Rift-to-Go is the team reset button. Protect it with your life",
          "Play the backline for picks and reboot cards, never the front",
        ],
      },
    ],
  },
];



// ── ZERO BUILD LOADOUTS (separate per mode) ──
// In Zero Build, Overdrive Grenades are not a great option. Movement items
// like Seven Sliders + Stinger SMG + Maven Auto are the meta.

const ZB = (item: string, img: string, type: SlotType): LoadoutSlotItem => ({
  item,
  image: `/images/weapons/${img}.webp`,
  type,
});

export interface ZBLoadout {
  mode: "solo" | "duo" | "trio" | "squad";
  modeLabel: string;
  role: string;
  tagline: string;
  accent: string;
  badge: string;
  variant: "build" | "zero-build";
  variantLabel: string;
  slots: LoadoutSlotItem[];
  comp: LoadoutSlotItem[]; // alternative weapons in competitive where banned
  compBanned: string[]; // notes on what's banned
  tips: string[];
}

const ZB_BANNED: Record<string, string> = {
  "Overdrive Grenades": "Banned in comp — pick a different mobility item",
  "Flex SMG": "Often banned in comp — use Stinger SMG as backup",
  "Shield Breaker EMP": "Mostly banned in comp — replace with Med Kit or shield",
  "Rift-to-Go": "Banned in comp — pick Med Kit instead",
};

function makeZBLoadouts(): ZBLoadout[] {
  const set: ZBLoadout[] = [];
  
  // ── SOLO ──
  set.push({
    mode: "solo",
    modeLabel: "Solo",
    role: "All-Rounder (ZB)",
    tagline: "Pure fighting IQ — no building to fall back on. Position + aim wins.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Hunting Rifle", "hunting-rifle", "sniper"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned in comp)", "Flex SMG (often banned)"],
    tips: [
      "ZBs are won on positioning and surprise damage — never fair fights",
      "Track enemy audio — sound is 80% of zero build",
      "Maven Auto is the meta shotgun — much better than Striker in ZB",
      "Use Seven Sliders or Overdrive for mobility, not Overdrive in comp",
      "90% of ZB kills are 1-2 second windows of damage — pre-aim like a pro",
    ],
  });

  // ── DUO ──
  set.push({
    mode: "duo",
    modeLabel: "Duo",
    role: "IGL (ZB)",
    tagline: "Call rotates and peek for your fragger. Audio intel is half the battle.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Flex SMG", "flex-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned in comp)"],
    tips: [
      "IGL keeps the rotation, fragger peeks. Never both push at once.",
      "Audio cues: track footsteps and chest opens — info is damage in ZB",
      "If you get first shot, push immediately — 1-tap finishes are common",
      "Maven Auto is the king of ZB fights — fits both roles perfectly",
    ],
  });
  set.push({
    mode: "duo",
    modeLabel: "Duo",
    role: "Fragger (ZB)",
    tagline: "Pure damage output. You're the closer. Take picks, end fights fast.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Hunting Rifle", "hunting-rifle", "sniper"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Med Kit", "medkit", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned in comp)"],
    tips: [
      "Fragger = first one in. Audio + 1-tap = kills.",
      "Pre-aim every corner like you've already seen the enemy there.",
      "Maven Auto + Stinger SMG = the two weapons you must master for ZB.",
      "Use Seven Sliders to flank — never go through a chokepoint straight.",
    ],
  });

  // ── TRIO ──
  set.push({
    mode: "trio",
    modeLabel: "Trio",
    role: "IGL (ZB)",
    tagline: "Call rotations, hold the audio lead, position for your fraggers.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Hunting Rifle", "hunting-rifle", "sniper"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "Trio ZB = 3 players, no walls. Crossfire setups are the meta.",
      "IGL: you don't peek first. You call who peeks and from where.",
      "Maven Auto gives 2-3 free shots on a wall before enemy recovers.",
      "Use audio ping system with your duo fraggers.",
    ],
  });
  set.push({
    mode: "trio",
    modeLabel: "Trio",
    role: "Fragger (ZB)",
    tagline: "You take the fight. The IGL and Support set you up — you finish.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Hunting Rifle", "hunting-rifle", "sniper"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Med Kit", "medkit", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "Fragger in ZB: you're the loudest member. The IGL/Support are quiet flanks.",
      "Hunting Rifle + Maven Auto is the meta pick — 1-shot sniper + SMG spam.",
      "Never peek first when alone. Wait for at least one crossfire angle.",
      "Maven Auto is non-negotiable in ZB. If you don't have it, swap roles.",
    ],
  });
  set.push({
    mode: "trio",
    modeLabel: "Trio",
    role: "Support (ZB)",
    tagline: "You are the reboot / heals. The IGL and Fragger do damage. You make it stick.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "You are 2-heal slots minimum. That's the Support tax — accept it.",
      "Never trade in ZB. Trade = death. Stay alive = the fight is winnable.",
      "Slide + jump + Stinger SMG = the 3 things that make Supports dangerous.",
      "Use your 2 mobility charges to stay near your IGL. Stay grouped.",
    ],
  });

  // ── SQUAD ──
  set.push({
    mode: "squad",
    modeLabel: "Squad",
    role: "IGL (ZB)",
    tagline: "4-man squad ZB. You call rotates. No walls — your squad IS the wall.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "Squad ZB: 2-2 split. 2 pushing, 2 holding crossfire.",
      "Your team IS your wall. Never go alone, even for a 1-tap.",
      "Crossfire positions beat positioning in ZB. Set them up.",
      "Maven Auto + Healing is the meta. Healing wins the war of attrition.",
    ],
  });
  set.push({
    mode: "squad",
    modeLabel: "Squad",
    role: "Fragger #1 (ZB)",
    tagline: "You + Fragger #2 = the duo inside the duo. 2-tap every fight.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Med Kit", "medkit", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "Fragger #1 + Fragger #2 = 2-tap engine. Stagger your shots by 0.3s.",
      "You and your fragger partner swap angles. Never peek the same direction.",
      "Maven Auto + Stinger = your only weapons in ZB. Master both.",
    ],
  });
  set.push({
    mode: "squad",
    modeLabel: "Squad",
    role: "Fragger #2 (ZB)",
    tagline: "The pivot fragger. The IGL + Fragger #1 set the trap; you close the box.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Hunting Rifle", "hunting-rifle", "sniper"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
      ZB("Hunting Rifle", "hunting-rifle", "sniper"),
      ZB("Mini Shields", "shield-potion", "heals"),
      ZB("Med Kit", "medkit", "heals"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "Hunting Rifle is YOUR weapon in ZB. 1-shot snipes win fights.",
      "Wait for the trap to close. Don't peek until the IGL calls it.",
      "Maven Auto for close range, Hunting for picks. Swap between rounds.",
    ],
  });
  set.push({
    mode: "squad",
    modeLabel: "Squad",
    role: "Support (ZB)",
    tagline: "Heals + reboot + 2 mobility. You make the squad unkillable.",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    variant: "zero-build",
    variantLabel: "Zero Build",
    slots: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
      ZB("Seven Sliders", "seven-sliders", "utility"),
    ],
    comp: [
      ZB("Maven Auto Shotgun", "maven-auto", "shotgun"),
      ZB("Surgical Burst Rifle", "surgical-burst", "ar"),
      ZB("Med Kit", "medkit", "heals"),
      ZB("Shield Potions", "shield-potion", "heals"),
      ZB("Stinger SMG", "stinger-smg", "smg"),
    ],
    compBanned: ["Overdrive Grenades (banned)"],
    tips: [
      "2 heal slots + 1 mobility is the Support tax. Embrace it.",
      "Stinger SMG as side option for taking 1v1s. You don't need to hide forever.",
      "Stagger behind your squad by 5m. You see what they don't.",
    ],
  });

  return set;
}

export const zeroBuildLoadouts: ZBLoadout[] = makeZBLoadouts();

// ── WARMUP ROUTINES ──
export interface WarmupStep {
  id: string;
  name: string;
  duration: number; // minutes
  description: string;
  mapCode?: string;
  focus: string;
}

export interface WarmupRoutine {
  id: string;
  name: string;
  totalDuration: number;
  type: "quick" | "standard" | "tournament";
  description: string;
  steps: WarmupStep[];
}

export const defaultWarmupRoutines: WarmupRoutine[] = [
  {
    id: "quick-10",
    name: "Quick Warm-Up",
    totalDuration: 10,
    type: "quick",
    description: "Fast warm-up when you're short on time. Hits the essentials.",
    steps: [
      {
        id: "q1",
        name: "Free Build",
        duration: 3,
        description: "90s, retakes, free building to warm up your fingers",
        focus: "Building muscle memory"
      },
      {
        id: "q2",
        name: "Edit Course",
        duration: 3,
        description: "Mongraal Classic or similar edit course",
        mapCode: "7562-1598-0199",
        focus: "Edit speed and accuracy"
      },
      {
        id: "q3",
        name: "Aim Trainer",
        duration: 4,
        description: "Skaavok Aim Trainer — tracking and flicks",
        mapCode: "8022-6842-4965",
        focus: "Crosshair placement and reaction time"
      },
    ]
  },
  {
    id: "standard-20",
    name: "Standard Warm-Up",
    totalDuration: 20,
    type: "standard",
    description: "Balanced warm-up covering all fundamentals before ranked.",
    steps: [
      {
        id: "s1",
        name: "Free Build",
        duration: 4,
        description: "Build freely — 90s, tunnels, retakes. Get your fingers moving.",
        focus: "Building fluidity"
      },
      {
        id: "s2",
        name: "Edit Course",
        duration: 4,
        description: "Raider's Edit Course or BFC course. Try to beat your time.",
        mapCode: "7562-1598-0199",
        focus: "Edit muscle memory"
      },
      {
        id: "s3",
        name: "Aim Training",
        duration: 5,
        description: "Skaavok — do Tile Frenzy, Tracking, and Flick Shot modes",
        mapCode: "8022-6842-4965",
        focus: "All aim types"
      },
      {
        id: "s4",
        name: "Box Fight Practice",
        duration: 4,
        description: "1v1 Box Fights against real players or bots",
        mapCode: "7620-0771-9529",
        focus: "Fight mechanics"
      },
      {
        id: "s5",
        name: "Piece Control Drills",
        duration: 3,
        description: "Piece control practice — taking walls, placing cones",
        mapCode: "5765-2565-4462",
        focus: "Piece control"
      },
    ]
  },
  {
    id: "tournament-30",
    name: "Tournament Prep",
    totalDuration: 30,
    type: "tournament",
    description: "Full warm-up before tournaments or important sessions.",
    steps: [
      {
        id: "t1",
        name: "Free Build",
        duration: 5,
        description: "Extensive free building — every retake you know, tunneling, tarping",
        focus: "Full building warm-up"
      },
      {
        id: "t2",
        name: "Edit Courses",
        duration: 5,
        description: "Multiple edit courses — Raider's, Mongraal, and speed courses",
        mapCode: "7562-1598-0199",
        focus: "Peak edit performance"
      },
      {
        id: "t3",
        name: "Comprehensive Aim",
        duration: 6,
        description: "Full Skaavok routine — all modes, shotgun flicks, AR tracking",
        mapCode: "8022-6842-4965",
        focus: "Complete aim warm-up"
      },
      {
        id: "t4",
        name: "Box Fights",
        duration: 5,
        description: "1v1 Box Fights — focus on clean plays, not just winning",
        mapCode: "7620-0771-9529",
        focus: "Fight confidence"
      },
      {
        id: "t5",
        name: "Zone Wars",
        duration: 5,
        description: "Moving zone practice to warm up endgame",
        mapCode: "6562-8953-6567",
        focus: "Endgame mechanics"
      },
      {
        id: "t6",
        name: "Piece Control",
        duration: 4,
        description: "Advanced piece control scenarios",
        mapCode: "5765-2565-4462",
        focus: "Fight IQ and control"
      },
    ]
  },
];

// ── ROUTE RECOMMENDATIONS BY PLAYSTYLE ──
export interface DropRoute {
  name: string;
  poi: string;
  playstyle: "safe" | "balanced" | "aggressive";
  mode: "solos" | "duos" | "trios" | "squads" | "all";
  rotationPath: string[]; // display names
  pathIds: string[]; // poi ids used to draw the path ("zone" = map center endpoint)
  description: string;
}

export const recommendedRoutes: DropRoute[] = [
  {
    name: "Safe Ranked Grind",
    poi: "Sunken Shores",
    playstyle: "safe",
    mode: "solos",
    rotationPath: ["Sunken Shores", "Cluster Coast", "Shaken Sanctuary", "Zone"],
    pathIds: ["sunken-shores", "cluster-coast", "shaken-sanctuary", "zone"],
    description: "South coast chain — low contest, solid loot. Rotate up through the green heartland. Best for placement points."
  },
  {
    name: "Balanced Solo Drop",
    poi: "Latte Landing",
    playstyle: "balanced",
    mode: "solos",
    rotationPath: ["Latte Landing", "Frosted Flats", "Zero Point", "Zone"],
    pathIds: ["latte-landing", "frosted-flats", "zero-point", "zone"],
    description: "Northern drop with a clean path into the center. Medium contest, flexible rotations every direction."
  },
  {
    name: "W-Key Practice",
    poi: "The Zero Point",
    playstyle: "aggressive",
    mode: "solos",
    rotationPath: ["Zero Point", "Nearest Fight", "More Fights", "Win or Die"],
    pathIds: ["zero-point", "sinister-strip", "shaken-sanctuary", "zone"],
    description: "Dead center, highest action on the island. Drop here to practice fighting, not for ranked gains."
  },
  {
    name: "Safe Duo Drop",
    poi: "Chopped Shop",
    playstyle: "safe",
    mode: "duos",
    rotationPath: ["Chopped Shop", "Calamari Canyon", "Sinister Strip", "Zone"],
    pathIds: ["chopped-shop", "calamari-canyon", "sinister-strip", "zone"],
    description: "West coast chain — grab vehicles at Chopped Shop, loot the canyon, rotate into the heartland."
  },
  {
    name: "Squad Domination",
    poi: "Heatwave Harbor",
    playstyle: "balanced",
    mode: "squads",
    rotationPath: ["Heatwave Harbor", "Sinister Strip", "Shaken Sanctuary", "Zone"],
    pathIds: ["heatwave-harbor", "sinister-strip", "shaken-sanctuary", "zone"],
    description: "Perfect squad drop — huge port with loot for a full team, then push through the green heartland together."
  },
  {
    name: "Squad W-Key",
    poi: "Calamari Canyon",
    playstyle: "aggressive",
    mode: "squads",
    rotationPath: ["Calamari Canyon", "The Zero Point", "Hunt Players", "Zone"],
    pathIds: ["calamari-canyon", "zero-point", "frosted-flats", "golden-grove", "zone"],
    description: "Elevation advantage for squad fights in the canyon, then push the Zero Point for constant action."
  },
];
