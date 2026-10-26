// src/components/admin/spotify/ConnectionCard.tsx
import { Check, Link2, Unlink } from "lucide-react";
import { disconnectSpotify } from "@/app/admin/_actions/spotify";
import type { SpotifyConnection } from "@/lib/admin/queries/spotify";
import { fmtDate } from "@/lib/format";

const BTN = "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold";

export default function ConnectionCard({
  configured,
  connection,
}: {
  configured: boolean;
  connection: SpotifyConnection | null;
}) {
  if (!configured) {
    return (
      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-300">
        Faltan las variables <code>SPOTIFY_CLIENT_ID</code>, <code>SPOTIFY_CLIENT_SECRET</code> y{" "}
        <code>SPOTIFY_REDIRECT_URI</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-primary/10">
      {connection ? (
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
          <Check className="h-4 w-4" aria-hidden="true" />
          Cuenta conectada · {fmtDate(connection.connectedAt)}
        </p>
      ) : (
        <p className="text-sm text-text/70">Conecta la cuenta Premium que será dueña de la playlist.</p>
      )}

      <div className="flex gap-2">
        {/* <a> y no <Link>: es una ruta que redirige a Spotify y no debe precargarse */}
        <a href="/api/spotify/login" className={`${BTN} bg-primary text-secondary`}>
          <Link2 className="h-4 w-4" aria-hidden="true" />
          {connection ? "Reconectar" : "Conectar con Spotify"}
        </a>
        {connection && (
          <form action={disconnectSpotify}>
            <button type="submit" className={`${BTN} bg-white text-red-700 ring-1 ring-red-300`}>
              <Unlink className="h-4 w-4" aria-hidden="true" />
              Desconectar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}