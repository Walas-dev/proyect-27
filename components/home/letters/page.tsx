// src/components/sections/Cartas.tsx
import LetterBoard from "./letterBoard";
import type { Letter } from "@/lib/types";
import { Mail } from "lucide-react";
export default function Cartas({
  letters,
  token,
  defaultName,
}: {
  letters: Letter[];
  token?: string;
  defaultName?: string;
}) {
  return (
    <section id="cartas" className="relative isolate px-4 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="mural-dots pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
      />

      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary/70">
            Palabras para ti
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
            Cartas
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text/80">
            Mensajes de las personas que te quieren.
          </p>
        </header>

        {letters.length === 0 && !token ? (
          <p className="py-10 text-center text-text/70">
            Pronto aparecerán aquí las cartas 
            <Mail className="h-4 w-4" aria-hidden="true" />
          </p>
        ) : (
          <LetterBoard letters={letters} token={token} defaultName={defaultName} />
        )}
      </div>
    </section>
  );
}