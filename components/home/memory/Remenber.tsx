// src/components/sections/Recuerdos.tsx
import Gallery from "./Gallery";
import UploadMemory from "./UploadMemory";
import type { Memory } from "@/lib/types";

export default function Recuerdos({
  memories,
  token,
}: {
  memories: Memory[];
  token?: string;
}) {
  return (
    <section id="recuerdos" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary/70">
            Nuestra colección
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-primary md:text-5xl">
            Recuerdos
          </h2>
          <p className="mx-auto mt-3 max-w-md text-text/80">
            Momentos guardados por quienes te quieren.
          </p>
          {token && (
            <div className="mt-6">
              <UploadMemory token={token} />
            </div>
          )}
        </header>
        <Gallery memories={memories} />
      </div>
    </section>
  );
}