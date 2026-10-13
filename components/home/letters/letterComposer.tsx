// src/components/sections/LetterComposer.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLetter } from "@/app/actions/letters";
import { ICON_LABELS, LETTER_COLORS, LETTER_ICONS } from "@/lib/letter-style";
import LetterIcon from "./letterIcon";
import NoteCard from "./noteCard";

export default function LetterComposer({
 token,
  defaultName,
  open,
  onClose,
}: {
   token: string;
  defaultName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState(defaultName ?? "");
  const [color, setColor] = useState<string>("lila");
  const [icon, setIcon] = useState<string>("corazon");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setMessage("");
    setSignature(defaultName ?? "");
    setColor("lila");
    setIcon("corazon");
    setState("idle");
    setError("");
  }

  const close = () => onClose();
    // El padre manda: abre o cierra el <dialog> según `open`
    useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await createLetter({ token, title, message, signature, color, icon });
      if (!res.ok) {
        setError(res.error);
        setState("idle");
        return;
      }
      setApproved(res.approved);
      setState("done");
      router.refresh();
    } catch {
      setError("No pudimos enviar tu carta. Inténtalo de nuevo.");
      setState("idle");
    }
  }

  return (
    <dialog
    ref={dialogRef}
    onClose={() => {
      reset();
      onClose();
    }}
    onClick={(e) => e.target === e.currentTarget && close()}
    className="pop m-auto max-h-[92dvh] w-[min(94vw,32rem)] overflow-y-auto rounded-3xl bg-secondary p-0 text-left text-text shadow-2xl backdrop:bg-primary/75"
    >
    <div className="p-5 md:p-6">
        {state === "done" ? (
        <div className="py-8 text-center" role="status">
            <p className="font-display text-3xl font-semibold text-primary">
            ¡Gracias! 💜
            </p>
            <p className="mt-2 text-sm">
            {approved
                ? "Tu carta ya está en el tablón."
                : "Tu carta aparecerá en el tablón cuando sea revisada."}
            </p>
            <div className="mt-6 flex justify-center gap-2">
            <button
                type="button"
                onClick={reset}
                className="rounded-full px-4 py-2 text-sm font-bold text-primary ring-2 ring-primary/30"
            >
                Escribir otra
            </button>
            <button
                type="button"
                onClick={close}
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-secondary"
            >
                Cerrar
            </button>
            </div>
        </div>
        ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold text-primary">
                Escribe tu carta
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

            {/* Vista previa en vivo */}
            <div className="mx-auto w-full max-w-[17rem] pt-2">
            <NoteCard
                note={{
                title: title.trim() || null,
                message: message.trim() || "Aquí verás cómo queda tu carta…",
                author: signature.trim() || null,
                color,
                icon,
                }}
                tilt="-rotate-1"
            />
            </div>

            <fieldset>
            <legend className="text-sm font-bold text-primary">Color de la carta</legend>
            <div className="mt-2 flex flex-wrap gap-3">
                {LETTER_COLORS.map((c) => (
                <label key={c.id} className="relative cursor-pointer">
                    <input
                    type="radio"
                    name="color"
                    value={c.id}
                    checked={color === c.id}
                    onChange={() => setColor(c.id)}
                    className="peer sr-only"
                    />
                    <span
                    className="block h-11 w-11 rounded-full ring-1 ring-black/15 transition peer-checked:scale-110 peer-checked:ring-4 peer-checked:ring-primary/70 peer-focus-visible:ring-4 peer-focus-visible:ring-primary"
                    style={{ backgroundColor: c.bg }}
                    />
                    <span className="sr-only">{c.label}</span>
                </label>
                ))}
            </div>
            </fieldset>

            <fieldset>
            <legend className="text-sm font-bold text-primary">Figura</legend>
            <div className="mt-2 flex flex-wrap gap-3">
                {LETTER_ICONS.map((id) => (
                <label key={id} className="relative cursor-pointer">
                    <input
                    type="radio"
                    name="icono"
                    value={id}
                    checked={icon === id}
                    onChange={() => setIcon(id)}
                    className="peer sr-only"
                    />
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-primary ring-1 ring-primary/20 transition peer-checked:bg-primary peer-checked:text-secondary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/60">
                    <LetterIcon name={id} className="h-6 w-6" />
                    </span>
                    <span className="sr-only">{ICON_LABELS[id]}</span>
                </label>
                ))}
            </div>
            </fieldset>

            <div>
            <label htmlFor="titulo" className="text-sm font-bold text-primary">
                Título <span className="font-normal text-text/60">(opcional)</span>
            </label>
            <input
                id="titulo"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                autoComplete="off"
                placeholder="Para la persona más especial"
                className="mt-1 w-full rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>

            <div>
            <label htmlFor="mensaje" className="text-sm font-bold text-primary">
                Tu mensaje
            </label>
            <textarea
                id="mensaje"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={400}
                rows={5}
                placeholder="Lo que más me gusta de ti es…"
                className="mt-1 w-full resize-none rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-right text-xs text-text/60">{message.length}/400</p>
            </div>

            <div>
            <label htmlFor="firma" className="text-sm font-bold text-primary">
                Firma <span className="font-normal text-text/60">(opcional)</span>
            </label>
            <input
                id="firma"
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                maxLength={40}
                autoComplete="off"
                placeholder="Cómo quieres firmar"
                className="mt-1 w-full rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>

            <p className="text-xs text-text/70">
            No te pedimos registro ni otros datos. Tu carta aparecerá en el tablón
            después de una revisión rápida.
            </p>

            {error && (
            <p role="alert" className="text-sm font-semibold text-red-700">
                {error}
            </p>
            )}

            <button
            type="submit"
            disabled={!message.trim() || state === "sending"}
            className="min-h-12 rounded-full bg-primary px-6 font-bold text-secondary shadow-md transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            >
            {state === "sending" ? "Enviando…" : "Enviar carta"}
            </button>
        </form>
        )}
    </div>
    </dialog>
  );
}