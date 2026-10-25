// src/app/admin/(panel)/recuerdos/page.tsx
import { parseListParams } from "@/lib/admin/params";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLinkOptions } from "@/lib/admin/queries/links";
import { getSongsPage } from "@/lib/admin/queries/songs";
import { getContentStats } from "@/lib/admin/stats";
import SongCard from "@/components/admin/songs/SongCard";
import ModerationList from "@/components/admin/ui/ModerationList";

export default async function SongPage({
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
      description="Canciones que envían los invitados."
      basePath="/admin/canciones"
      params={params}
      counts={stats.songs}
      links={links}
      total={total}
      emptyTitle="No hay canciones aquí"
    >
      {items.map((m) => (
        <SongCard key={m.id} song={m} />
      ))}
    </ModerationList>
  );
}