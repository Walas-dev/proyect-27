// components/home/songs/cassettePlayer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Song } from "@/lib/types";
import { ExternalLink } from "lucide-react";


const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

function BigReel({ spinning }: { spinning: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={`h-14 w-14 shrink-0 sm:h-16 sm:w-16 ${spinning ? "animate-spin motion-reduce:animate-none" : ""}`}
      style={spinning ? { animationDuration: "3s" } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="24" cy="24" r="20" />
      <circle cx="24" cy="24" r="6" />
      <path d="M24 18V8M18.8 27l-8.7 5M29.2 27l8.7 5" />
    </svg>
  );
}

function PlayPause({ playing, className = "h-6 w-6" }: { playing: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      {playing ? (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </>
      ) : (
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
      )}
    </svg>
  );
}

function EqBars() {
  return (
    <span aria-hidden="true" className="flex h-4 items-end gap-0.5 text-primary">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar w-1 rounded-sm bg-current"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

export default function CassettePlayer({ songs }: { songs: Song[] }) {
  // Suena el archivo completo si existe; si no, el fragmento de 30 s
  const tracks = useMemo(
    () => songs.map((s) => ({ ...s, src: s.audioUrl ?? s.previewUrl, isPreview: !s.audioUrl })),
    [songs]
  );
  const playable = useMemo(() => tracks.flatMap((t, i) => (t.src ? [i] : [])), [tracks]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wantPlay = useRef(false);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [volumeOk, setVolumeOk] = useState(false);
  const [failed, setFailed] = useState(false);

  const safeIndex = tracks[index]?.src ? index : (playable[0] ?? 0);
  const current = tracks[safeIndex];
  const pos = playable.indexOf(safeIndex);

  // iPhone/iPad ignoran el volumen del <audio>: solo mostramos el control si funciona
  useEffect(() => {
    const a = new Audio();
    a.volume = 0.5;
    setVolumeOk(a.volume === 0.5);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // La fuente del <audio> se maneja a mano para no reiniciar la canción por accidente
  useEffect(() => {
    const a = audioRef.current;
    const src = current?.src;
    if (!a || !src) return;
    if (a.getAttribute("src") !== src) a.src = src;
  }, [current?.src]);

  function startPlayback(a: HTMLAudioElement) {
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {
        wantPlay.current = false;
        setPlaying(false);
      });
  }

  function play() {
    const a = audioRef.current;
    if (!a) return;
    wantPlay.current = true;
    setFailed(false);
    startPlayback(a);
  }

  function pause() {
    audioRef.current?.pause();
    wantPlay.current = false;
    setPlaying(false);
  }

  const toggle = () => (playing ? pause() : play());

  function loadTrack(i: number) {
    const a = audioRef.current;
    const t = tracks[i];
    if (!a || !t?.src) return;
    wantPlay.current = true;
    setFailed(false);
    if (i !== safeIndex) {
      a.src = t.src;
      setIndex(i);
      setTime(0);
      setDuration(0);
    } else {
      a.currentTime = 0;
    }
    startPlayback(a);
  }

  function step(dir: 1 | -1) {
    if (playable.length === 0) return;
    loadTrack(playable[(pos + dir + playable.length) % playable.length]);
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(e.target.value);
    setTime(a.currentTime);
  }

  const hasPlayable = playable.length > 0 && current;

  return (
    <div>
      {hasPlayable && (
        <>
          {/* Casete */}
          <div className="relative mx-auto w-full max-w-md -rotate-1 rounded-3xl bg-primary p-4 pb-5 shadow-2xl">
            <span aria-hidden="true" className="absolute left-2 top-2 h-2 w-2 rounded-full bg-white/50" />
            <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white/50" />
            <span aria-hidden="true" className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white/50" />
            <span aria-hidden="true" className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white/50" />

            <div className="paper-lines rounded-xl bg-[#fffaf3] p-3 sm:p-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-primary/60">
                <span>Lado A</span>
                <span>
                  {pos + 1} / {playable.length}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-3">
                {current.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.cover}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded bg-primary/10 text-2xl">
                    🎵
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-hand text-3xl leading-none text-primary">
                    {current.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-text/70">{current.artist}</p>
                  {current.isPreview && (
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      Vista previa · 30 s
                    </span>
                  )}

                  {current.spotifyId && (
                    <a
                      href={`https://open.spotify.com/track/${current.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-secondary"
                    >
                      Escuchar completa en Spotify
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
                
                  {current.spotifyId && (
                    <a
                      href={`https://open.spotify.com/track/${current.spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-secondary"
                    >
                      Escuchar completa en Spotify
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-full bg-primary px-4 py-2 text-[#fffaf3]">
                <BigReel spinning={playing} />
                <span aria-hidden="true" className="mx-3 h-1 flex-1 rounded bg-current opacity-40" />
                <BigReel spinning={playing} />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="mx-auto mt-4 flex h-9 w-2/3 items-center justify-between rounded-b-2xl rounded-t-md bg-black/25 px-6"
            >
              <span className="h-3 w-3 rounded-full bg-secondary/80" />
              <span className="h-3 w-3 rounded-full bg-secondary/80" />
            </div>
          </div>

          {/* Controles */}
          <div className="mx-auto mt-6 w-full max-w-md rounded-3xl bg-secondary p-4 ring-1 ring-primary/10">
            {failed && (
              <p role="alert" className="mb-3 text-center text-sm font-semibold text-red-700">
                No pudimos reproducir esta canción. Prueba con la siguiente.
              </p>
            )}

            <div className="flex items-center gap-3 text-xs font-bold tabular-nums text-primary">
              <span className="w-9 text-right">{fmt(time)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(time, duration || 0)}
                onChange={onSeek}
                disabled={!duration}
                aria-label="Progreso de la canción"
                aria-valuetext={`${fmt(time)} de ${fmt(duration)}`}
                className="h-6 w-full accent-primary"
              />
              <span className="w-9">{fmt(duration)}</span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Canción anterior"
                className="grid h-12 w-12 place-items-center rounded-full text-primary ring-2 ring-primary/30"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M6 5h2v14H6zM20 5.5v13a1 1 0 0 1-1.55.83l-9-6.5a1 1 0 0 1 0-1.66l9-6.5A1 1 0 0 1 20 5.5Z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pausar" : "Reproducir"}
                className="grid h-16 w-16 place-items-center rounded-full bg-primary text-secondary shadow-lg transition hover:scale-105 active:scale-95"
              >
                <PlayPause playing={playing} className="h-7 w-7" />
              </button>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Canción siguiente"
                className="grid h-12 w-12 place-items-center rounded-full text-primary ring-2 ring-primary/30"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M16 5h2v14h-2zM4 5.5v13a1 1 0 0 0 1.55.83l9-6.5a1 1 0 0 0 0-1.66l-9-6.5A1 1 0 0 0 4 5.5Z" />
                </svg>
              </button>
            </div>

            {volumeOk && (
              <div className="mt-3 flex items-center justify-center gap-2 text-primary">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volumen"
                  className="h-6 w-32 accent-primary"
                />
              </div>
            )}
          </div>

          <audio
            ref={audioRef}
            preload="metadata"
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => step(1)}
            onError={() => {
              wantPlay.current = false;
              setPlaying(false);
              setFailed(true);
            }}
          />
        </>
      )}

      {/* Lista de canciones */}
      <ol className="mx-auto mt-8 flex max-w-md flex-col gap-2">
        {tracks.map((t, i) => {
          const isCurrent = !!hasPlayable && i === safeIndex;
          return (
            <li key={t.id}>
              <button
                type="button"
                disabled={!t.src}
                onClick={() => (isCurrent ? toggle() : loadTrack(i))}
                aria-current={isCurrent ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition disabled:opacity-60 ${
                  isCurrent
                    ? "bg-secondary ring-2 ring-primary"
                    : "bg-secondary/70 ring-1 ring-primary/10 hover:bg-secondary"
                }`}
              >
                {t.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.cover}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg">
                    🎵
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-primary">{t.title}</p>
                  <p className="truncate text-sm text-text/70">{t.artist}</p>
                </div>
                {!t.src ? (
                  <span className="shrink-0 text-xs font-bold text-primary/60">Pronto</span>
                ) : isCurrent && playing ? (
                  <EqBars />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}