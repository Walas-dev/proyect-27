// src/lib/admin/stats.ts
import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { ContentKind, ContentStats, PendingCounts, StatusCounts } from "./types";

const KINDS: ContentKind[] = ["memories", "letters", "songs"];
const emptyCounts = (): StatusCounts => ({ pending: 0, approved: 0, rejected: 0 });

// Una sola consulta a la vista: devuelve hasta 3 filas
export const getContentStats = cache(async (celebrationId: string): Promise<ContentStats> => {
  const stats: ContentStats = {
    memories: emptyCounts(),
    letters: emptyCounts(),
    songs: emptyCounts(),
  };

  const { data } = await supabaseAdmin()
    .from("admin_content_stats")
    .select("kind, pending, approved, rejected")
    .eq("celebration_id", celebrationId);

  for (const row of data ?? []) {
    const kind = row.kind as ContentKind;
    if (!KINDS.includes(kind)) continue;
    stats[kind] = {
      pending: Number(row.pending),
      approved: Number(row.approved),
      rejected: Number(row.rejected),
    };
  }
  return stats;
});

export const toPending = (s: ContentStats): PendingCounts => ({
  memories: s.memories.pending,
  letters: s.letters.pending,
  songs: s.songs.pending,
});

export const totalPending = (p: PendingCounts) => p.memories + p.letters + p.songs;