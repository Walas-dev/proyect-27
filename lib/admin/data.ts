// src/lib/admin-data.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type AdminCelebration = {
  id: string;
  slug: string | null;
  recipient_name: string | null;
  celebration_date: string | null;
};

export async function getAdminCelebration() {
  const { data } = await supabaseAdmin()
    .from("celebrations")
    .select("id, slug, recipient_name, celebration_date")
    .limit(1)
    .maybeSingle();
  return (data as AdminCelebration | null) ?? null;
}

const rank = (s: string) => (s === "pending" ? 0 : s === "approved" ? 1 : 2);
const byStatus = <T extends { status: string; created_at: string }>(a: T, b: T) =>
  rank(a.status) - rank(b.status) || b.created_at.localeCompare(a.created_at);

export type AdminMemory = {
  id: string;
  url: string;
  caption: string | null;
  author_name: string | null;
  status: string;
  created_at: string;
};

export async function listMemories(celebrationId: string): Promise<AdminMemory[]> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("memories")
    .select("id, image_path, caption, author_name, status, created_at")
    .eq("celebration_id", celebrationId);
  return (data ?? [])
    .map((m) => ({
      id: m.id,
      url: db.storage.from("memories").getPublicUrl(m.image_path).data.publicUrl,
      caption: m.caption,
      author_name: m.author_name,
      status: m.status,
      created_at: m.created_at,
    }))
    .sort(byStatus);
}

export type AdminLetter = {
  id: string;
  title: string | null;
  message: string;
  author_name: string | null;
  color: string;
  icon: string;
  status: string;
  created_at: string;
};

export async function listLetters(celebrationId: string): Promise<AdminLetter[]> {
  const { data } = await supabaseAdmin()
    .from("letters")
    .select("id, title, message, author_name, color, icon, status, created_at")
    .eq("celebration_id", celebrationId);
  return ((data ?? []) as AdminLetter[]).sort(byStatus);
}

export type AdminSong = {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  preview_url: string | null;
  audio_path: string | null;
  provider: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

export async function listSongs(celebrationId: string): Promise<AdminSong[]> {
  const { data } = await supabaseAdmin()
    .from("songs")
    .select(
      "id, title, artist, cover_url, preview_url, audio_path, provider, author_name, status, created_at"
    )
    .eq("celebration_id", celebrationId);
  return ((data ?? []) as AdminSong[]).sort(byStatus);
}

export type AdminLink = {
  id: string;
  label: string | null;
  assigned_name: string | null;
  auto_approve: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  state: "activo" | "revocado" | "expirado";
};

export async function listLinks(celebrationId: string): Promise<AdminLink[]> {
  const { data } = await supabaseAdmin()
    .from("contribution_links")
    .select("id, label, assigned_name, auto_approve, expires_at, revoked_at, last_used_at, created_at")
    .eq("celebration_id", celebrationId)
    .order("created_at", { ascending: false });

  const now = Date.now();
  return (data ?? []).map((l) => ({
    id: l.id,
    label: l.label,
    assigned_name: l.assigned_name,
    auto_approve: l.auto_approve === true,
    last_used_at: l.last_used_at,
    expires_at: l.expires_at,
    state: l.revoked_at
      ? "revocado"
      : l.expires_at && new Date(l.expires_at).getTime() <= now
        ? "expirado"
        : "activo",
  }));
}