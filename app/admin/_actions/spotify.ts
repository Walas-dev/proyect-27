// src/app/admin/_actions/spotify.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { UUID_RE } from "@/lib/admin/constants";
import { getAdminCelebration, type AdminCelebration } from "@/lib/admin/queries/celebration";
import { getSpotifyConnection, getSyncSongs } from "@/lib/admin/queries/spotify";
import { getAccessToken } from "@/lib/spotify/auth";
import { addItems, createPlaylist, SpotifyError } from "@/lib/spotify/api";
import { AUTO_THRESHOLD, findCandidates } from "@/lib/spotify/match";

export type ActionState = { ok: true; message: string } | { error: string } | undefined;

const revalidate = () => {
  revalidatePath("/admin", "layout");
  revalidatePath("/[slug]", "page"); // la página pública muestra los enlaces de Spotify
};

const clean = (v: unknown, max: number) =>
  String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

const explain = (e: unknown) =>
  e instanceof SpotifyError && e.status === 429
    ? "Spotify pidió esperar un momento. Inténtalo de nuevo en un minuto."
    : e instanceof SpotifyError && e.status === 403
      ? "Spotify negó el permiso. Revisa que la playlist sea tuya y que tu Premium esté activo."
      : "No pudimos comunicarnos con Spotify. Inténtalo de nuevo.";

type SpotifyContext =
  | { ok: true; celebration: AdminCelebration; token: string }
  | { ok: false; error: string };

async function spotifyContext(): Promise<SpotifyContext> {
  await requireAdmin();
  const celebration = await getAdminCelebration();
  if (!celebration) return { ok: false, error: "No hay ninguna celebración creada." };

  let token: string | null = null;
  try {
    token = await getAccessToken(celebration.id);
  } catch {
    return { ok: false, error: "Spotify rechazó la conexión. Vuelve a conectar tu cuenta." };
  }
  if (!token) return { ok: false, error: "Conecta primero tu cuenta de Spotify." };

  return { ok: true, celebration, token };
}
export async function createPlaylistAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await spotifyContext();
  if (!ctx.ok) return { error: ctx.error };

  const name =
    clean(formData.get("name"), 100) ||
    `Melodías de ${ctx.celebration.recipient_name ?? "la celebración"}`;

  try {
    const p = await createPlaylist(ctx.token, name, "Las canciones de las personas que te quieren.");
    await supabaseAdmin()
      .from("spotify_connections")
      .update({ playlist_id: p.id, playlist_url: p.url })
      .eq("celebration_id", ctx.celebration.id);
  } catch (e) {
    return { error: explain(e) };
  }

  revalidate();
  return { ok: true, message: "Playlist creada." };
}

// Vincula una playlist que ya tengas (tiene que ser tuya)
export async function linkPlaylistAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const celebration = await getAdminCelebration();
  if (!celebration) return { error: "No hay ninguna celebración creada." };

  const raw = clean(formData.get("playlist"), 200);
  const id = /playlist\/([A-Za-z0-9]{22})/.exec(raw)?.[1] ?? (/^[A-Za-z0-9]{22}$/.test(raw) ? raw : null);
  if (!id) return { error: "Pega el enlace de la playlist o su identificador." };

  await supabaseAdmin()
    .from("spotify_connections")
    .update({ playlist_id: id, playlist_url: `https://open.spotify.com/playlist/${id}` })
    .eq("celebration_id", celebration.id);

  revalidate();
  return { ok: true, message: "Playlist vinculada." };
}

// Empareja las canciones nuevas y agrega a la playlist las ya emparejadas
export async function syncSongsAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  const ctx = await spotifyContext();
  if (!ctx.ok) return { error: ctx.error };

  const connection = await getSpotifyConnection(ctx.celebration.id);
  if (!connection?.playlistId) return { error: "Crea o vincula una playlist primero." };

  const db = supabaseAdmin();
  const songs = await getSyncSongs(ctx.celebration.id);

  // 1) Emparejar: de 5 en 5 para no pasarse del límite de Spotify
  let matched = 0;
  let review = 0;
  const pending = songs.filter((s) => !s.spotifyId && s.status === null);

  for (const group of chunk(pending, 5)) {
    await Promise.all(
      group.map(async (s) => {
        try {
          const [best] = await findCandidates(ctx.token, {
            title: s.title,
            artist: s.artist,
            durationMs: s.durationMs,
          });
          if (best && best.score >= AUTO_THRESHOLD) {
            await db.from("songs").update({ spotify_id: best.track.id, spotify_status: "matched" }).eq("id", s.id);
            s.spotifyId = best.track.id;
            matched++;
          } else {
            await db.from("songs").update({ spotify_status: "review" }).eq("id", s.id);
            review++;
          }
        } catch {
          /* queda sin procesar y se reintenta en la próxima sincronización */
        }
      })
    );
  }

  // 2) Agregar a la playlist lo emparejado que aún no está
  const toAdd = songs.filter((s) => s.spotifyId && !s.addedAt && s.status !== "skipped");
  let added = 0;
  if (toAdd.length > 0) {
    try {
      await addItems(
        ctx.token,
        connection.playlistId,
        toAdd.map((s) => `spotify:track:${s.spotifyId}`)
      );
      await db
        .from("songs")
        .update({ spotify_added_at: new Date().toISOString() })
        .in("id", toAdd.map((s) => s.id));
      added = toAdd.length;
    } catch (e) {
      revalidate();
      return { error: explain(e) };
    }
  }

  revalidate();
  return {
    ok: true,
    message: `Emparejadas: ${matched} · En revisión: ${review} · Agregadas a la playlist: ${added}`,
  };
}

export async function chooseTrack(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const trackId = String(formData.get("trackId") ?? "");
  if (!UUID_RE.test(id) || !/^[A-Za-z0-9]{22}$/.test(trackId)) return;

  await supabaseAdmin()
    .from("songs")
    .update({ spotify_id: trackId, spotify_status: "matched" })
    .eq("id", id);
  revalidate();
}

export async function skipSong(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return;

  await supabaseAdmin().from("songs").update({ spotify_status: "skipped" }).eq("id", id);
  revalidate();
}

export async function disconnectSpotify() {
  await requireAdmin();
  const celebration = await getAdminCelebration();
  if (!celebration) return;

  await supabaseAdmin().from("spotify_connections").delete().eq("celebration_id", celebration.id);
  revalidate();
}