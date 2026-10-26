// src/lib/admin/queries/spotify.ts
import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getAccessToken } from "@/lib/spotify/auth";
import { findCandidates, type Scored } from "@/lib/spotify/match";

export type SpotifyConnection = {
  playlistId: string | null;
  playlistUrl: string | null;
  connectedAt: string;
};

export const getSpotifyConnection = cache(
  async (celebrationId: string): Promise<SpotifyConnection | null> => {
    const { data } = await supabaseAdmin()
      .from("spotify_connections")
      .select("playlist_id, playlist_url, connected_at")
      .eq("celebration_id", celebrationId)
      .maybeSingle();
    return data
      ? { playlistId: data.playlist_id, playlistUrl: data.playlist_url, connectedAt: data.connected_at }
      : null;
  }
);

export type SyncSong = {
  id: string;
  title: string;
  artist: string;
  durationMs: number | null;
  spotifyId: string | null;
  status: string | null;
  addedAt: string | null;
};

export const getSyncSongs = cache(async (celebrationId: string): Promise<SyncSong[]> => {
  const { data } = await supabaseAdmin()
    .from("songs")
    .select("id, title, artist, duration_ms, spotify_id, spotify_status, spotify_added_at")
    .eq("celebration_id", celebrationId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  return (data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    durationMs: s.duration_ms,
    spotifyId: s.spotify_id,
    status: s.spotify_status,
    addedAt: s.spotify_added_at,
  }));
});

export type SyncCounts = { toMatch: number; review: number; toAdd: number; added: number; skipped: number };

export function countSync(songs: SyncSong[]): SyncCounts {
  const counts: SyncCounts = { toMatch: 0, review: 0, toAdd: 0, added: 0, skipped: 0 };
  for (const s of songs) {
    if (s.status === "skipped") counts.skipped++;
    else if (s.addedAt) counts.added++;
    else if (s.spotifyId) counts.toAdd++;
    else if (s.status === "review") counts.review++;
    else counts.toMatch++;
  }
  return counts;
}

// Candidatas (las 3 mejores) para las canciones que esperan tu decisión
export async function getReviewCandidates(celebrationId: string, songs: SyncSong[]) {
  const result = new Map<string, Scored[]>();
  if (songs.length === 0) return result;

  try {
    const token = await getAccessToken(celebrationId);
    if (!token) return result;

    const entries = await Promise.all(
      songs.map(async (s) => {
        const found = await findCandidates(token, {
          title: s.title,
          artist: s.artist,
          durationMs: s.durationMs,
        });
        return [s.id, found.slice(0, 3)] as const;
      })
    );
    for (const [id, found] of entries) result.set(id, found);
  } catch {
    /* sin candidatas: la página ofrece omitir la canción */
  }
  return result;
}