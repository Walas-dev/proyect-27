// src/app/admin/(panel)/page.tsx  (Resumen)
import Link from "next/link";
import { CircleCheck, Images, Link2, Mail, Music } from "lucide-react";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import { getLinkStats} from "@/lib/admin/queries/links";
import { getContentStats, toPending, totalPending } from "@/lib/admin/stats";
import { plural } from "@/lib/format";
import PageHeader from "@/components/admin/ui/PageHeader";
import StatCard from "@/components/admin/ui/StatCard";

const ICON = "h-5 w-5";

export default async function AdminHome() {
  const celebration = await requireCelebration();
  const [stats, linkStats] = await Promise.all([
    getContentStats(celebration.id),
    getLinkStats(celebration.id),
  ]);

  const pending = totalPending(toPending(stats));

  return (
    <>
      <PageHeader
        title="Resumen"
        description={
          pending > 0
            ? `Tienes ${pending} ${plural(pending, "aporte", "aportes")} por revisar.`
            : "Todo al día: no hay nada pendiente."
        }
      />

      <section aria-label="Contenido" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Images className={ICON} aria-hidden="true" />}
          title="Recuerdos"
          href="/admin/recuerdos?estado=pending"
          counts={stats.memories}
        />
        <StatCard
          icon={<Mail className={ICON} aria-hidden="true" />}
          title="Cartas"
          href="/admin/cartas?estado=pending"
          counts={stats.letters}
        />
        <StatCard
          icon={<Music className={ICON} aria-hidden="true" />}
          title="Canciones"
          href="/admin/canciones?estado=pending"
          counts={stats.songs}
        />
      </section>

      <section aria-label="Enlaces" className="mt-4">
        <Link
          href="/admin/enlaces"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-primary/10 transition hover:shadow-md"
        >
          <span className="flex items-center gap-2 font-bold text-primary">
            <Link2 className={ICON} aria-hidden="true" />
            Enlaces
          </span>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5">
              <CircleCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <dt className="text-text/70">Activos</dt>
              <dd className="font-bold text-primary">{linkStats.active}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-text/70">Sin usar</dt>
              <dd className="font-bold text-primary">{linkStats.unused}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-text/70">Revocados</dt>
              <dd className="font-bold text-primary">{linkStats.revoked}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-text/70">Expirados</dt>
              <dd className="font-bold text-primary">{linkStats.expired}</dd>
            </div>
          </dl>
        </Link>
      </section>
    </>
  );
}