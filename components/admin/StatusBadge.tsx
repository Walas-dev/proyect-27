// src/components/admin/StatusBadge.tsx
const MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-amber-100 text-amber-900" },
  approved: { label: "Aprobado", cls: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Rechazado", cls: "bg-red-100 text-red-900" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.pending;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>
  );
}