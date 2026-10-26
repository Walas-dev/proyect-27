// src/components/sections/Gallery.tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Memory } from "@/lib/types";
import { Heart } from "lucide-react";


const TILTS = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

export default function Gallery({ memories }: { memories: Memory[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<Memory | null>(null);

  const open = (m: Memory) => {
    setCurrent(m);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  if (memories.length === 0) {
    return (
      <p className="flex justify-center text-center text-text/70 gap-3">
        Pronto aparecerán aquí los recuerdos 
        <Heart className="h-5 w-5" aria-hidden="true" />
      </p>
    );
  }

  return (
    <>
      <ul className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {memories.map((m, i) => (
          <li key={m.id} className="mb-5 break-inside-avoid">
            <button
              type="button"
              onClick={() => open(m)}
              className={`block w-full bg-white p-2 pb-3 text-left shadow-md shadow-primary/20 transition duration-300 hover:rotate-0 hover:scale-[1.03] ${TILTS[i % 4]}`}
            >
              <Image
                src={m.src}
                alt={m.caption || "Recuerdo"}
                width={m.width}
                height={m.height}
                sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                loading="lazy"
                className="h-auto w-full"
              />
              {m.caption && (
                <span className="mt-2 line-clamp-2 block font-display text-sm italic text-text">
                  {m.caption}
                </span>
              )}
              {m.author && (
                <span className="mt-2 block text-[11px] font-bold text-primary/60">
                  
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-none w-[min(92vw,34rem)] overflow-visible bg-transparent p-0 backdrop:bg-primary/75"
      >
        {current && (
          <figure className="rotate-1 bg-white p-3 pb-6 shadow-2xl">
            <Image
              src={current.src}
              alt={current.caption || "Recuerdo"}
              width={current.width}
              height={current.height}
              sizes="(min-width:640px) 34rem, 92vw"
              priority
              className="h-auto max-h-[calc(100dvh-15rem)] w-full object-contain"
            />
            {(current.caption || current.author) && (
              <figcaption className="mt-5 px-2 text-center">
                {current.caption && (
                  <span className="block font-display text-xl italic text-text">
                    {current.caption}
                  </span>
                )}
                
              </figcaption>
            )}
            <button
              type="button"
              onClick={close}
              className="mx-auto mt-4 block rounded-full px-4 py-2 text-sm font-bold text-primary ring-2 ring-primary/30"
            >
              Cerrar
            </button>
          </figure>
        )}
      </dialog>
    </>
  );
}