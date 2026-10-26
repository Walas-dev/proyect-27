
import {
  AudioLines,
  Disc3,
  Headphones,
  Music2,
  Sparkles,
  ListMusic,
} from "lucide-react";

import SongRequest from "./songRequest";
import CassettePlayer from "./cassettePlayer";
import type { Song } from "@/lib/types";

export default function Melodias({
  songs,
  token,
  playlistUrl,
}: {
  songs: Song[];
  token?: string;
  playlistUrl:string | null;
}) {
  return (
    <section
      id="melodias"
      className="relative isolate scroll-mt-20 overflow-hidden px-4 py-20 sm:px-6 md:py-28"
    >
      
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-primary"
      >
        <Music2
          className="music-float absolute left-[8%] top-24 h-10 w-10 -rotate-12 text-accent sm:left-[14%] sm:h-14 sm:w-14"
          strokeWidth={1.3}
        />

        <Disc3
          className="music-spin absolute right-[8%] top-28 h-14 w-14 text-primary/50 sm:right-[14%] sm:h-[4.5rem] sm:w-[4.5rem]"
          strokeWidth={1}
        />

        <AudioLines
          className="music-float-reverse absolute right-[12%] top-[48%] h-9 w-9 text-accent sm:right-[8%] sm:h-12 sm:w-12"
          strokeWidth={1.4}
        />

        <Headphones
          className="music-float absolute bottom-20 left-[9%] h-10 w-10 rotate-6 text-primary/60 sm:left-[15%] sm:h-12 sm:w-12"
          strokeWidth={1.2}
        />

        <Music2
          className="music-float-reverse absolute bottom-24 right-[10%] h-9 w-9 rotate-12 text-accent sm:right-[17%] sm:h-12 sm:w-12"
          strokeWidth={1.3}
        />

        <Sparkles
          className="music-twinkle absolute left-[47%] top-12 h-6 w-6 text-accent/80"
          strokeWidth={1.3}
        />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-10 text-center md:mb-14">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="h-px w-7 bg-accent/60" />

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/70 sm:text-sm sm:tracking-[0.25em]">
              Una banda sonora para recordar
            </p>

            <span className="h-px w-7 bg-accent/60" />
          </div>

          <h2 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Melodías
            <span className="mt-1 block font-medium italic text-accent">
              que hablan por nosotros.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-text/75 sm:text-base sm:leading-8">
            Hay canciones que nos devuelven a un instante, nos recuerdan
            a alguien o expresan lo que sentimos. Esta colección reúne
            melodías para acompañar tus recuerdos y hacer especial cada
            momento.
          </p>

          {token && (
            <div className="mt-7">
              <SongRequest token={token} />
            </div>
          )}
          {playlistUrl && (
            <div className="mt-5 flex justify-center">
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-primary ring-2 ring-primary/30 transition hover:bg-primary/10"
              >
                <ListMusic className="h-5 w-5" aria-hidden="true" />
                Abrir la playlist en Spotify
              </a>
            </div>
          )}
        </header>



        {songs.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-primary/10 bg-white/50 px-6 py-10 text-center shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-primary">
              <AudioLines
                className="h-7 w-7"
                strokeWidth={1.4}
                aria-hidden="true"
              />
            </div>

            <p className="font-display text-xl font-semibold text-primary sm:text-2xl">
              Aquí comienza tu banda sonora
            </p>

            <p className="mt-2 text-sm leading-6 text-text/70">
              Pronto habrá canciones que te harán sonreír, recordar
              momentos especiales y sentir cerca a quienes te quieren.
            </p>
          </div>
        ) : (
          <CassettePlayer songs={songs} />
        )}
      </div>
    </section>
  );
}
