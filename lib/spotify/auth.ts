// src/lib/spotify/auth.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "@/lib/admin/crypto";
import { basicAuth, spotifyEnv } from "./config";

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const { clientId, clientSecret } = spotifyEnv();
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: basicAuth(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Spotify token ${res.status}`);
  return res.json();
}

export const exchangeCode = (code: string) =>
  tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: spotifyEnv().redirectUri,
  });

export async function saveConnection(celebrationId: string, refreshToken: string) {
  await supabaseAdmin()
    .from("spotify_connections")
    .upsert(
      {
        celebration_id: celebrationId,
        refresh_token_enc: encryptToken(refreshToken),
        connected_at: new Date().toISOString(),
      },
      { onConflict: "celebration_id" }
    );
}

// Devuelve un token de acceso nuevo, o null si aún no hay cuenta conectada
export async function getAccessToken(celebrationId: string): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from("spotify_connections")
    .select("refresh_token_enc")
    .eq("celebration_id", celebrationId)
    .maybeSingle();

  const refreshToken = data?.refresh_token_enc ? decryptToken(data.refresh_token_enc) : null;
  if (!refreshToken) return null;

  const tokens = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
  // Spotify puede rotar el refresh token: si manda uno nuevo, se guarda
  if (tokens.refresh_token && tokens.refresh_token !== refreshToken) {
    await saveConnection(celebrationId, tokens.refresh_token);
  }
  return tokens.access_token;
}