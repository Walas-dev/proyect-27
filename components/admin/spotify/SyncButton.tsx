// src/components/admin/spotify/SyncButton.tsx
"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";
import { syncSongsAction } from "@/app/admin/_actions/spotify";

export default function SyncButton({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState(syncSongsAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <button
        type="submit"
        disabled={pending || disabled}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-secondary shadow-md disabled:opacity-50"
      >
        <RefreshCw className={`h-5 w-5 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
        {pending ? "Sincronizando…" : "Sincronizar con Spotify"}
      </button>

      {state && "error" in state && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p role="status" className="text-sm font-bold text-emerald-800">
          {state.message}
        </p>
      )}
    </form>
  );
}