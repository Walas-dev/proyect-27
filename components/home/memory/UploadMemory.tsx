// src/components/sections/UploadMemory.tsx
"use client";


import { useRouter } from "next/navigation";
import { createUpload, finishUpload } from "@/app/actions/memories";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { compressImage } from "@/lib/compress";
import { Camera } from "lucide-react";


export default function UploadMemory({ token }: { token: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCaption("");
    setState("idle");
    setError("");
  }

  function close() {
    dialogRef.current?.close();
    reset();
  }

  function onPick(f?: File) {
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setState("sending");
    setError("");
    try {
      const { blob, width, height, ext } = await compressImage(file);
      const res = await createUpload({ token, caption, width, height, ext });
      if (!res.ok) throw new Error(res.error);

      const { error: upErr } = await supabaseBrowser()
        .storage.from("memories")
        .uploadToSignedUrl(res.path, res.uploadToken, blob, {
          contentType: blob.type,
        });
      if (upErr) throw upErr;

      await finishUpload();
        router.refresh(); // vuelve a pedir los recuerdos al servidor

        setApproved(res.approved);
        setState("done");
        
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos subir tu foto. Inténtalo de nuevo."
      );
      setState("idle");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-secondary shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      >
        <Camera className="h-5 w-5" aria-hidden="true" />
         Agregar un recuerdo
      </button>

      <dialog
        ref={dialogRef}
        onClose={reset}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(92vw,26rem)] rounded-3xl bg-secondary p-0 text-left text-text shadow-2xl backdrop:bg-primary/70"
      >
        <div className="p-5">
          {state === "done" ? (
            <div className="py-6 text-center">
              <p className="font-display text-2xl font-semibold text-primary">
                ¡Gracias! 💜
              </p>
              <p className="mt-2 text-sm">
                {approved
                  ? "Tu recuerdo ya está en la colección."
                  : "Tu recuerdo aparecerá cuando sea revisado."}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <button type="button" onClick={reset} className="rounded-full px-4 py-2 text-sm font-bold text-primary ring-2 ring-primary/30">
                  Subir otro
                </button>
                <button type="button" onClick={close} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h3 className="font-display text-2xl font-semibold text-primary">
                Un recuerdo para ella
              </h3>

              <label className="grid min-h-44 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-background/50 text-center text-sm font-semibold text-primary">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Vista previa" className="max-h-64 w-full object-contain" />
                ) : (
                  <span className="px-4">Toca para elegir una foto</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
              </label>

              <div>
                <label htmlFor="caption" className="text-sm font-bold text-primary">
                  Leyenda
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={140}
                  rows={3}
                  placeholder="Ese día nos reímos tanto que…"
                  className="mt-1 w-full resize-none rounded-xl bg-white p-3 text-base ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-right text-xs text-text/60">{caption.length}/140</p>
              </div>

              {error && (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={close} className="rounded-full px-4 py-2 text-sm font-bold text-primary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!file || !caption.trim() || state === "sending"}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-secondary disabled:opacity-40"
                >
                  {state === "sending" ? "Subiendo…" : "Enviar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}