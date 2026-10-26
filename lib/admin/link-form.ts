// src/lib/admin/link-form.ts  (validación compartida por crear y editar)
import "server-only";
import { dateToExpiryISO } from "./dates";

const clean = (v: unknown, max: number) =>
  String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

export type LinkFields = {
  name: string;
  label: string | null;
  autoApprove: boolean;
  expiresAt: string | null;
};

export function parseLinkForm(formData: FormData): LinkFields | { error: string } {
  const name = clean(formData.get("name"), 40);
  if (!name) return { error: "Escribe el nombre de la persona." };

  const expiresRaw = String(formData.get("expires") ?? "");
  let expiresAt: string | null = null;
  if (expiresRaw) {
    expiresAt = dateToExpiryISO(expiresRaw);
    if (!expiresAt) return { error: "La fecha no es válida." };
  }

  return {
    name,
    label: clean(formData.get("label"), 60) || null,
    autoApprove: formData.get("auto") === "on",
    expiresAt,
  };
}