// src/app/admin/(panel)/canciones/page.tsx
import Link from "next/link";
import { ListMusic } from "lucide-react";
import { parseListParams } from "@/lib/admin/params";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLinkOptions } from "@/lib/admin/queries/links";
import { getSongsPage } from "@/lib/admin/queries/songs";
import { getContentStats } from "@/lib/admin/stats";
import SongCard from "@/components/admin/songs/SongCard";
import ModerationList from "@/components/admin/ui/ModerationList";

export default async function CancionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const celebration = await requireCelebration();
  const params = parseListParams(await searchParams);

  const [{ items, total }, stats, links] = await Promise.all([
    getSongsPage(celebration.id, params),
    getContentStats(celebration.id),
    getLinkOptions(celebration.id),
  ]);

  return (
    <ModerationList
      title="Canciones"
      description="Canciones que piden los invitados."
      basePath="/admin/canciones"
      params={params}
      counts={stats.songs}
      links={links}
      total={total}
      emptyTitle="No hay canciones aquí"
      gridClassName="grid gap-4 sm:grid-cols-2"
      headerAction={
        <Link
          href="/admin/canciones/spotify"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-secondary"
        >
          <ListMusic className="h-5 w-5" aria-hidden="true" />
          Spotify
        </Link>
      }
    >
      {items.map((s) => (
        <SongCard key={s.id} song={s} />
      ))}
    </ModerationList>
  );
}