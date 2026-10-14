import { NextRequest, NextResponse } from "next/server";
import { fetchLiveMeta, applyLiveMeta, type LiveMetaState } from "@/lib/live-meta";

export const dynamic = "force-dynamic";

let lastFetch: { time: number; data: LiveMetaState } | null = null;

export async function GET(req: NextRequest) {
  try {
    // Manual cache busting via ?fresh=1
    const fresh = req.nextUrl.searchParams.get("fresh") === "1";
    if (fresh) lastFetch = null;

    if (lastFetch && Date.now() - lastFetch.time < 30 * 60 * 1000) {
      return NextResponse.json(lastFetch.data);
    }

    const state = await fetchLiveMeta();
    lastFetch = { time: Date.now(), data: state };
    return NextResponse.json(state);
  } catch (err) {
    console.error("live-meta error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch live meta",
        lastUpdated: new Date().toISOString(),
        patchNotes: [],
        weaponUpdates: [],
        currentTierOverrides: {},
        activeSeason: "Chapter 7 Season 3 (Runners)",
      },
      { status: 500 }
    );
  }
}
