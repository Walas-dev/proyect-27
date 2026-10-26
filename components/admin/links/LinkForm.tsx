// src/components/admin/links/LinkForm.tsx  (sirve para crear y para editar)
"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import type { LinkFormState } from "@/app/admin/_actions/links";
import InviteUrlBox from "./InviteUrlBox";

type Defaults = {
  id?: string;
  name?: string;
  label?: string;
  expires?: string;
  autoApprove?: boolean;
};

const FIELD =
  "mt-1 w-full rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary";

export default function LinkForm({
  action,
  submitLabel,
  defaults = {},
}: {
  action: (prev: LinkFormState, formData: FormData) => Promise<LinkFormState>;
  submitLabel: string;
  defaults?: Defaults;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const created = state && "ok" in state && state.url ? state : null;

  if (created?.url) {
    return <InviteUrlBox url={created.url} title={`Enlace de ${created.name}`} />;
  }

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <div>
        <label htmlFor="link-name" className="text-sm font-bold text-primary">
          Nombre de la persona
        </label>
        <input
          id="link-name"
          name="name"
          required
          maxLength={40}
          defaultValue={defaults.name}
          placeholder="Tía Marta"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="link-label" className="text-sm font-bold text-primary">
          Nota interna <span className="font-normal text-text/60">(opcional)</span>
        </label>
        <input
          id="link-label"
          name="label"
          maxLength={60}
          defaultValue={defaults.label}
          placeholder="Familia"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="link-expires" className="text-sm font-bold text-primary">
          Caduca el <span className="font-normal text-text/60">(opcional)</span>
        </label>
        <input
          id="link-expires"
          name="expires"
          type="date"
          defaultValue={defaults.expires}
          className={FIELD}
        />
      </div>

      <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-primary">
        <input
          type="checkbox"
          name="auto"
          defaultChecked={defaults.autoApprove}
          className="h-5 w-5 accent-primary"
        />
        Publicar sin revisión
      </label>

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-full bg-primary px-6 font-bold text-secondary shadow-md disabled:opacity-50 sm:col-span-2"
      >
        {pending ? "Guardando…" : submitLabel}
      </button>

      {state && "error" in state && (
        <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-2">
          {state.error}
        </p>
      )}
      {state && "ok" in state && !state.url && (
        <p role="status" className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 sm:col-span-2">
          <Check className="h-4 w-4" aria-hidden="true" />
          Cambios guardados
        </p>
      )}
    </form>
  );
}