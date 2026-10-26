// src/components/admin/links/InviteUrlBox.tsx
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function InviteUrlBox({ url, title }: { url: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* si el navegador bloquea el portapapeles, queda el texto para copiar a mano */
    }
  }

  return (
    <div role="status" className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200 sm:col-span-2">
      {title && <p className="text-sm font-bold text-emerald-900">{title}</p>}
      <p className="mt-2 break-all rounded-lg bg-white p-2 text-xs">{url}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}