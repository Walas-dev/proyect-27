// src/lib/admin/params.ts
import { STATUSES, UUID_RE, type Status } from "./constants";

export type StatusFilter = Status | "all";

export type ListParams = {
  status: StatusFilter;
  linkId: string | null;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Lee ?estado=&enlace=&pagina= de la URL. Por defecto se muestran los pendientes.
export function parseListParams(raw: RawParams): ListParams {
  const estado = first(raw.estado) ?? "";
  const enlace = first(raw.enlace) ?? "";
  const pagina = Number(first(raw.pagina));

  const status: StatusFilter =
    estado === "all"
      ? "all"
      : (STATUSES as readonly string[]).includes(estado)
        ? (estado as Status)
        : "pending";

  return {
    status,
    linkId: UUID_RE.test(enlace) ? enlace : null,
    page: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}

export function listHref(
  base: string,
  params: ListParams,
  overrides: Partial<ListParams> = {}
) {
  const next = { ...params, ...overrides };
  const qs = new URLSearchParams({ estado: next.status });
  if (next.linkId) qs.set("enlace", next.linkId);
  if (next.page > 1) qs.set("pagina", String(next.page));
  return `${base}?${qs.toString()}`;
}