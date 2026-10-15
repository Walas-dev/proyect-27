// components/home/songs/songRequest.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { requestSong, searchSongs } from "@/app/actions/songs";
import type { SongResult } from "@/lib/types";

const DEBOUNCE_MS = 900; // pausa sin teclear antes de buscar
const MIN_CHARS = 3;

// Cuerpos de los casetes (alternan) y color del papel de la etiqueta
const BODIES = ["bg-primary", "bg-accent", "bg-[#7a5a96]"];
const PAPER = "bg-[#fffaf3]";

function PlayPause({ playing }: { playing: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
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

// Carrete de cinta: gira mientras suena la vista previa
function Reel({ spinning }: { spinning: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-7 w-7 shrink-0 ${spinning ? "animate-spin motion-reduce:animate-none" : ""}`}
      style={spinning ? { animationDuration: "2s" } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 9.6V5M9.92 13.2l-3.98 2.3M14.08 13.2l3.98 2.3" />
    </svg>
  );
}

function CassetteIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <circle cx="16" cy="11" r="2" />
      <path d="M7 19l2-4h6l2 4" />
    </svg>
  );
}

export default function SongRequest({ token }: { token: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reqId = useRef(0);
  const cache = useRef(new Map<string, SongResult[]>());

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [rowError, setRowError] = useState<{ id: string; msg: string } | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      const key = q.toLowerCase();
      const id = ++reqId.current;

      const cached = cache.current.get(key);
      if (cached) {
        setResults(cached);
        setSearchedTerm(q);
        setSearchError("");
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const res = await searchSongs(token, q);
        if (id !== reqId.current) return;
        if (res.ok) {
          cache.current.set(key, res.results);
          setResults(res.results);
          setSearchError("");
        } else {
          setResults([]);
          setSearchError(res.error);
        }
        setSearchedTerm(q);
      } catch {
        if (id !== reqId.current) return;
        setResults([]);
        setSearchError("No pudimos buscar ahora. Inténtalo de nuevo.");
      }
      setSearching(false);
    },
    [token]
  );

  // Busca solo tras una pausa al escribir
  useEffect(() => {
    const q = query.trim();
    reqId.current++; // invalida respuestas viejas mientras se teclea
    if (q.length < MIN_CHARS) {
      setResults([]);
      setSearching(false);
      setSearchError("");
      setSearchedTerm("");
      return;
    }
    const timer = setTimeout(() => runSearch(q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  // Enter o la lupa: busca al momento
  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= MIN_CHARS) runSearch(q);
  }

  function reset() {
    audioRef.current?.pause();
    reqId.current++;
    setQuery("");
    setResults([]);
    setSearching(false);
    setSearchError("");
    setSearchedTerm("");
    setPlayingId(null);
    setSendingId(null);
    setDoneIds([]);
    setRowError(null);
  }

  const close = () => dialogRef.current?.close();

  // Abre el modal con un círculo que crece desde el botón
  function openModal(e: React.MouseEvent<HTMLButtonElement>) {
    const d = dialogRef.current;
    if (!d) return;
    const b = e.currentTarget.getBoundingClientRect();
    d.showModal();
    const r = d.getBoundingClientRect();
    d.style.setProperty("--ox", `${b.left + b.width / 2 - r.left}px`);
    d.style.setProperty("--oy", `${b.top + b.height / 2 - r.top}px`);
  }

  function togglePreview(r: SongResult) {
    const a = audioRef.current;
    if (!a || !r.previewUrl) return;
    if (playingId === r.id) {
      a.pause();
      setPlayingId(null);
      return;
    }
    a.src = r.previewUrl;
    a.play()
      .then(() => setPlayingId(r.id))
      .catch(() => setPlayingId(null));
  }

  async function pick(r: SongResult) {
    setSendingId(r.id);
    setRowError(null);
    try {
      const res = await requestSong({ token, trackId: r.id });
      if (res.ok) {
        setDoneIds((d) => [...d, r.id]);
        router.refresh();
      } else {
        setRowError({ id: r.id, msg: res.error });
      }
    } catch {
      setRowError({ id: r.id, msg: "No pudimos enviar tu solicitud." });
    }
    setSendingId(null);
  }

  const q = query.trim();
  const noResults =
    !searching &&
    !searchError &&
    searchedTerm !== "" &&
    q.length >= MIN_CHARS &&
    results.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-secondary shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      >
        🎵 Pedir una canción
      </button>

      <dialog
        ref={dialogRef}
        onClose={reset}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="reveal m-auto max-h-[92dvh] w-[min(94vw,32rem)] overflow-y-auto rounded-3xl bg-secondary p-0 text-left text-text shadow-2xl backdrop:bg-primary/75"
      >
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-primary">
              <CassetteIcon className="h-7 w-7 text-accent" />
              Pide una canción
            </h3>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="grid h-10 w-10 place-items-center rounded-full text-xl font-bold text-primary hover:bg-primary/10"
            >
              ×
            </button>
          </div>

          <form role="search" onSubmit={onSearchSubmit}>
            <label htmlFor="buscar-cancion" className="text-sm font-bold text-primary">
              Busca por canción y artista
            </label>
            <div className="relative mt-1">
              <input
                id="buscar-cancion"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={80}
                placeholder="Ej.: Color Esperanza Diego Torres"
                className="w-full rounded-xl bg-white py-3 pl-3 pr-12 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-primary hover:bg-primary/10"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-text/60">
              Escribe la canción junto al artista y pulsa Enter o la lupa.
            </p>
          </form>

          <div aria-live="polite" className="flex flex-col gap-3">
            {searching && (
              <p className="flex items-center gap-2 text-sm text-text/70">
                <span className="text-primary">
                  <Reel spinning />
                </span>
                Buscando…
              </p>
            )}
            {searchError && (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {searchError}
              </p>
            )}
            {noResults && (
              <p className="text-sm text-text/70">
                No encontramos esa canción. Prueba con otro nombre o añade el artista.
              </p>
            )}

            <ul className="flex flex-col gap-3">
              {results.map((r, i) => {
                const done = doneIds.includes(r.id);
                const playing = playingId === r.id;
                return (
                  <li key={r.id} className="rise-in" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className={`relative rounded-xl p-2 shadow-md ${BODIES[i % 3]}`}>
                      {/* Tornillos del casete */}
                      <span aria-hidden="true" className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span aria-hidden="true" className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span aria-hidden="true" className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span aria-hidden="true" className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-white/50" />

                      {/* Etiqueta */}
                      <div className={`paper-lines flex items-center gap-2 rounded-md p-2 ${PAPER}`}>
                        {r.cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.cover}
                            alt=""
                            loading="lazy"
                            className="h-11 w-11 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-11 w-11 shrink-0 rounded bg-primary/10" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-hand text-2xl leading-none text-primary">
                            {r.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-text/70">{r.artist}</p>
                        </div>
                      </div>

                      {/* Ventana de cinta + controles */}
                      <div className="mt-2 flex items-center gap-2">
                        {r.previewUrl && (
                          <button
                            type="button"
                            onClick={() => togglePreview(r)}
                            aria-label={
                              playing
                                ? `Pausar vista previa de ${r.title}`
                                : `Escuchar vista previa de ${r.title}`
                            }
                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary shadow ${PAPER}`}
                          >
                            <PlayPause playing={playing} />
                          </button>
                        )}

                        <div
                          aria-hidden="true"
                          className="flex min-w-0 flex-1 items-center rounded-full bg-black/25 px-3 py-1.5 text-[#fffaf3]"
                        >
                          <Reel spinning={playing} />
                          <span className="mx-2 h-0.5 flex-1 rounded bg-current opacity-50" />
                          <Reel spinning={playing} />
                        </div>

                        <button
                          type="button"
                          disabled={done || sendingId !== null}
                          onClick={() => pick(r)}
                          className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold text-primary shadow disabled:opacity-60 ${PAPER}`}
                        >
                          {done ? "¡Pedida ✓" : sendingId === r.id ? "…" : "Pedir"}
                        </button>
                      </div>

                      {rowError?.id === r.id && (
                        <p
                          role="alert"
                          className="mt-2 rounded bg-red-800 px-2 py-1 text-xs font-semibold text-white"
                        >
                          {rowError.msg}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-xs text-text/70">
            No te pedimos registro ni otros datos. Las canciones se agregan después de una
            revisión rápida.
          </p>
        </div>

        <audio ref={audioRef} preload="none" onEnded={() => setPlayingId(null)} />
      </dialog>
    </>
  );
}