// src/app/admin/(panel)/canciones/spotify/page.tsx   (carpeta nueva)
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireCelebration } from "@/lib/admin/queries/celebration";
import {
  countSync,
  getReviewCandidates,
  getSpotifyConnection,
  getSyncSongs,
} from "@/lib/admin/queries/spotify";
import { isSpotifyConfigured } from "@/lib/spotify/config";
import ConnectionCard from "@/components/admin/spotify/ConnectionCard";
import PlaylistSetup from "@/components/admin/spotify/PlaylistSetup";
import ReviewList from "@/components/admin/spotify/ReviewList";
import SyncButton from "@/components/admin/spotify/SyncButton";
import PageHeader from "@/components/admin/ui/PageHeader";
import PanelSection from "@/components/admin/ui/PanelSection";

const ERRORS: Record<string, string> = {
  denied: "Cancelaste la autorización en Spotify.",
  state: "La conexión expiró. Inténtalo de nuevo.",
  token: "Spotify no entregó el permiso. Inténtalo de nuevo.",
  celebration: "No hay ninguna celebración creada.",
};

export default async function SpotifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const celebration = await requireCelebration();
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;

  const [connection, songs] = await Promise.all([
    getSpotifyConnection(celebration.id),
    getSyncSongs(celebration.id),
  ]);
  const counts = countSync(songs);
  const review = songs.filter((s) => s.status === "review" && !s.spotifyId);
  const candidates = await getReviewCandidates(celebration.id, review);

  const STATS: [string, number][] = [
    ["Por emparejar", counts.toMatch],
    ["En revisión", counts.review],
    ["Por agregar", counts.toAdd],
    ["En la playlist", counts.added],
  ];

  return (
    <>
      <Link href="/admin/canciones" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a canciones
      </Link>

      <PageHeader title="Spotify" description="Las canciones aprobadas entran a tu playlist." />

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          {error}
        </p>
      )}
      {sp.connected === "1" && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900 ring-1 ring-emerald-200">
          Cuenta conectada.
        </p>
      )}

      <div className="flex flex-col gap-10">
        <PanelSection title="Conexión">
          <ConnectionCard configured={isSpotifyConfigured()} connection={connection} />
        </PanelSection>

        {connection && !connection.playlistId && (
          <PanelSection title="Playlist">
            <PlaylistSetup />
          </PanelSection>
        )}

        {connection?.playlistId && (
          <PanelSection title="Sincronización">
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map(([label, n]) => (
                <div key={label} className="rounded-2xl bg-white p-3 ring-1 ring-primary/10">
                  <p className="font-display text-3xl font-semibold text-primary">{n}</p>
                  <p className="text-xs text-text/70">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-start gap-4">
              <SyncButton disabled={counts.toMatch + counts.toAdd === 0} />
              {connection.playlistUrl && (
                <a
                  href={connection.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-bold text-primary ring-2 ring-primary/30"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Abrir la playlist
                </a>
              )}
            </div>
          </PanelSection>
        )}

        {review.length > 0 && (
          <PanelSection title="Para revisar">
            <p className="mb-3 text-sm text-text/70">
              No estamos seguros de cuál es la versión correcta. Elige una o descarta la canción.
            </p>
            <ReviewList songs={review} candidates={candidates} />
          </PanelSection>
        )}
      </div>
    </>
  );
}