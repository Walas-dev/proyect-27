// src/components/admin/links/LinkStateBadge.tsx
import type { LinkState } from "@/lib/admin/queries/links";

const STYLES: Record<LinkState, string> = {
  activo: "bg-emerald-100 text-emerald-900",
  revocado: "bg-red-100 text-red-900",
  expirado: "bg-amber-100 text-amber-900",
};

export default function LinkStateBadge({ state }: { state: LinkState }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STYLES[state]}`}>{state}</span>;
}