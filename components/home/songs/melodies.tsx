// components/home/songs/melodies.tsx
import SongRequest from "./songRequest";
import CassettePlayer from "./cassettePlayer";
import type { Song } from "@/lib/types";
import { Music } from "lucide-react";

export default function Melodias({
  songs,
  token,
}: {
  songs: Song[];
  token?: string;
}) {
  return (
    <section id="melodias" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary/70">
            Nuestra banda sonora
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
            Melodías
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text/80">
            Las canciones de las personas que te quieren.
          </p>
          {token && (
            <div className="mt-6">
              <SongRequest token={token} />
            </div>
          )}
        </header>

        {songs.length === 0 ? (
          <p className="flex justify-center gap-3 py-3 text-center text-text/70">
            Pronto sonarán aquí las canciones <Music className="h-5 w-5" aria-hidden="true" />
          </p>
        ) : (
          <CassettePlayer songs={songs} />
        )}
      </div>
    </section>
  );
}