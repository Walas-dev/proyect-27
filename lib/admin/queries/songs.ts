// src/lib/admin/queries/songs.ts
import "server-only";
import type { ListParams } from "@/lib/admin/params";
import { queryModerated } from "./list";

export type AdminSong = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  previewUrl: string | null;
  hasAudio: boolean;
  authorName: string | null;
  status: string;
  createdAt: string;
};

type Row = {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  preview_url: string | null;
  audio_path: string | null;
  author_name: string | null;
  status: string;
  created_at: string;
};

export async function getSongsPage(celebrationId: string, params: ListParams) {
  const { rows, total } = await queryModerated<Row>(
    "songs",
    "id, title, artist, cover_url, preview_url, audio_path, author_name, status, created_at",
    celebrationId,
    params
  );

  const items: AdminSong[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    coverUrl: r.cover_url,
    previewUrl: r.preview_url,
    hasAudio: !!r.audio_path,
    authorName: r.author_name,
    status: r.status,
    createdAt: r.created_at,
  }));

  return { items, total };
}