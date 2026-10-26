// src/components/admin/live/NewContentBanner.tsx
"use client";

import { Bell, RefreshCw } from "lucide-react";
import { plural } from "@/lib/format";
import { usePending } from "./PendingProvider";

export default function NewContentBanner() {
  const { newCount, refresh } = usePending();
  if (newCount === 0) return null;

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-100 px-4 py-3 text-amber-950 ring-1 ring-amber-300"
    >
      <p className="flex items-center gap-2 text-sm font-bold">
        <Bell className="h-4 w-4" aria-hidden="true" />
        {newCount} {plural(newCount, "aporte nuevo", "aportes nuevos")} por revisar
      </p>
      <button
        type="button"
        onClick={refresh}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-amber-900 px-4 text-xs font-bold text-white"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Actualizar
      </button>
    </div>
  );
}