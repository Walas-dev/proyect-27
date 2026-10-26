// ModerationButtons.tsx
import { Check, RotateCcw, X, type LucideIcon } from "lucide-react";
import { setStatus } from "@/app/admin/_actions/moderation";
import type { Status } from "@/lib/admin/constants";

const ACTIONS: Record<Status, { label: string; icon: LucideIcon; cls: string }> = {
  approved: { label: "Aprobar", icon: Check, cls: "bg-emerald-700 text-white" },
  rejected: { label: "Rechazar", icon: X, cls: "bg-red-700 text-white" },
  pending: { label: "Pendiente", icon: RotateCcw, cls: "bg-white text-primary ring-1 ring-primary/30" },
};

const ORDER: Status[] = ["approved", "rejected", "pending"];

export default function ModerationButtons({
  table,
  id,
  status,
}: {
  table: "memories" | "letters" | "songs";
  id: string;
  status: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.filter((s) => s !== status).map((to) => {
        const { label, icon: Icon, cls } = ACTIONS[to];
        return (
          <form key={to} action={setStatus}>
            <input type="hidden" name="table" value={table} />
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={to} />
            <button
              type="submit"
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold ${cls}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          </form>
        );
      })}
    </div>
  );
}