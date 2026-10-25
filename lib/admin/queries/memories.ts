// src/lib/admin/queries/memories.ts
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { ListParams } from "@/lib/admin/params";
import { queryModerated } from "./list";

export type AdminMemory = {
  id: string;
  url: string;
  caption: string | null;
  authorName: string | null;
  status: string;
  createdAt: string;
};

type Row = {
  id: string;
  image_path: string;
  caption: string | null;
  author_name: string | null;
  status: string;
  created_at: string;
};

export async function getMemoriesPage(celebrationId: string, params: ListParams) {
  const { rows, total } = await queryModerated<Row>(
    "memories",
    "id, image_path, caption, author_name, status, created_at",
    celebrationId,
    params
  );

  const bucket = supabaseAdmin().storage.from("memories");
  const items: AdminMemory[] = rows.map((r) => ({
    id: r.id,
    url: bucket.getPublicUrl(r.image_path).data.publicUrl,
    caption: r.caption,
    authorName: r.author_name,
    status: r.status,
    createdAt: r.created_at,
  }));

  return { items, total };
}