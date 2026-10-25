// Pagination.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listHref, type ListParams } from "@/lib/admin/params";

const PAGER = "inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-sm font-bold ring-1 ring-primary/20";

export default function Pagination({
  basePath,
  params,
  pages,
  total,
}: {
  basePath: string;
  params: ListParams;
  pages: number;
  total: number;
}) {
  if (pages <= 1) return null;

  const hasPrev = params.page > 1;
  const hasNext = params.page < pages;

  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-between gap-3">
      {hasPrev ? (
        <Link href={listHref(basePath, params, { page: params.page - 1 })} className={`${PAGER} bg-white text-primary`}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </Link>
      ) : (
        <span className={`${PAGER} opacity-40`}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </span>
      )}

      <p className="text-center text-sm font-bold text-primary">
        Página {params.page} de {pages}
        <span className="block text-xs font-normal text-text/60">{total} en total</span>
      </p>

      {hasNext ? (
        <Link href={listHref(basePath, params, { page: params.page + 1 })} className={`${PAGER} bg-white text-primary`}>
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${PAGER} opacity-40`}>
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}