// src/components/sections/LetterBoard.tsx
"use client";

import { useRef, useState } from "react";
import LetterComposer from "./letterComposer";
import LetterIcon from "./letterIcon";
import NoteCard from "./noteCard";
import { colorById } from "@/lib/letter-style";
import type { Letter } from "@/lib/types";

const TILTS = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-2", "rotate-2"];

// Número estable a partir del id: cada nota conserva su inclinación
const seed = (id: string) =>
  [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Hoja en blanco con renglones: misma forma que las cartas
function AddNoteCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative h-full -rotate-1 drop-shadow-md transition duration-300 hover:-translate-y-1 hover:rotate-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-primary">
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-1/2 z-10 h-4 w-14 -translate-x-1/2 rotate-2 bg-accent/60 sm:h-5 sm:w-20"
      />
      <button
        type="button"
        onClick={onClick}
        className="note paper-lines group relative flex h-full min-h-44 w-full flex-col items-center justify-center gap-2 bg-white p-3 text-center text-primary sm:p-5"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-secondary transition-transform duration-300 group-hover:rotate-90">
          <PlusIcon className="h-6 w-6" />
        </span>
        <span className="font-display text-base font-semibold leading-snug sm:text-xl">
          Añadir una carta
        </span>
        <span className="font-hand text-lg leading-none text-primary/70 sm:text-2xl">
          ¡Escribe la tuya!
        </span>
      </button>
    </div>
  );
}

export default function LetterBoard({
  letters,
  token,
  defaultName,
}: {
  letters: Letter[];
  token?: string;
  defaultName?: string;
}) {
  const readRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<Letter | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const open = (l: Letter) => {
    setCurrent(l);
    readRef.current?.showModal();
  };
  const close = () => readRef.current?.close();

  const c = current ? colorById(current.color) : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3">
        {token && (
          <li className="h-full">
            <AddNoteCard onClick={() => setComposeOpen(true)} />
          </li>
        )}

        {letters.map((l) => (
          <li key={l.id} className="h-full">
            <NoteCard
              note={l}
              tilt={TILTS[seed(l.id) % 5]}
              onOpen={() => open(l)}
            />
          </li>
        ))}
      </ul>

      {/* Botón de abajo: solo si ya hay cartas, para no repetirlo con el tablón vacío */}
      {token && letters.length > 0 && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-primary py-2 pl-2 pr-6 font-bold text-secondary shadow-lg shadow-primary/25 outline-2 outline-offset-4 outline-dashed outline-primary/40 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-primary active:translate-y-0"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary transition-transform duration-300 group-hover:rotate-90">
              <PlusIcon className="h-5 w-5" />
            </span>
            Añadir una carta
          </button>
        </div>
      )}

      {/* Una sola ventana de escritura para la tarjeta y el botón */}
      {token && (
        <LetterComposer
          token={token}
          defaultName={defaultName}
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
        />
      )}

      {/* Carta ampliada */}
      <dialog
        ref={readRef}
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="pop m-auto max-h-[90dvh] w-[min(92vw,34rem)] overflow-auto bg-transparent p-0 backdrop:bg-primary/75"
      >
        {current && c && (
          <article
            className="relative rounded-3xl p-6 pt-8 shadow-2xl md:p-8"
            style={{ backgroundColor: c.bg, color: c.ink }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar carta"
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-xl font-bold"
              style={{
                backgroundColor: c.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
              }}
            >
              ×
            </button>

            <span
              className="grid h-14 w-14 place-items-center rounded-full"
              style={{
                backgroundColor: c.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)",
              }}
            >
              <LetterIcon name={current.icon} className="h-8 w-8" />
            </span>

            {current.title && (
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight">
                {current.title}
              </h3>
            )}

            <p className="mt-4 whitespace-pre-line break-words text-lg leading-relaxed">
              {current.message}
            </p>

            <p className="mt-6 text-right font-hand text-3xl">
              {current.author ? `— ${current.author}` : "Con cariño"}
            </p>
          </article>
        )}
      </dialog>
    </>
  );
}