// ══════════════════════════════════════════════════════════════════════════════
// WEAPON STATS — Chapter 7 Season 3 "Runners"
// DPS / TTK / damage-per-shot values used by the weapon calculator.
// Values are realistic approximations for the current season.
// ══════════════════════════════════════════════════════════════════════════════

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
export type AmmoType = "Light" | "Medium" | "Heavy" | "Shells" | "Rockets";

export interface WeaponStat {
  id: string;
  name: string;
  type: string;
  ammo: AmmoType;
  image?: string;
  headshotMultiplier: number;
  stats: Record<Rarity, { damage: number; fireRate: number; reload: number; mag: number }>;
  description: string;
}

export const rarities: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];

// Helper to build stats with scaling per rarity
function scale(baseDamage: number, baseFireRate: number, reload: number, mag: number): Record<Rarity, { damage: number; fireRate: number; reload: number; mag: number }> {
  const dmgMultipliers = [0.85, 0.90, 0.95, 1.0, 1.05, 1.10];
  return Object.fromEntries(
    rarities.map((r, i) => [
      r,
      {
        damage: Math.round(baseDamage * dmgMultipliers[i]),
        fireRate: baseFireRate,
        reload,
        mag,
      },
    ])
  ) as Record<Rarity, { damage: number; fireRate: number; reload: number; mag: number }>;
}

export const weaponStats: WeaponStat[] = [
  {
    id: "striker-pump",
    name: "Striker Pump Shotgun",
    type: "Shotgun",
    ammo: "Shells",
    image: "/images/weapons/striker-pump.webp",
    headshotMultiplier: 1.75,
    stats: scale(84, 0.75, 4.6, 5),
    description: "The king of close range. Slow fire rate, but can one-shot with a clean headshot.",
  },
  {
    id: "chaos-reloader",
    name: "Chaos Reloader Shotgun",
    type: "Shotgun",
    ammo: "Shells",
    image: "/images/weapons/chaos-reloader.webp",
    headshotMultiplier: 1.75,
    stats: scale(72, 1.0, 4.2, 3),
    description: "Hybrid shotgun — hip-fire spread or ADS laser. Small mag, constant reloads.",
  },
  {
    id: "focus-shotgun",
    name: "Extending Focus Shotgun",
    type: "Shotgun",
    ammo: "Shells",
    image: "/images/weapons/focus-shotgun.webp",
    headshotMultiplier: 1.75,
    stats: scale(76, 0.9, 4.4, 6),
    description: "Reliable backup shotgun when the Striker isn't available.",
  },
  {
    id: "maven-auto",
    name: "Maven Auto Shotgun",
    type: "Shotgun",
    ammo: "Shells",
    image: "/images/weapons/maven-auto.webp",
    headshotMultiplier: 1.5,
    stats: scale(68, 1.7, 4.0, 8),
    description: "Spray-and-pray auto shotgun. Great for controller players and cleanup.",
  },
  {
    id: "surgical-burst",
    name: "Surgical Burst Rifle",
    type: "Assault Rifle",
    ammo: "Medium",
    image: "/images/weapons/surgical-burst.webp",
    headshotMultiplier: 1.5,
    stats: scale(32, 3.8, 2.8, 24),
    description: "Zero bloom, clean recoil. Best AR for beaming at mid to long range.",
  },
  {
    id: "chaos-exploder",
    name: "Chaos Exploder Rifle",
    type: "Assault Rifle",
    ammo: "Medium",
    image: "/images/weapons/chaos-exploder.webp",
    headshotMultiplier: 1.5,
    stats: scale(35, 3.5, 3.0, 20),
    description: "Fell off after nerfs. Splash damage is niche now.",
  },
  {
    id: "flex-smg",
    name: "Flex SMG",
    type: "SMG",
    ammo: "Light",
    image: "/images/weapons/flex-smg.webp",
    headshotMultiplier: 1.75,
    stats: scale(18, 10.0, 2.4, 35),
    description: "Versatile SMG. Hip-fire for close spray, ADS for mid-range laser.",
  },
  {
    id: "stinger-smg",
    name: "Stinger SMG",
    type: "SMG",
    ammo: "Light",
    image: "/images/weapons/stinger-smg.webp",
    headshotMultiplier: 1.75,
    stats: scale(17, 11.0, 2.2, 30),
    description: "Classic fast-firing SMG. Reliable close-range spray.",
  },
  {
    id: "hunting-rifle",
    name: "Hunting Rifle",
    type: "Sniper",
    ammo: "Heavy",
    image: "/images/weapons/hunting-rifle.webp",
    headshotMultiplier: 2.5,
    stats: scale(88, 0.85, 3.0, 1),
    description: "Bolt-action sniper. High skill ceiling, devastating headshots.",
  },
  {
    id: "ranger-pistol",
    name: "Ranger Pistol",
    type: "Pistol",
    ammo: "Light",
    image: "/images/weapons/ranger-pistol.webp",
    headshotMultiplier: 2.0,
    stats: scale(28, 4.5, 1.8, 16),
    description: "Niche pistol. Not worth a slot in most loadouts.",
  },
  {
    id: "lancehead-pistol",
    name: "Lancehead Pistol",
    type: "Pistol",
    ammo: "Light",
    image: "/images/weapons/lancehead-pistol.webp",
    headshotMultiplier: 2.0,
    stats: scale(26, 4.0, 1.9, 12),
    description: "Avoid. There is almost always a better option.",
  },
];

export function calculateDPS(weapon: WeaponStat, rarity: Rarity): number {
  const s = weapon.stats[rarity];
  return Math.round(s.damage * s.fireRate);
}

export function calculateTTK(dps: number, hp: number): number {
  if (dps <= 0) return Infinity;
  // Time to deal HP damage (ignore overkill for simple TTK)
  return Math.ceil(hp / (dps / Math.max(1, dps === 0 ? 1 : dps))) / (dps / Math.max(1, dps === 0 ? 1 : dps));
}

export function calculateShotsToKill(weapon: WeaponStat, rarity: Rarity, hp: number, headshotChance = 0): number {
  const s = weapon.stats[rarity];
  let shots = 0;
  let remaining = hp;
  while (remaining > 0 && shots < 200) {
    shots++;
    const isHeadshot = Math.random() < headshotChance; // deterministic not needed here
    const dmg = isHeadshot ? s.damage * weapon.headshotMultiplier : s.damage;
    remaining -= dmg;
  }
  return shots;
}

export function formattedTTK(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  return `${seconds.toFixed(2)}s`;
}

export function shotsToKillTable(weapon: WeaponStat, rarity: Rarity): { hp: number; body: number; head: number }[] {
  const s = weapon.stats[rarity];
  return [100, 150, 200, 250].map((hp) => ({
    hp,
    body: Math.ceil(hp / s.damage),
    head: Math.ceil(hp / (s.damage * weapon.headshotMultiplier)),
  }));
}
