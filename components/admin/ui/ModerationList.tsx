// ModerationList.tsx  (estructura común de las tres secciones)
import type { ReactNode } from "react";
import { totalPages } from "@/lib/admin/pagination";
import type { ListParams } from "@/lib/admin/params";
import type { LinkOption } from "@/lib/admin/queries/links";
import type { StatusCounts } from "@/lib/admin/types";
import EmptyState from "./EmptyState";
import LinkFilter from "./LinkFilter";
import PageHeader from "./PageHeader";
import Pagination from "./Pagination";
import StatusTabs from "./StatusTabs";

export default function ModerationList({
  title,
  description,
  basePath,
  params,
  counts,
  links,
  total,
  emptyTitle,
  gridClassName = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  children,
}: {
  title: string;
  description: string;
  basePath: string;
  params: ListParams;
  counts: StatusCounts;
  links: LinkOption[];
  total: number;
  emptyTitle: string;
  gridClassName?: string;
  children: ReactNode; // las tarjetas (<li>)
}) {
  return (
    <>
      <PageHeader title={title} description={description} />

      <div className="mb-6 flex flex-col gap-4">
        <StatusTabs basePath={basePath} params={params} counts={params.linkId ? undefined : counts} />
        <LinkFilter basePath={basePath} params={params} links={links} />
      </div>

      {total === 0 ? (
        <EmptyState title={emptyTitle} text="Prueba con otro estado o quita el filtro de persona." />
      ) : (
        <>
          <ul className={gridClassName}>{children}</ul>
          <Pagination basePath={basePath} params={params} pages={totalPages(total)} total={total} />
        </>
      )}
    </>
  );
}