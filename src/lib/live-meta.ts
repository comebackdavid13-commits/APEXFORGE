// LIVE META SYNC
import { weapons as staticWeapons } from "./fortnite-data";

export interface PatchNote {
  id: string;
  title: string;
  body: string;
  date: string;
  image?: string;
  hash: string;
}

export interface WeaponMetaUpdate {
  weaponName: string;
  status: "buffed" | "nerfed" | "vaulted" | "added" | "unchanged";
  reason: string;
  patchDate: string;
}

export interface LiveMetaState {
  lastUpdated: string;
  hash: string;
  patchNotes: PatchNote[];
  weaponUpdates: WeaponMetaUpdate[];
  currentTierOverrides: Record<string, "S" | "A" | "B" | "C" | "D">;
  activeSeason: string;
  isFreshlyChanged: boolean;
}

const CACHE_TTL = 5 * 60 * 1000;
let cache: { data: LiveMetaState; timestamp: number; lastHash: string } | null = null;

const WEAPON_NAME_TO_ID: Record<string, string> = {
  "striker pump shotgun": "striker-pump",
  "striker pump": "striker-pump",
  "surgical burst rifle": "surgical-burst",
  "surgical burst": "surgical-burst",
  "flex smg": "flex-smg",
  "chaos reloader shotgun": "chaos-reloader",
  "chaos reloader": "chaos-reloader",
  "chaos exploder rifle": "chaos-exploder",
  "chaos exploder": "chaos-exploder",
  "hunting rifle": "hunting-rifle",
  "overdrive grenades": "overdrive-grenades",
  "overdrive grenade": "overdrive-grenades",
  "overdriver grenades": "overdrive-grenades",
  "extending focus shotgun": "focus-shotgun",
  "maven auto shotgun": "maven-auto",
  "stinger smg": "stinger-smg",
  "rift-to-go": "rift-to-go",
  "rift to go": "rift-to-go",
  "ranger pistol": "ranger-pistol",
  "seven sliders": "seven-sliders",
  "shield breaker emp": "shield-breaker",
  "shield breaker": "shield-breaker",
  "lancehead pistol": "lancehead-pistol",
  "business turret": "business-turret",
};

const ID_TO_BASE_TIER: Record<string, "S" | "A" | "B" | "C" | "D"> = {};
for (const w of staticWeapons as any[]) ID_TO_BASE_TIER[w.id] = w.tier;

const NERF_PATTERNS: RegExp[] = [
  /\b(nerf|nerfed|nerfs)\b/i,
  /\b(reduces?|reduced|reduction in)\s+(damage|rate|reload|magazine|range|effectiveness|dps)/i,
  /\b(decreases?|decreased|decrease in)\s+(damage|rate|reload|magazine|range|effectiveness)/i,
  /\b(shipped hot and now being adjusted|now deal(s)? less|less damage|slightly reduced)/i,
  /\b(vaulted from the loot pool|no longer available|removed from (competitive|champion league))/i,
  /\b(disabled|temporarily disabled|hotfix)\b/i,
];

const BUFF_PATTERNS: RegExp[] = [
  /\b(buff|buffed|buffs)\b/i,
  /\b(increases?|increased|increase in)\s+(damage|rate|reload|magazine|range|effectiveness|dps)/i,
  /\b(returns? to the loot pool|unvaulted|added back|now deal(s)? more)/i,
  /\b(nerf reverted|reverted to previous|fixed|addressed)/i,
];

function detectWeaponUpdates(
  notes: PatchNote[]
): { updates: WeaponMetaUpdate[]; overrides: Record<string, "S" | "A" | "B" | "C" | "D"> } {
  const updates: WeaponMetaUpdate[] = [];
  const overrides: Record<string, "S" | "A" | "B" | "C" | "D"> = {};
  const recent = notes.slice(0, 5);

  for (const note of recent) {
    const text = `${note.title} ${note.body}`.toLowerCase();

    for (const [name, id] of Object.entries(WEAPON_NAME_TO_ID)) {
      if (!text.includes(name)) continue;

      const isNerf = NERF_PATTERNS.some((p) => p.test(text));
      const isBuff = BUFF_PATTERNS.some((p) => p.test(text));

      let status: WeaponMetaUpdate["status"] = "unchanged";
      if (isNerf && !isBuff) status = "nerfed";
      else if (isBuff && !isNerf) status = "buffed";
      else if (isNerf && isBuff) status = "buffed";

      if (status === "unchanged") continue;

      const prev = overrides[id] || ID_TO_BASE_TIER[id];
      let nextTier: "S" | "A" | "B" | "C" | "D" = prev;
      if (status === "nerfed") {
        if (prev === "S") nextTier = "A";
        else if (prev === "A") nextTier = "B";
        else if (prev === "B") nextTier = "C";
        else if (prev === "C") nextTier = "D";
      } else if (status === "buffed") {
        if (prev === "D") nextTier = "C";
        else if (prev === "C") nextTier = "B";
        else if (prev === "B") nextTier = "A";
        else if (prev === "A") nextTier = "S";
      }

      overrides[id] = nextTier;
      const patchDate = note.date || new Date().toISOString();
      if (
        updates.some(
          (u) => u.weaponName === name && u.status === status && u.patchDate === patchDate
        )
      ) continue;
      updates.push({
        weaponName: name,
        status,
        reason: extractReason(text, name),
        patchDate,
      });
    }
  }

  return { updates, overrides };
}

function extractReason(text: string, weaponName: string): string {
  const sentences = text.split(/[.!?]/);
  for (const s of sentences) {
    if (s.toLowerCase().includes(weaponName)) {
      return s.trim().slice(0, 220);
    }
  }
  return "Mentioned in recent patch";
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "ApexForge/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchLiveMeta(force = false): Promise<LiveMetaState> {
  if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  let patchNotes: PatchNote[] = [];
  let newsHash = "unknown";
  try {
    const data = await fetchWithTimeout(
      "https://fortnite-api.com/v2/news?lang=en"
    );
    if (data?.data?.br) {
      const br = data.data.br;
      newsHash = br.hash || "unknown";
      if (Array.isArray(br.motds)) {
        patchNotes = br.motds.map((m: any) => ({
          id: m.id,
          title: m.title || m.tabTitle || "",
          body: m.body || "",
          date: br.date || new Date().toISOString(),
          image: m.image || m.tileImage || br.image,
          hash: br.hash,
        }));
      }
    }
  } catch {
    // ignore
  }

  if (patchNotes.length === 0) {
    patchNotes = [
      {
        id: "default-runners",
        title: "Fortnite: Runners Is Here!",
        body: "Extract. Survive. Repeat! Choose a Sprite before each match for a Sprite Power. Striker Pump remains S-tier shotgun, Surgical Burst is the best AR. Avoid Lancehead and Business Turret.",
        date: new Date().toISOString(),
        image: undefined,
        hash: "fallback",
      },
    ];
  }

  const { updates, overrides } = detectWeaponUpdates(patchNotes);

  let activeSeason = "Chapter 7 Season 3 (Runners)";
  try {
    const data = await fetchWithTimeout(
      "https://fortnite-api.com/v1/playlists?lang=en"
    );
    if (data?.data?.season?.displayName) {
      activeSeason = `${data.data.season.displayName}`;
    }
  } catch {
    // keep default
  }

  const isFreshlyChanged = !!(cache && cache.lastHash !== newsHash && newsHash !== "unknown");

  const state: LiveMetaState = {
    lastUpdated: new Date().toISOString(),
    hash: newsHash,
    patchNotes,
    weaponUpdates: updates,
    currentTierOverrides: overrides,
    activeSeason,
    isFreshlyChanged,
  };

  cache = { data: state, timestamp: Date.now(), lastHash: newsHash };
  return state;
}

export interface LiveWeapon {
  id: string;
  name: string;
  type: string;
  tier: "S" | "A" | "B" | "C" | "D";
  baseTier: "S" | "A" | "B" | "C" | "D";
  status: "buffed" | "nerfed" | "vaulted" | "unchanged";
  description: string;
  bestFor: string;
  image: string;
}

export function applyLiveMeta(
  baseWeapons: any[] = staticWeapons as any[],
  overrides: Record<string, "S" | "A" | "B" | "C" | "D"> = {}
): LiveWeapon[] {
  return baseWeapons.map((w) => {
    const liveTier = overrides[w.id] || w.tier;
    return {
      id: w.id,
      name: w.name,
      type: w.type,
      tier: liveTier,
      baseTier: w.tier,
      status:
        liveTier > w.tier
          ? "buffed"
          : liveTier < w.tier
          ? "nerfed"
          : "unchanged",
      description: w.description,
      bestFor: w.bestFor,
      image: w.image || "",
    };
  });
}
