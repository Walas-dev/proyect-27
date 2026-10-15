// src/lib/celebration.ts
import "server-only";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Celebration, Letter, Memory, Song } from "@/lib/types";


const hashToken = (t: string) =>
  createHash("sha256").update(t).digest("hex");

export async function getCelebrationBySlug(slug: string) {
  const { data } = await supabaseAdmin()
    .from("celebrations")
    .select("id, recipient_name, celebration_date")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Celebration | null) ?? null;
}

export async function getCelebrationById(id: string) {
  const { data } = await supabaseAdmin()
    .from("celebrations")
    .select("id, recipient_name, celebration_date")
    .eq("id", id)
    .maybeSingle();
  return (data as Celebration | null) ?? null;
}

// Devuelve el enlace solo si existe, no está revocado ni expirado
export async function getLinkByToken(token: string) {
  if (!/^[A-Za-z0-9]{20,128}$/.test(token)) return null;

  const { data } = await supabaseAdmin()
    .from("contribution_links")
    .select("id, celebration_id, assigned_name, auto_approve, expires_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!data || data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at) <= new Date()) return null;
  return data;
}

export async function getApprovedMemories(celebrationId: string): Promise<Memory[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("memories")
    .select("id, image_path, width, height, caption, author_name")
    .eq("celebration_id", celebrationId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    src: db.storage.from("memories").getPublicUrl(m.image_path).data.publicUrl,
    width: m.width ?? 1200, // por si cargas una fila a mano sin medidas
    height: m.height ?? 1500,
    caption: m.caption ?? "",
    author: m.author_name,
  }));
}

export async function getApprovedLetters(celebrationId: string): Promise<Letter[]> {
  const { data, error } = await supabaseAdmin()
    .from("letters")
    .select("id, title, message, author_name, color, icon")
    .eq("celebration_id", celebrationId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((l) => ({
    id: l.id,
    title: l.title,
    message: l.message,
    author: l.author_name,
    color: l.color,
    icon: l.icon,
  }));
}

export async function getApprovedSongs(celebrationId: string): Promise<Song[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("songs")
    .select("id, title, artist, cover_url, preview_url, audio_path, author_name")
    .eq("celebration_id", celebrationId)
    .eq("status", "approved")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    cover: s.cover_url,
    previewUrl: s.preview_url,
    audioUrl: s.audio_path
      ? db.storage.from("songs").getPublicUrl(s.audio_path).data.publicUrl
      : null,
    author: s.author_name,
  }));
}