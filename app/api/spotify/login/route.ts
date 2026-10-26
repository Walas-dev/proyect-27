// src/app/api/spotify/login/route.ts
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { SPOTIFY_SCOPES, spotifyEnv } from "@/lib/spotify/config";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { clientId, redirectUri } = spotifyEnv();
  const state = randomBytes(16).toString("hex");

  (await cookies()).set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/spotify",
    maxAge: 600,
  });

  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
    show_dialog: "true",
  }).toString();

  return NextResponse.redirect(url);
}