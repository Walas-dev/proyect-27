// CardMeta.tsx  (estado + fecha, común a todas las tarjetas)
import { fmtDate } from "@/lib/format";
import StatusBadge from "./StatusBadge";

export default function CardMeta({ status, createdAt }: { status: string; createdAt: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <StatusBadge status={status} />
      <span className="text-xs text-text/60">{fmtDate(createdAt)}</span>
    </div>
  );
}