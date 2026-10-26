// src/app/admin/(panel)/enlaces/page.tsx  (reemplaza)
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLinks } from "@/lib/admin/queries/links";
import LinkRow from "@/components/admin/links/LinkRow";
import NewLinkDialog from "@/components/admin/links/NewLinkDialog";
import EmptyState from "@/components/admin/ui/EmptyState";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function EnlacesPage() {
  const celebration = await requireCelebration();
  const links = await getLinks(celebration.id);

  return (
    <>
      <PageHeader
        title="Enlaces"
        description="Cada persona tiene su propio enlace. Toca una para ver su información."
      >
        <NewLinkDialog />
      </PageHeader>

      {links.length === 0 ? (
        <EmptyState title="Aún no hay enlaces" text="Crea el primero con el botón Nueva persona." />
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((l) => (
            <LinkRow key={l.id} link={l} />
          ))}
        </ul>
      )}
    </>
  );
}