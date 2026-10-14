"use client";

// ── Custom game-style SVG icons ──
// Weapon silhouettes + map layer markers (chest, ammo, vehicle, vending)

type IconProps = { className?: string };

// ═══════════ WEAPON SILHOUETTES (viewBox 64x24) ═══════════

export const ShotgunIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="14" y="8" width="46" height="3.6" rx="1" />
    <rect x="7" y="7.2" width="8" height="7.6" rx="1.4" />
    <path d="M7 7.4 2 8.6 1 16.4 7 17.4Z" />
    <rect x="20" y="11" width="10" height="4.6" rx="2" />
    <rect x="33" y="11.4" width="4" height="5" rx="1" />
  </svg>
);

export const AssaultRifleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="15" y="8.4" width="45" height="3.4" rx="1" />
    <rect x="8" y="7.2" width="8.5" height="9" rx="1.4" />
    <path d="M8 8 2 9.2 2.8 16.5 8 16.6Z" />
    <rect x="18" y="11.6" width="4" height="6.5" rx="1.1" />
    <rect x="27" y="11.6" width="9" height="9.5" rx="1.6" />
    <rect x="40" y="4.6" width="7" height="3.8" rx="1.6" />
  </svg>
);

export const SmgIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="18" y="8.6" width="30" height="5.4" rx="1.2" />
    <rect x="48" y="10" width="14" height="2.6" rx="1.2" />
    <path d="M6 7h12v10H8l-2-2z" />
    <rect x="22" y="14" width="4.4" height="6.6" rx="1.1" />
    <rect x="32" y="14" width="6" height="9" rx="1.4" />
  </svg>
);

export const SniperIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="14" y="9" width="50" height="3" rx="1" />
    <rect x="7" y="7.6" width="8" height="8" rx="1.4" />
    <path d="M7 8 1.6 9 1 16.6 7 17.2Z" />
    <rect x="19" y="12" width="4" height="6" rx="1" />
    <rect x="28" y="12" width="7.6" height="7.6" rx="1.4" />
    <rect x="24" y="4" width="16" height="5" rx="2.4" />
  </svg>
);

export const PistolIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="16" y="8" width="30" height="5.6" rx="1.6" />
    <path d="M18 13.6h9l-1.8 9.4h-6.2l-1-6z" />
    <rect x="29" y="13.8" width="9" height="2.4" rx="1.2" />
  </svg>
);

export const GrenadeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="24" y="4.6" width="9" height="3.4" rx="1.6" />
    <rect x="29.6" y="7" width="4.8" height="3" />
    <ellipse cx="32" cy="15.5" rx="7.5" ry="7.8" />
  </svg>
);

export const MedkitIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="16" y="6" width="32" height="16" rx="3" opacity="0.45" />
    <path d="M30 9h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
  </svg>
);

export const ExplosiveIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 24" fill="currentColor" className={className}>
    <rect x="10" y="9" width="36" height="6" rx="1.5" />
    <path d="M46 9l6 3-6 3z" />
    <rect x="14" y="15" width="4" height="6" rx="1" />
    <rect x="26" y="15" width="4" height="6" rx="1" />
    <rect x="2" y="10.5" width="8" height="3" rx="1" />
  </svg>
);

// ═══════════ MAP LAYER MARKERS (viewBox 24x24) ═══════════

export const ChestIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 10.2C3 6.8 7 4.6 12 4.6s9 2.2 9 5.6H3z" />
    <rect x="3" y="10.2" width="18" height="9.4" rx="1.6" />
    <rect
      x="10.6"
      y="9.2"
      width="2.8"
      height="4.4"
      rx="1"
      fill="#854d0e"
    />
  </svg>
);

export const AmmoBoxIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="2.6" y="8.6" width="18.8" height="10.4" rx="1.4" />
    <rect x="2.6" y="8.6" width="18.8" height="2.6" rx="1.1" fill="#14532d" />
    <rect x="7" y="12.6" width="2" height="4.4" rx="1" fill="#052e16" />
    <rect x="11" y="12.6" width="2" height="4.4" rx="1" fill="#052e16" />
    <rect x="15" y="12.6" width="2" height="4.4" rx="1" fill="#052e16" />
  </svg>
);

export const VehicleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.4 15.4c0-1.3.9-2.4 2.1-2.6l1.2-3.3c.4-1.3 1.5-1.9 2.8-1.9h5c1.3 0 2.4.6 2.8 1.9l1.2 3.3c1.3.2 2.2 1.3 2.2 2.6v1.6c0 .6-.4 1-1 1h-1.4a2.6 2.6 0 0 1-5.2 0h-2.2a2.6 2.6 0 0 1-5.2 0H4.4c-.6 0-1-.4-1-1v-1.6z" />
    <circle cx="8.3" cy="18" r="1.7" fill="#0c1929" />
    <circle cx="15.9" cy="18" r="1.7" fill="#0c1929" />
  </svg>
);

export const VendingIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="5.5" y="2.5" width="13" height="19" rx="2" />
    <rect x="8" y="5" width="5.4" height="8" rx="1" fill="#701a75" />
    <rect x="14.6" y="5.2" width="1.6" height="1.6" rx="0.8" fill="#701a75" />
    <rect x="14.6" y="7.8" width="1.6" height="1.6" rx="0.8" fill="#701a75" />
    <rect x="8.5" y="15.8" width="7" height="2.6" rx="1" fill="#701a75" />
  </svg>
);

// ═══════════ WEAPON TYPE → ICON MAP ═══════════

import { useState } from "react";
import type { Weapon } from "@/lib/fortnite-data";

export function WeaponTypeIcon({
  type,
  className,
}: {
  type: Weapon["type"] | "heals";
  className?: string;
}) {
  switch (type) {
    case "shotgun":
      return <ShotgunIcon className={className} />;
    case "ar":
      return <AssaultRifleIcon className={className} />;
    case "smg":
      return <SmgIcon className={className} />;
    case "sniper":
      return <SniperIcon className={className} />;
    case "pistol":
      return <PistolIcon className={className} />;
    case "utility":
      return <GrenadeIcon className={className} />;
    case "explosive":
      return <ExplosiveIcon className={className} />;
    case "heals":
      return <MedkitIcon className={className} />;
    default:
      return <AssaultRifleIcon className={className} />;
  }
}

// ── Real weapon render with graceful fallback to silhouette ──
export function WeaponImage({
  weapon,
  className,
  iconClassName,
}: {
  weapon: Weapon;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!weapon.image || failed) {
    return <WeaponTypeIcon type={weapon.type} className={iconClassName} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={weapon.image}
      alt={weapon.name}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.55))" }}
    />
  );
}
