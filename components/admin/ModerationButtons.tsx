// src/components/admin/ModerationButtons.tsx
import { setStatus } from "@/app/admin/actions";

type Status = "pending" | "approved" | "rejected";

const STYLES: Record<Status, string> = {
  approved: "bg-emerald-700 text-white",
  rejected: "bg-red-700 text-white",
  pending: "bg-white text-primary ring-1 ring-primary/30",
};
const LABELS: Record<Status, string> = {
  approved: "Aprobar",
  rejected: "Rechazar",
  pending: "Volver a pendiente",
};

export default function ModerationButtons({
  table,
  id,
  status,
}: {
  table: "memories" | "letters" | "songs";
  id: string;
  status: string;
}) {
  const options = (["approved", "rejected", "pending"] as Status[]).filter((s) => s !== status);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((to) => (
        <form key={to} action={setStatus}>
          <input type="hidden" name="table" value={table} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={to} />
          <button
            type="submit"
            className={`min-h-10 rounded-full px-4 text-xs font-bold ${STYLES[to]}`}
          >
            {LABELS[to]}
          </button>
        </form>
      ))}
    </div>
  );
}