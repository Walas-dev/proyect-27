// src/app/actions/memories.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLinkByToken } from "@/lib/celebration";

const MAX_PER_LINK = 10;

type Input = {
  token: string;
  caption: string;
  width: number;
  height: number;
  ext: "webp" | "jpg";
};

type Result =
  | { ok: true; path: string; uploadToken: string; approved: boolean }
  | { ok: false; error: string };

export async function createUpload(input: Input): Promise<Result> {
  const caption = input.caption.trim().slice(0, 140);
  if (!caption) return { ok: false, error: "Escribe una leyenda para tu foto." };

  const dims = [input.width, input.height];
  if (!dims.every((n) => Number.isInteger(n) && n > 0 && n <= 4000))
    return { ok: false, error: "La imagen no es válida." };
  if (input.ext !== "webp" && input.ext !== "jpg")
    return { ok: false, error: "Formato no permitido." };

  const link = await getLinkByToken(input.token);
  if (!link) return { ok: false, error: "Este enlace ya no está activo." };

  const db = supabaseAdmin();

  if (!link.auto_approve) {
    const { count } = await db
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("contribution_link_id", link.id);
    if ((count ?? 0) >= MAX_PER_LINK)
      return { ok: false, error: "Ya alcanzaste el máximo de fotos. ¡Gracias!" };
  }

  const id = crypto.randomUUID();
  const path = `${link.celebration_id}/${id}.${input.ext}`;

  const { data: signed, error: signErr } = await db.storage
    .from("memories")
    .createSignedUploadUrl(path);
  if (signErr || !signed) return { ok: false, error: "No pudimos preparar la subida." };

  const approved = link.auto_approve === true;
  const { error: insErr } = await db.from("memories").insert({
    id,
    celebration_id: link.celebration_id,
    contribution_link_id: link.id,
    image_path: path,
    width: input.width,
    height: input.height,
    caption,
    author_name: link.assigned_name,
    status: approved ? "approved" : "pending",
  });
  if (insErr) return { ok: false, error: "No pudimos guardar tu recuerdo." };

  await db
    .from("contribution_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", link.id);

    return { ok: true, path, uploadToken: signed.token, approved };
}

export async function finishUpload() {
  revalidatePath("/[slug]", "page");
}