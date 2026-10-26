import Gallery from "./Gallery";
import UploadMemory from "./UploadMemory";
import type { Memory } from "@/lib/types";
import { Camera, Film, BookImage } from "lucide-react";

export default function Recuerdos({
  memories,
  token,
}: {
  memories: Memory[];
  token?: string;
}) {
  return (
    <section
      id="recuerdos"
      className="memories-section relative isolate scroll-mt-20 overflow-hidden  from-secondary/20 via-transparent to-secondary/30 px-4 py-20 sm:px-6 md:py-28"
    >
      
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-64 w-64 -translate-x-1/2 rounded-full border border-primary/25 sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-primary"
      >
          <Camera
            className="decor-float absolute left-[8%] top-24 h-10 w-10 -rotate-45 text-accent sm:left-[14%] sm:h-14 sm:w-14"
            strokeWidth={1.3}
          />
          <Camera
            className="decor-float absolute right-[12%] top-[48%] h-9 w-9 text-primary sm:right-[8%] sm:h-12 sm:w-12"
            strokeWidth={1.4}
          />

          <BookImage
            className="decor-float absolute bottom-20 left-[9%] h-10 w-10 rotate-6 text-primary/90 sm:left-[15%] sm:h-12 sm:w-12"
            strokeWidth={1.2}
          />

          <Film
            className="decor-float absolute bottom-24 right-[10%] h-9 w-9 rotate-12 text-accent sm:right-[17%] sm:h-12 sm:w-12"
            strokeWidth={1.3}
          />

      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="mb-10 text-center md:mb-14">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="h-px w-7 bg-accent/60" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/70 sm:text-sm sm:tracking-[0.25em]">
              Instantes que viven en nosotros
            </p>
            <span className="h-px w-7 bg-accent/60" />
          </div>

          <h2 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Recuerdos
            <span className="mt-1 block font-medium italic text-accent">
              que se quedan para siempre.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-text/75 sm:text-base sm:leading-8">
            Hay momentos que merecen volver a vivirse y personas que hacen
            que cada instante sea especial. Aquí reunimos pequeños pedacitos
            de felicidad para recordarte cuánto significas.
          </p>

          {token && (
            <div className="mt-7">
              <UploadMemory token={token} />
            </div>
          )}
        </header>

        <Gallery memories={memories} />
      </div>
    </section>
  );
}
