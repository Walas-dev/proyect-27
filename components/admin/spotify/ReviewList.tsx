// src/components/admin/spotify/ReviewList.tsx
import { ExternalLink, SkipForward } from "lucide-react";
import { chooseTrack, skipSong } from "@/app/admin/_actions/spotify";
import type { SyncSong } from "@/lib/admin/queries/spotify";
import type { Scored } from "@/lib/spotify/match";

const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export default function ReviewList({
  songs,
  candidates,
}: {
  songs: SyncSong[];
  candidates: Map<string, Scored[]>;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {songs.map((song) => {
        const options = candidates.get(song.id) ?? [];
        return (
          <li key={song.id} className="rounded-2xl bg-white p-4 ring-1 ring-primary/10">
            <p className="font-bold text-primary">
              {song.title} <span className="font-normal text-text/70">· {song.artist}</span>
            </p>

            {options.length === 0 ? (
              <p className="mt-2 text-sm text-text/70">No encontramos coincidencias en Spotify.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {options.map(({ track }) => (
                  <li key={track.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-2">
                    {track.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.cover} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded bg-primary/10" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-primary">{track.name}</p>
                      <p className="truncate text-xs text-text/70">
                        {track.artists.join(", ")} · {mmss(track.durationMs)}
                      </p>
                    </div>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${track.name} en Spotify`}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary ring-1 ring-primary/30"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <form action={chooseTrack}>
                      <input type="hidden" name="id" value={song.id} />
                      <input type="hidden" name="trackId" value={track.id} />
                      <button type="submit" className="min-h-10 rounded-full bg-primary px-4 text-xs font-bold text-secondary">
                        Elegir
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form action={skipSong} className="mt-3">
              <input type="hidden" name="id" value={song.id} />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-xs font-bold text-primary ring-1 ring-primary/30"
              >
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                No agregar a Spotify
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}