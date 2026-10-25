// src/app/admin/_actions/link-access.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { UUID_RE } from "@/lib/admin/constants";
import { decryptToken, encryptToken } from "@/lib/admin/crypto";
import { inviteUrl } from "@/lib/admin/invite";
import { hashToken, newToken } from "@/lib/token";

export type AccessResult = { url: string } | { error: string };

export async function revealLink(id: string): Promise<AccessResult> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { error: "Enlace no válido." };

  const { data } = await supabaseAdmin()
    .from("contribution_links")
    .select("token_enc")
    .eq("id", id)
    .maybeSingle();

  const token = data?.token_enc ? decryptToken(data.token_enc) : null;
  if (!token) return { error: "Este enlace no se puede recuperar. Regenera uno nuevo." };

  return { url: await inviteUrl(token) };
}

// El enlace anterior deja de funcionar al instante
export async function regenerateLink(id: string): Promise<AccessResult> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { error: "Enlace no válido." };

  const token = newToken();
  const { error } = await supabaseAdmin()
    .from("contribution_links")
    .update({ token_hash: hashToken(token), token_enc: encryptToken(token) })
    .eq("id", id);
  if (error) return { error: "No pudimos regenerar el enlace." };

  revalidatePath("/admin", "layout");
  return { url: await inviteUrl(token) };
}