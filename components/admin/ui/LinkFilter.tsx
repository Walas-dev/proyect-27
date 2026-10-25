// LinkFilter.tsx
import Form from "next/form";
import Link from "next/link";
import { X } from "lucide-react";
import { listHref, type ListParams } from "@/lib/admin/params";
import type { LinkOption } from "@/lib/admin/queries/links";

export default function LinkFilter({
  basePath,
  params,
  links,
}: {
  basePath: string;
  params: ListParams;
  links: LinkOption[];
}) {
  if (links.length === 0) return null;

  return (
    <Form action={basePath} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="estado" value={params.status} />

      <div>
        <label htmlFor="filtro-enlace" className="block text-xs font-bold text-primary">
          Persona
        </label>
        <select
          id="filtro-enlace"
          name="enlace"
          defaultValue={params.linkId ?? ""}
          className="mt-1 min-h-11 rounded-xl bg-white px-3 text-sm ring-1 ring-primary/20"
        >
          <option value="">Todas</option>
          {links.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="min-h-11 rounded-full bg-primary px-5 text-sm font-bold text-secondary"
      >
        Aplicar
      </button>

      {params.linkId && (
        <Link
          href={listHref(basePath, params, { linkId: null, page: 1 })}
          className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-bold text-primary underline underline-offset-4"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Quitar filtro
        </Link>
      )}
    </Form>
  );
}