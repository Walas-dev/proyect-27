// src/components/admin/links/LinkStateActions.tsx
import { Ban, RotateCcw } from "lucide-react";
import { setLinkRevoked } from "@/app/admin/_actions/links";

export default function LinkStateActions({ id, revoked }: { id: string; revoked: boolean }) {
  return (
    <form action={setLinkRevoked}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="revoke" value={revoked ? "0" : "1"} />
      <button
        type="submit"
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold ring-1 ${
          revoked ? "bg-emerald-700 text-white ring-emerald-700" : "bg-white text-red-700 ring-red-300"
        }`}
      >
        {revoked ? (
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Ban className="h-4 w-4" aria-hidden="true" />
        )}
        {revoked ? "Reactivar enlace" : "Revocar enlace"}
      </button>
    </form>
  );
}