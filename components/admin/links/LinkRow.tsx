// src/components/admin/links/LinkRow.tsx  (reemplaza)
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AdminLink } from "@/lib/admin/queries/links";
import { fmtDate, plural } from "@/lib/format";
import LinkStateBadge from "./LinkStateBadge";

export default function LinkRow({ link }: { link: AdminLink }) {
  const a = link.activity;
  const pending = a.memoriesPending + a.lettersPending + a.songsPending;

  return (
    <li>
      <Link
        href={`/admin/enlaces/${link.id}`}
        className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-primary/10 transition hover:shadow-md"
      >
        <div className="min-w-0">
          <p className="truncate font-bold text-primary">
            {link.assignedName ?? "Sin nombre"}
            {link.autoApprove && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] text-secondary">
                sin revisión
              </span>
            )}
          </p>
          <p className="truncate text-xs text-text/70">
            {link.label ? `${link.label} · ` : ""}
            Último uso: {fmtDate(link.lastUsedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {pending > 0 && (
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
              {pending} {plural(pending, "pendiente", "pendientes")}
            </span>
          )}
          <LinkStateBadge state={link.state} />
          <ChevronRight className="h-5 w-5 text-primary/50" aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}