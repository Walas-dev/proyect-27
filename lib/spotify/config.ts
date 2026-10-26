// src/lib/spotify/config.ts
import "server-only";

export const SPOTIFY_SCOPES = "playlist-modify-public playlist-modify-private";

export const isSpotifyConfigured = () =>
  !!(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET &&
    process.env.SPOTIFY_REDIRECT_URI
  );

export function spotifyEnv() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Faltan SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET o SPOTIFY_REDIRECT_URI");
  }
  return { clientId, clientSecret, redirectUri };
}

export const basicAuth = (id: string, secret: string) =>
  `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;