// src/components/home/memory/uploadMemory.tsx
"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, ImagePlus, Loader2, X } from "lucide-react";
import { createUploads, finishUploads } from "@/app/actions/memories";
import { compressImage } from "@/lib/compress";
import { plural } from "@/lib/format";
import { runPool } from "@/lib/pool";
import { supabaseBrowser } from "@/lib/supabase/browser";

const MAX_BATCH = 10; // fotos por envío (el servidor aplica el mismo límite)

type Status = "preparing" | "ready" | "uploading" | "done" | "error";

type Item = {
  key: string;
  caption: string;
  status: Status;
  preview: string | null;
  blob: Blob | null;
  width: number;
  height: number;
  ext: "webp" | "jpg";
  error?: string;
};

export default function UploadMemory({ token }: { token: string }) {
  const router = useRouter();
  const inputId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const session = useRef(0); // cambia al cerrar: invalida trabajos que seguían en marcha
  const removed = useRef(new Set<string>());

  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [approved, setApproved] = useState(false);
  const [sent, setSent] = useState(0);

  const patch = (key: string, changes: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...changes } : i)));

  const releasePreviews = (list: Item[]) =>
    list.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));

  function reset() {
    session.current++;
    removed.current.clear();
    releasePreviews(items);
    setItems([]);
    setBusy(false);
    setNote("");
    setSent(0);
  }

  const close = () => dialogRef.current?.close();

  // Se comprime al elegir (de 2 en 2, para no agotar la memoria del teléfono)
  async function prepare(key: string, file: File, sid: number) {
    try {
      const r = await compressImage(file);
      if (sid !== session.current || removed.current.has(key)) return;
      patch(key, {
        status: "ready",
        blob: r.blob,
        width: r.width,
        height: r.height,
        ext: r.ext,
        preview: URL.createObjectURL(r.blob),
      });
    } catch {
      if (sid !== session.current || removed.current.has(key)) return;
      patch(key, { status: "error", error: "No pudimos procesar esta foto." });
    }
  }

  function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;

    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const picked = images.slice(0, Math.max(0, MAX_BATCH - items.length));

    setNote(
      images.length > picked.length
        ? `Se pueden enviar ${MAX_BATCH} fotos a la vez. Envía estas y agrega las demás después.`
        : ""
    );
    if (inputRef.current) inputRef.current.value = "";
    if (picked.length === 0) return;

    const sid = session.current;
    const fresh: Item[] = picked.map(() => ({
      key: crypto.randomUUID(),
      caption: "",
      status: "preparing",
      preview: null,
      blob: null,
      width: 0,
      height: 0,
      ext: "webp",
    }));

    setItems((prev) => [...prev, ...fresh]);
    void runPool(
      fresh.map((it, i) => ({ key: it.key, file: picked[i] })),
      2,
      ({ key, file }) => prepare(key, file, sid)
    );
  }

  function remove(item: Item) {
    removed.current.add(item.key);
    if (item.preview) URL.revokeObjectURL(item.preview);
    setItems((prev) => prev.filter((i) => i.key !== item.key));
  }

  async function send() {
    const batch = items.filter((i) => i.blob && i.status !== "done");
    if (batch.length === 0 || busy) return;

    setBusy(true);
    batch.forEach((i) => patch(i.key, { status: "uploading", error: undefined }));

    // Una sola llamada al servidor para todas las fotos
    const res = await createUploads({
      token,
      items: batch.map((i) => ({
        caption: i.caption,
        width: i.width,
        height: i.height,
        ext: i.ext,
      })),
    }).catch(() => null);

    if (!res || !res.ok) {
      const message = res && !res.ok ? res.error : "No pudimos conectar. Inténtalo de nuevo.";
      batch.forEach((i) => patch(i.key, { status: "error", error: message }));
      setBusy(false);
      return;
    }

    // Si se alcanzó el límite, el servidor acepta solo las primeras
    batch
      .slice(res.tickets.length)
      .forEach((i) => patch(i.key, { status: "error", error: "Alcanzaste el máximo de fotos." }));

    const failed: string[] = [];
    let uploaded = 0;

    await runPool(
      res.tickets.map((ticket, i) => ({ ticket, item: batch[i] })),
      3,
      async ({ ticket, item }) => {
        const blob = item.blob as Blob;
        try {
          const { error } = await supabaseBrowser()
            .storage.from("memories")
            .uploadToSignedUrl(ticket.path, ticket.uploadToken, blob, {
              contentType: blob.type,
            });
          if (error) throw error;
          uploaded++;
          patch(item.key, { status: "done" });
        } catch {
          failed.push(ticket.id);
          patch(item.key, { status: "error", error: "No se pudo subir. Toca Enviar para reintentar." });
        }
      }
    );

    // El servidor borra las filas de las fotos que no llegaron
    await finishUploads(token, failed).catch(() => undefined);

    setApproved(res.approved);
    setSent((n) => n + uploaded);
    router.refresh();
    setBusy(false);
  }

  const preparing = items.some((i) => i.status === "preparing");
  const ready = items.filter((i) => i.blob && i.status !== "done").length;
  const allDone = items.length > 0 && items.every((i) => i.status === "done");

  const one = sent === 1;
  const thanks = approved
    ? `${one ? "Tu recuerdo ya está" : `Tus ${sent} recuerdos ya están`} en la colección.`
    : `${one ? "Tu recuerdo aparecerá" : `Tus ${sent} recuerdos aparecerán`} cuando ${
        one ? "sea revisado" : "sean revisados"
      }.`;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-secondary shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      >
        <Camera className="h-5 w-5" aria-hidden="true" />
        Agregar recuerdos
      </button>

      <dialog
        ref={dialogRef}
        onClose={reset}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="pop m-auto max-h-[92dvh] w-[min(94vw,32rem)] overflow-y-auto rounded-3xl bg-secondary p-0 text-left text-text shadow-2xl backdrop:bg-primary/75"
      >
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold text-primary">
              Un recuerdo para ella
            </h3>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="grid h-10 w-10 place-items-center rounded-full text-primary hover:bg-primary/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Un solo selector de archivos, con selección múltiple */}
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            className="sr-only"
            onChange={(e) => onPick(e.target.files)}
          />

          {allDone ? (
            <div className="py-6 text-center" role="status">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <p className="font-display text-2xl font-semibold text-primary">¡Gracias!</p>
              <p className="mt-2 text-sm">{thanks}</p>
              <div className="mt-5 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full px-4 py-2 text-sm font-bold text-primary ring-2 ring-primary/30"
                >
                  Agregar más
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
            <>
              {items.length === 0 ? (
                <label
                  htmlFor={inputId}
                  className="grid cursor-pointer place-items-center gap-1 rounded-2xl border-2 border-dashed border-primary/30 bg-background/50 px-4 py-8 text-center text-sm font-semibold text-primary"
                >
                  <ImagePlus className="h-8 w-8" aria-hidden="true" />
                  Toca para elegir fotos
                  <span className="text-xs font-normal text-text/70">
                    Puedes elegir varias a la vez. La leyenda es opcional.
                  </span>
                </label>
              ) : (
                <ul className="grid grid-cols-2 gap-3">
                  {items.map((item) => {
                    const locked = item.status === "uploading" || item.status === "done";
                    return (
                      <li
                        key={item.key}
                        className="overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10"
                      >
                        <div className="relative aspect-square bg-primary/5">
                          {item.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.preview} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-primary/50">
                              {item.status === "error" ? (
                                <AlertCircle className="h-7 w-7" aria-hidden="true" />
                              ) : (
                                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                              )}
                            </div>
                          )}

                          {item.status === "uploading" && (
                            <div className="absolute inset-0 grid place-items-center bg-primary/50 text-white">
                              <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
                              <span className="sr-only">Subiendo</span>
                            </div>
                          )}
                          {item.status === "done" && (
                            <div className="absolute inset-0 grid place-items-center bg-emerald-700/60 text-white">
                              <Check className="h-8 w-8" aria-hidden="true" />
                              <span className="sr-only">Enviada</span>
                            </div>
                          )}

                          {!locked && (
                            <button
                              type="button"
                              onClick={() => remove(item)}
                              disabled={busy}
                              aria-label="Quitar foto"
                              className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white disabled:opacity-50"
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <div className="p-2">
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => patch(item.key, { caption: e.target.value })}
                            maxLength={140}
                            disabled={locked}
                            placeholder="Leyenda (opcional)"
                            aria-label="Leyenda de la foto (opcional)"
                            className="w-full rounded-lg bg-secondary px-2 py-2 text-base ring-1 ring-primary/15 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                          />
                          {item.error && (
                            <p
                              role="alert"
                              className="mt-1 flex items-start gap-1 text-xs font-semibold text-red-700"
                            >
                              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              {item.error}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {note && <p className="text-xs font-semibold text-amber-900">{note}</p>}

              {items.length > 0 && items.length < MAX_BATCH && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-primary ring-2 ring-primary/30 disabled:opacity-50"
                >
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  Agregar más fotos
                </button>
              )}

              {items.length > 0 && (
                <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-primary/10 bg-secondary/95 px-5 py-3 backdrop-blur md:-mx-6 md:-mb-6 md:px-6">
                  <button
                    type="button"
                    onClick={send}
                    disabled={busy || preparing || ready === 0}
                    className="min-h-12 w-full rounded-full bg-primary px-6 font-bold text-secondary shadow-md disabled:opacity-40"
                  >
                    {busy
                      ? "Enviando…"
                      : preparing
                        ? "Preparando fotos…"
                        : `Enviar ${ready} ${plural(ready, "foto", "fotos")}`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}