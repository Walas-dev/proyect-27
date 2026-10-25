// src/components/admin/links/LinkAccess.tsx
"use client";

import { useState, useTransition } from "react";
import { Eye, RefreshCw } from "lucide-react";
import {
  regenerateLink,
  revealLink,
  type AccessResult,
} from "@/app/admin/_actions/link-access";
import InviteUrlBox from "./InviteUrlBox";

export default function LinkAccess({
  id,
  hasToken,
  active,
}: {
  id: string;
  hasToken: boolean;
  active: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<AccessResult>) {
    setError("");
    startTransition(async () => {
      const res = await action(id);
      if ("error" in res) setError(res.error);
      else setUrl(res.url);
      setConfirming(false);
    });
  }

  const BTN =
    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold ring-1 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3">
      {!active && (
        <p className="text-sm text-text/70">
          El enlace no funciona mientras esté revocado o expirado.
        </p>
      )}
      {!hasToken && (
        <p className="text-sm text-text/70">
          Este enlace se creó antes de que se pudiera guardar y no se puede mostrar. Si la
          persona lo perdió, regenera uno nuevo.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {hasToken && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(revealLink)}
            className={`${BTN} bg-primary text-secondary ring-primary`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Mostrar enlace
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(true)}
          className={`${BTN} bg-white text-primary ring-primary/30`}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Regenerar
        </button>
      </div>

      {confirming && (
        <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm ring-1 ring-amber-300">
          <p className="font-bold text-amber-950">
            El enlace actual dejará de funcionar y tendrás que enviarle el nuevo.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(regenerateLink)}
              className={`${BTN} bg-amber-700 text-white ring-amber-700`}
            >
              Sí, regenerar
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={`${BTN} bg-white text-primary ring-primary/30`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {url && <InviteUrlBox url={url} />}
    </div>
  );
}