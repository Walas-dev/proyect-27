// src/app/actions/songs.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLinkByToken } from "@/lib/celebration";
import { lookupTrack, searchTracks } from "@/lib/itunes";
import type { SongResult } from "@/lib/types";

const MAX_PER_LINK = 5;

const clean = (v: unknown, max: number) =>
  String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

type SearchResult =
  | { ok: true; results: SongResult[] }
  | { ok: false; error: string };

export async function searchSongs(token: string, term: string): Promise<SearchResult> {
  const q = clean(term, 80);
  if (q.length < 2) return { ok: true, results: [] };

  const link = await getLinkByToken(String(token ?? ""));
  if (!link) return { ok: false, error: "Este enlace ya no está activo." };

  try {
    return { ok: true, results: await searchTracks(q) };
  } catch {
    return { ok: false, error: "No pudimos buscar ahora. Inténtalo de nuevo." };
  }
}

type RequestResult = { ok: true; approved: boolean } | { ok: false; error: string };

export async function requestSong(input: {
  token: string;
  trackId: string;
}): Promise<RequestResult> {
  const trackId = String(input.trackId ?? "");
  if (!/^\d{1,15}$/.test(trackId)) return { ok: false, error: "Canción no válida." };

  const link = await getLinkByToken(String(input.token ?? ""));
  if (!link) return { ok: false, error: "Este enlace ya no está activo." };

  const db = supabaseAdmin();

  if (!link.auto_approve) {
    const { count } = await db
      .from("songs")
      .select("id", { count: "exact", head: true })
      .eq("contribution_link_id", link.id);
    if ((count ?? 0) >= MAX_PER_LINK)
      return { ok: false, error: "Ya alcanzaste el máximo de canciones. ¡Gracias!" };
  }

  // Se vuelve a consultar a iTunes: no confiamos en los datos que manda el navegador
  const t = await lookupTrack(trackId).catch(() => null);
  if (!t) return { ok: false, error: "No encontramos esa canción." };

  const approved = link.auto_approve === true;
  const { error } = await db.from("songs").insert({
    celebration_id: link.celebration_id,
    contribution_link_id: link.id,
    author_name: link.assigned_name,
    status: approved ? "approved" : "pending",
    provider: "itunes",
    provider_id: t.id,
    title: t.title,
    artist: t.artist,
    cover_url: t.cover,
    preview_url: t.previewUrl,
    duration_ms: t.durationMs,
    album: t.album,
  });

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Esa canción ya fue pedida 💜" };
    return { ok: false, error: "No pudimos guardar tu solicitud." };
  }

  await db
    .from("contribution_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", link.id);

  if (approved) revalidatePath("/[slug]", "page");
  return { ok: true, approved };
}