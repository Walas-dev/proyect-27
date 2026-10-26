// src/lib/spotify/api.ts
import "server-only";

const BASE = "https://api.spotify.com/v1";

export class SpotifyError extends Error {
  status: number;
  constructor(status: number) {
    super(`Spotify respondió ${status}`);
    this.status = status;
  }
}

async function api<T>(
  token: string,
  path: string,
  init: { method?: string; body?: string } = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new SpotifyError(res.status);
  return (res.status === 204 ? null : await res.json()) as T;
}

export type SpotifyTrack = {
  id: string;
  name: string;
  durationMs: number;
  artists: string[];
  cover: string | null;
  url: string;
};

type RawTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album?: { images?: { url: string }[] };
  external_urls?: { spotify?: string };
};

const toTrack = (t: RawTrack): SpotifyTrack => ({
  id: t.id,
  name: t.name,
  durationMs: t.duration_ms,
  artists: t.artists.map((a) => a.name),
  cover: t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? null,
  url: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
});

export async function searchTracks(token: string, query: string): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({ q: query, type: "track", limit: "10" });
  const data = await api<{ tracks?: { items: (RawTrack | null)[] } }>(token, `/search?${params}`);
  return (data.tracks?.items ?? []).filter((t): t is RawTrack => !!t).map(toTrack);
}

export async function createPlaylist(token: string, name: string, description: string) {
  const p = await api<{ id: string; external_urls?: { spotify?: string } }>(token, "/me/playlists", {
    method: "POST",
    body: JSON.stringify({ name, description, public: true }),
  });
  return { id: p.id, url: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}` };
}

// Spotify admite hasta 100 canciones por petición
export async function addItems(token: string, playlistId: string, uris: string[]) {
  for (let i = 0; i < uris.length; i += 100) {
    await api(token, `/playlists/${playlistId}/items`, {
      method: "POST",
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
  }
}