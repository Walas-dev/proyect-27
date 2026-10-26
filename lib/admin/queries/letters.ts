// src/lib/admin/queries/letters.ts
import "server-only";
import type { ListParams } from "@/lib/admin/params";
import { queryModerated } from "./list";

export type AdminLetter = {
  id: string;
  title: string | null;
  message: string;
  authorName: string | null;
  color: string;
  icon: string;
  status: string;
  createdAt: string;
};

type Row = {
  id: string;
  title: string | null;
  message: string;
  author_name: string | null;
  color: string;
  icon: string;
  status: string;
  created_at: string;
};

export async function getLettersPage(celebrationId: string, params: ListParams) {
  const { rows, total } = await queryModerated<Row>(
    "letters",
    "id, title, message, author_name, color, icon, status, created_at",
    celebrationId,
    params
  );

  const items: AdminLetter[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    authorName: r.author_name,
    color: r.color,
    icon: r.icon,
    status: r.status,
    createdAt: r.created_at,
  }));

  return { items, total };
}