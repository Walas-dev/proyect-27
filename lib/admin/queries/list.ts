// src/lib/admin/queries/list.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { pageRange } from "@/lib/admin/pagination";
import type { ListParams } from "@/lib/admin/params";

type ModeratedTable = "memories" | "letters" | "songs";

// Consulta paginada con filtros de estado y de enlace, común a las tres secciones
export async function queryModerated<Row>(
  table: ModeratedTable,
  columns: string,
  celebrationId: string,
  params: ListParams
) {
  let query = supabaseAdmin()
    .from(table)
    .select(columns, { count: "exact" })
    .eq("celebration_id", celebrationId);

  if (params.status !== "all") query = query.eq("status", params.status);
  if (params.linkId) query = query.eq("contribution_link_id", params.linkId);

  const { from, to } = pageRange(params.page);
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return { rows: (data ?? []) as unknown as Row[], total: count ?? 0 };
}