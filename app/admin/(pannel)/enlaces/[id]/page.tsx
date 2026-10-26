// src/app/admin/(panel)/enlaces/[id]/page.tsx  (carpeta nueva)
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateLink } from "@/app/admin/_actions/links";
import { expiryToDateInput } from "@/lib/admin/dates";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLinks } from "@/lib/admin/queries/links";
import { fmtDate } from "@/lib/format";
import LinkAccess from "@/components/admin/links/LinkAccess";
import LinkActivity from "@/components/admin/links/LinkActivity";
import LinkForm from "@/components/admin/links/LinkForm";
import LinkStateActions from "@/components/admin/links/LinkStateActions";
import LinkStateBadge from "@/components/admin/links/LinkStateBadge";
import PageHeader from "@/components/admin/ui/PageHeader";
import PanelSection from "@/components/admin/ui/PanelSection";

export default async function EnlaceDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const celebration = await requireCelebration();

  const link = (await getLinks(celebration.id)).find((l) => l.id === id);
  if (!link) notFound();

  const DATA: [string, string][] = [
    ["Creado", fmtDate(link.createdAt)],
    ["Último uso", fmtDate(link.lastUsedAt)],
    ["Caduca", link.expiresAt ? fmtDate(link.expiresAt) : "Nunca"],
    ["Publicación", link.autoApprove ? "Sin revisión" : "Con revisión"],
  ];

  return (
    <>
      <Link
        href="/admin/enlaces"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a enlaces
      </Link>

      <PageHeader title={link.assignedName ?? "Sin nombre"} description={link.label ?? undefined}>
        <LinkStateBadge state={link.state} />
      </PageHeader>

      <div className="flex flex-col gap-10">
        <PanelSection title="Aportes">
          <LinkActivity linkId={link.id} activity={link.activity} />
        </PanelSection>

        <PanelSection title="Enlace de invitación">
          <LinkAccess id={link.id} hasToken={link.hasToken} active={link.state === "activo"} />
        </PanelSection>

        <PanelSection title="Datos">
          <dl className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-primary/10 sm:grid-cols-2">
            {DATA.map(([term, value]) => (
              <div key={term}>
                <dt className="text-xs font-bold uppercase tracking-wide text-primary/60">{term}</dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </PanelSection>

        <PanelSection title="Editar">
          <LinkForm
            action={updateLink}
            submitLabel="Guardar cambios"
            defaults={{
              id: link.id,
              name: link.assignedName ?? "",
              label: link.label ?? "",
              expires: expiryToDateInput(link.expiresAt),
              autoApprove: link.autoApprove,
            }}
          />
        </PanelSection>

        <PanelSection title="Estado">
          <p className="mb-3 text-sm text-text/70">
            Revocar corta el acceso al instante. Puedes reactivarlo cuando quieras. Si el enlace
            expiró, cambia la fecha de caducidad en Editar.
          </p>
          <LinkStateActions id={link.id} revoked={link.state === "revocado"} />
        </PanelSection>
      </div>
    </>
  );
}