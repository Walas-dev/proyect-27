// src/app/admin/(panel)/recuerdos/page.tsx
import { parseListParams } from "@/lib/admin/params";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLinkOptions } from "@/lib/admin/queries/links";
import { getMemoriesPage } from "@/lib/admin/queries/memories";
import { getContentStats } from "@/lib/admin/stats";
import MemoryCard from "@/components/admin/memories/MemoryCard";
import ModerationList from "@/components/admin/ui/ModerationList";

export default async function RecuerdosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const celebration = await requireCelebration();
  const params = parseListParams(await searchParams);

  const [{ items, total }, stats, links] = await Promise.all([
    getMemoriesPage(celebration.id, params),
    getContentStats(celebration.id),
    getLinkOptions(celebration.id),
  ]);

  return (
    <ModerationList
      title="Recuerdos"
      description="Fotos que envían los invitados."
      basePath="/admin/recuerdos"
      params={params}
      counts={stats.memories}
      links={links}
      total={total}
      emptyTitle="No hay recuerdos aquí"
    >
      {items.map((m) => (
        <MemoryCard key={m.id} memory={m} />
      ))}
    </ModerationList>
  );
}