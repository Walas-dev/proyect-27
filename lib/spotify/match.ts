// src/lib/spotify/match.ts
import "server-only";
import { searchTracks, type SpotifyTrack } from "./api";

export type SongInput = { title: string; artist: string; durationMs: number | null };
export type Scored = { track: SpotifyTrack; score: number };

// Con título y artista iguales y la duración desconocida, el puntaje es 0.9
export const AUTO_THRESHOLD = 0.85;

// Quita tildes, paréntesis ("feat."), sufijos tipo " - Remastered 2011" y signos
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/\s+-\s+.*$/, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function titleScore(a: string, b: string) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  return x.includes(y) || y.includes(x) ? 0.7 : 0;
}

function artistScore(wanted: string, found: string[]) {
  const w = normalize(wanted);
  if (!w) return 0;
  return found.some((f) => {
    const n = normalize(f);
    return !!n && (n === w || n.includes(w) || w.includes(n));
  })
    ? 1
    : 0;
}

function durationScore(wanted: number | null, found: number) {
  if (!wanted) return 0.5;
  const diff = Math.abs(wanted - found);
  return diff <= 3000 ? 1 : diff <= 10000 ? 0.5 : 0;
}

export function scoreCandidates(song: SongInput, tracks: SpotifyTrack[]): Scored[] {
  return tracks
    .map((track) => ({
      track,
      score:
        0.5 * titleScore(song.title, track.name) +
        0.3 * artistScore(song.artist, track.artists) +
        0.2 * durationScore(song.durationMs, track.durationMs),
    }))
    .sort((a, b) => b.score - a.score);
}

const clean = (s: string) => s.replace(/"/g, " ");

export async function findCandidates(token: string, song: SongInput): Promise<Scored[]> {
  let tracks = await searchTracks(token, `track:${clean(song.title)} artist:${clean(song.artist)}`);
  if (tracks.length === 0) {
    tracks = await searchTracks(token, `${clean(song.title)} ${clean(song.artist)}`);
  }
  return scoreCandidates(song, tracks);
}