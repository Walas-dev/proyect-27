// StatusTabs.tsx
import Link from "next/link";
import { STATUSES, STATUS_LABEL } from "@/lib/admin/constants";
import { listHref, type ListParams, type StatusFilter } from "@/lib/admin/params";
import type { StatusCounts } from "@/lib/admin/types";

const TABS: { value: StatusFilter; label: string }[] = [
  ...STATUSES.map((s) => ({ value: s as StatusFilter, label: STATUS_LABEL[s] })),
  { value: "all", label: "Todos" },
];

export default function StatusTabs({
  basePath,
  params,
  counts,
}: {
  basePath: string;
  params: ListParams;
  counts?: StatusCounts; // sin contadores cuando hay filtro por persona
}) {
  const sum = counts ? counts.pending + counts.approved + counts.rejected : 0;

  return (
    <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = params.status === tab.value;
        const n = counts ? (tab.value === "all" ? sum : counts[tab.value]) : null;
        return (
          <Link
            key={tab.value}
            href={listHref(basePath, params, { status: tab.value, page: 1 })}
            aria-current={active ? "true" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold ring-1 transition-colors ${
              active
                ? "bg-primary text-secondary ring-primary"
                : "bg-white text-primary ring-primary/20 hover:bg-primary/10"
            }`}
          >
            {tab.label}
            {n !== null && (
              <span className={`text-xs ${active ? "text-secondary/80" : "text-primary/60"}`}>{n}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}