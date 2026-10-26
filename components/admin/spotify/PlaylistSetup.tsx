// src/components/admin/spotify/PlaylistSetup.tsx
"use client";

import { useActionState } from "react";
import { ListPlus, Link2 } from "lucide-react";
import {
  createPlaylistAction,
  linkPlaylistAction,
  type ActionState,
} from "@/app/admin/_actions/spotify";

const FIELD =
  "w-full rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-secondary disabled:opacity-50";

function Message({ state }: { state: ActionState }) {
  if (!state) return null;
  return "error" in state ? (
    <p role="alert" className="text-sm font-semibold text-red-700">
      {state.error}
    </p>
  ) : (
    <p role="status" className="text-sm font-bold text-emerald-800">
      {state.message}
    </p>
  );
}

export default function PlaylistSetup() {
  const [created, createAction, creating] = useActionState(createPlaylistAction, undefined);
  const [linked, linkAction, linking] = useActionState(linkPlaylistAction, undefined);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form action={createAction} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-primary/10">
        <h3 className="font-bold text-primary">Crear una playlist nueva</h3>
        <input name="name" maxLength={100} placeholder="Nombre (opcional)" aria-label="Nombre de la playlist" className={FIELD} />
        <button type="submit" disabled={creating} className={BTN}>
          <ListPlus className="h-4 w-4" aria-hidden="true" />
          {creating ? "Creando…" : "Crear playlist"}
        </button>
        <Message state={created} />
      </form>

      <form action={linkAction} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-primary/10">
        <h3 className="font-bold text-primary">Usar una que ya tengo</h3>
        <input name="playlist" required placeholder="Enlace de la playlist" aria-label="Enlace de la playlist" className={FIELD} />
        <button type="submit" disabled={linking} className={BTN}>
          <Link2 className="h-4 w-4" aria-hidden="true" />
          {linking ? "Vinculando…" : "Vincular"}
        </button>
        <Message state={linked} />
      </form>
    </div>
  );
}