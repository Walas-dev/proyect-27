// src/components/admin/links/NewLinkDialog.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createLink } from "@/app/admin/_actions/links";
import Modal from "../ui/Modal";
import LinkForm from "./LinkForm";

export default function NewLinkDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-secondary shadow-md transition hover:-translate-y-0.5"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Nueva persona
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva persona">
        <LinkForm action={createLink} submitLabel="Crear enlace" />
      </Modal>
    </>
  );
}