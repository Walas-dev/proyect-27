// StatCard.tsx  (tarjeta del resumen)
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { plural } from "@/lib/format";
import type { StatusCounts } from "@/lib/admin/types";

export default function StatCard({
  icon,
  title,
  href,
  counts,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  counts: StatusCounts;
}) {
  const hasPending = counts.pending > 0;

  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-2xl p-4 ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
        hasPending ? "bg-amber-50 ring-amber-300" : "bg-white ring-primary/10"
      }`}
    >
      <div className="flex items-center justify-between text-primary">
        <span className="flex items-center gap-2 font-bold">
          {icon}
          {title}
        </span>
        <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      </div>

      <div className="flex items-end gap-2">
        <span className={`font-display text-5xl font-semibold ${hasPending ? "text-primary" : "text-primary/35"}`}>
          {counts.pending}
        </span>
        <span className="pb-2 text-sm font-bold text-primary/70">
          {plural(counts.pending, "pendiente", "pendientes")}
        </span>
      </div>

      <p className="text-xs text-text/70">
        {counts.approved} {plural(counts.approved, "aprobado", "aprobados")} · {counts.rejected}{" "}
        {plural(counts.rejected, "rechazado", "rechazados")}
      </p>
    </Link>
  );
}