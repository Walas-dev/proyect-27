// src/components/admin/ui/Modal.tsx
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby={titleId}
      className="reveal m-auto max-h-[92dvh] w-[min(94vw,32rem)] overflow-y-auto rounded-3xl bg-secondary p-0 text-left text-text shadow-2xl backdrop:bg-primary/75"
    >
      <div className="p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-2xl font-semibold text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-full text-primary hover:bg-primary/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Solo se monta abierto: cada vez que se abre, el formulario empieza limpio */}
        {open && children}
      </div>
    </dialog>
  );
}