// src/lib/admin/queries/links.ts
import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";

export type LinkState = "activo" | "revocado" | "expirado";

export type LinkActivity = {
  memories: number;
  memoriesPending: number;
  letters: number;
  lettersPending: number;
  songs: number;
  songsPending: number;
};

export type AdminLink = {
  id: string;
  label: string | null;
  assignedName: string | null;
  autoApprove: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  state: LinkState;
  hasToken: boolean; // false en los enlaces creados antes del cifrado
  activity: LinkActivity;
};

export type LinkOption = { id: string; name: string };
export type LinkStats = { active: number; unused: number; revoked: number; expired: number };

const EMPTY_ACTIVITY: LinkActivity = {
  memories: 0,
  memoriesPending: 0,
  letters: 0,
  lettersPending: 0,
  songs: 0,
  songsPending: 0,
};

function resolveState(revokedAt: string | null, expiresAt: string | null): LinkState {
  if (revokedAt) return "revocado";
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return "expirado";
  return "activo";
}

// Lista completa con actividad: 2 consultas en paralelo
export const getLinks = cache(async (celebrationId: string): Promise<AdminLink[]> => {
  const db = supabaseAdmin();
  const [links, activity] = await Promise.all([
    db
      .from("contribution_links")
      .select(
        "id, label, assigned_name, auto_approve, expires_at, revoked_at, last_used_at, created_at, token_enc"
      )
      .eq("celebration_id", celebrationId)
      .order("created_at", { ascending: false }),
    db
      .from("admin_link_activity")
      .select("link_id, memories, memories_pending, letters, letters_pending, songs, songs_pending")
      .eq("celebration_id", celebrationId),
  ]);

  const byLink = new Map<string, LinkActivity>();
  for (const a of activity.data ?? []) {
    byLink.set(a.link_id, {
      memories: Number(a.memories),
      memoriesPending: Number(a.memories_pending),
      letters: Number(a.letters),
      lettersPending: Number(a.letters_pending),
      songs: Number(a.songs),
      songsPending: Number(a.songs_pending),
    });
  }

  return (links.data ?? []).map((l) => ({
    id: l.id,
    label: l.label,
    assignedName: l.assigned_name,
    autoApprove: l.auto_approve === true,
    createdAt: l.created_at,
    lastUsedAt: l.last_used_at,
    expiresAt: l.expires_at,
    state: resolveState(l.revoked_at, l.expires_at),
    hasToken: !!l.token_enc,
    activity: byLink.get(l.id) ?? EMPTY_ACTIVITY,
  }));
});

// Para el desplegable de filtro: 1 consulta ligera
export const getLinkOptions = cache(async (celebrationId: string): Promise<LinkOption[]> => {
  const { data } = await supabaseAdmin()
    .from("contribution_links")
    .select("id, assigned_name, label")
    .eq("celebration_id", celebrationId)
    .order("assigned_name");
  return (data ?? []).map((l) => ({ id: l.id, name: l.assigned_name ?? l.label ?? "Sin nombre" }));
});

// Para el Resumen: 1 consulta ligera
export const getLinkStats = cache(async (celebrationId: string): Promise<LinkStats> => {
  const { data } = await supabaseAdmin()
    .from("contribution_links")
    .select("revoked_at, expires_at, last_used_at")
    .eq("celebration_id", celebrationId);

  const stats: LinkStats = { active: 0, unused: 0, revoked: 0, expired: 0 };
  for (const l of data ?? []) {
    const state = resolveState(l.revoked_at, l.expires_at);
    if (state === "revocado") stats.revoked++;
    else if (state === "expirado") stats.expired++;
    else {
      stats.active++;
      if (!l.last_used_at) stats.unused++;
    }
  }
  return stats;
});