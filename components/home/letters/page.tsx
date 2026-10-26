
import { Heart, Mail, MailOpen, Sparkles } from "lucide-react";
import LetterBoard from "./letterBoard";
import type { Letter } from "@/lib/types";

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
    <section
      id="cartas"
      className="relative isolate scroll-mt-20 overflow-hidden px-4 py-20 sm:px-6 md:py-28"
    >
      
      <div
        aria-hidden="true"
        className="mural-dots pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-primary"
      >
        <Mail
          className="letter-float absolute left-[8%] top-24 h-10 w-10 -rotate-12 text-text/50 sm:left-[13%] sm:h-14 sm:w-14"
          strokeWidth={1.3}
        />

        <Heart
          className="letter-drift absolute right-[10%] top-36 h-8 w-8 rotate-12 text-primary/90 sm:right-[15%] sm:h-11 sm:w-11"
          strokeWidth={1.4}
        />

        <Sparkles
          className="letter-twinkle absolute right-[18%] top-[48%] h-8 w-8 text-text/50 sm:right-[9%] sm:h-10 sm:w-10"
          strokeWidth={1.3}
        />

        <MailOpen
          className="letter-drift absolute bottom-20 left-[10%] h-10 w-10 rotate-6 text-primary/60 sm:left-[16%] sm:h-12 sm:w-12"
          strokeWidth={1.2}
        />

        <Heart
          className="letter-float absolute bottom-24 right-[9%] h-9 w-9 -rotate-12 text-accent/80 sm:right-[16%] sm:h-12 sm:w-12"
          strokeWidth={1.3}
        />

        <Sparkles
          className="letter-twinkle absolute left-[46%] top-12 h-6 w-6 text-accent/80"
          strokeWidth={1.3}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="mb-12 text-center md:mb-14">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="h-px w-7 bg-accent/60" />

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/70 sm:text-sm sm:tracking-[0.25em]">
              Palabras que nacen del corazón
            </p>

            <span className="h-px w-7 bg-accent/60" />
          </div>

          <h2 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Cartas
            <span className="mt-1 block font-medium italic text-accent">
              para guardar en el alma.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-text/75 sm:text-base sm:leading-8">
            A veces, las palabras expresan lo que un abrazo no alcanza a decir.
            Aquí encontrarás mensajes escritos especialmente para ti,
            recuerdos compartidos y todo ese cariño que merece quedarse
            contigo.
          </p>
        </header>

        {letters.length === 0 && !token ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-primary/10 bg-white/50 px-6 py-10 text-center shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-primary">
              <MailOpen
                className="h-7 w-7"
                strokeWidth={1.4}
                aria-hidden="true"
              />
            </div>

            <p className="font-display text-xl font-semibold text-primary sm:text-2xl">
              Un espacio para palabras especiales
            </p>

            <p className="mt-2 text-sm leading-6 text-text/70">
              Las cartas aparecerán aquí cuando estén listas. Cada mensaje
              será una pequeña muestra del cariño que te tienen.
            </p>
          </div>
        ) : (
          <LetterBoard
            letters={letters}
            token={token}
            defaultName={defaultName}
          />
        )}
      </div>
    </section>
  );
}
