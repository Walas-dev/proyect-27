// src/lib/itunes.ts
import "server-only";
import type { SongResult } from "@/lib/types";

// Tienda de iTunes que se consulta. Si tu catálogo es otro, cambia el código de país (MX, CO, AR…)
const COUNTRY = "US";

type ItunesTrack = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  kind?: string;
  trackTimeMillis?: number;
  collectionName?: string;
};

const toResult = (t: ItunesTrack): SongResult => ({
  id: String(t.trackId),
  title: t.trackName ?? "",
  artist: t.artistName ?? "",
  cover: t.artworkUrl100 ? t.artworkUrl100.replace("100x100", "300x300") : null,
  previewUrl: t.previewUrl ?? null,
  durationMs: t.trackTimeMillis ?? null,
  album: t.collectionName ?? null,
});

export async function searchTracks(term: string): Promise<SongResult[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "8");
  url.searchParams.set("country", COUNTRY);

  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error("itunes search failed");

  const data = await res.json();
  return ((data.results ?? []) as ItunesTrack[])
    .filter((t) => t.trackId && t.trackName && t.artistName)
    .map(toResult);
}

export async function lookupTrack(id: string): Promise<SongResult | null> {
  const url = new URL("https://itunes.apple.com/lookup");
  url.searchParams.set("id", id);
  url.searchParams.set("country", COUNTRY);

  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;

  const data = await res.json();
  const t = ((data.results ?? []) as ItunesTrack[]).find((r) => r.kind === "song");
  return t && t.trackId && t.trackName && t.artistName ? toResult(t) : null;
}