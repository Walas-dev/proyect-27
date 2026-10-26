// src/app/admin/_actions/links.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { UUID_RE } from "@/lib/admin/constants";
import { encryptToken } from "@/lib/admin/crypto";
import { inviteUrl } from "@/lib/admin/invite";
import { parseLinkForm } from "@/lib/admin/link-form";
import { getAdminCelebration } from "@/lib/admin/queries/celebration";
import { hashToken, newToken } from "@/lib/token";

export type LinkFormState =
  | { error: string }
  | { ok: true; url?: string; name?: string }
  | undefined;

const refresh = () => revalidatePath("/admin", "layout");

export async function createLink(
  _prev: LinkFormState,
  formData: FormData
): Promise<LinkFormState> {
  await requireAdmin();

  const fields = parseLinkForm(formData);
  if ("error" in fields) return fields;

  const celebration = await getAdminCelebration();
  if (!celebration) return { error: "No hay ninguna celebración creada." };

  const token = newToken();
  const { error } = await supabaseAdmin().from("contribution_links").insert({
    celebration_id: celebration.id,
    token_hash: hashToken(token),
    token_enc: encryptToken(token),
    assigned_name: fields.name,
    label: fields.label,
    auto_approve: fields.autoApprove,
    expires_at: fields.expiresAt,
  });
  if (error) return { error: "No pudimos crear el enlace." };

  refresh();
  return { ok: true, url: await inviteUrl(token), name: fields.name };
}

export async function updateLink(
  _prev: LinkFormState,
  formData: FormData
): Promise<LinkFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Enlace no válido." };

  const fields = parseLinkForm(formData);
  if ("error" in fields) return fields;

  const { error } = await supabaseAdmin()
    .from("contribution_links")
    .update({
      assigned_name: fields.name,
      label: fields.label,
      auto_approve: fields.autoApprove,
      expires_at: fields.expiresAt,
    })
    .eq("id", id);
  if (error) return { error: "No pudimos guardar los cambios." };

  refresh();
  return { ok: true };
}

// Revoca o reactiva: quitar la revocación devuelve el enlace a la vida
export async function setLinkRevoked(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return;
  const revoke = formData.get("revoke") === "1";

  await supabaseAdmin()
    .from("contribution_links")
    .update({ revoked_at: revoke ? new Date().toISOString() : null })
    .eq("id", id);

  refresh();
}