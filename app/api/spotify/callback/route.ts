// src/app/api/spotify/callback/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminCelebration } from "@/lib/admin/queries/celebration";
import { exchangeCode, saveConnection } from "@/lib/spotify/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = (query: string) =>
    NextResponse.redirect(new URL(`/admin/canciones/spotify?${query}`, request.url));

  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const jar = await cookies();
  const expected = jar.get("spotify_oauth_state")?.value;
  jar.delete({ name: "spotify_oauth_state", path: "/api/spotify" });

  if (url.searchParams.get("error")) return back("error=denied");

  const code = url.searchParams.get("code");
  if (!code || !expected || url.searchParams.get("state") !== expected) {
    return back("error=state");
  }

  const celebration = await getAdminCelebration();
  if (!celebration) return back("error=celebration");

  try {
    const tokens = await exchangeCode(code);
    if (!tokens.refresh_token) return back("error=token");
    await saveConnection(celebration.id, tokens.refresh_token);
  } catch {
    return back("error=token");
  }

  return back("connected=1");
}