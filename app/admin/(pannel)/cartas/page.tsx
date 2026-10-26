// src/app/admin/(panel)/recuerdos/page.tsx
import { parseListParams } from "@/lib/admin/params";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLettersPage } from "@/lib/admin/queries/letters";
import { getContentStats } from "@/lib/admin/stats";
import { getLinkOptions } from "@/lib/admin/queries/links";
import LetterCard from "@/components/admin/letters/page";
import ModerationList from "@/components/admin/ui/ModerationList";

export default async function RecuerdosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const celebration = await requireCelebration();
  const params = parseListParams(await searchParams);

  const [{ items, total }, stats, links] = await Promise.all([
    getLettersPage(celebration.id, params),
    getContentStats(celebration.id),
    getLinkOptions(celebration.id),
  ]);

  return (
    <ModerationList
      title="Cartas"
      description="Cartas que envían los invitados."
      basePath="/admin/cartas"
      params={params}
      counts={stats.letters}
      links={links}
      total={total}
      emptyTitle="No hay cartas aquí"
    >
      {items.map((m) => (
        <LetterCard key={m.id} letter={m} />
      ))}
    </ModerationList>
  );
}