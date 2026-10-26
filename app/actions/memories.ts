// src/app/actions/memories.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLinkByToken } from "@/lib/celebration";
import { notifyAdmin } from "@/lib/notify";

const MAX_PER_LINK = 30; // fotos por enlace de invitado
const MAX_BATCH = 10; // fotos por envío
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type UploadMeta = {
  caption: string; // puede venir vacía
  width: number;
  height: number;
  ext: "webp" | "jpg";
};

export type Ticket = { id: string; path: string; uploadToken: string };

type CreateResult =
  | { ok: true; tickets: Ticket[]; approved: boolean }
  | { ok: false; error: string };

const isValid = (m: UploadMeta) =>
  Number.isInteger(m.width) &&
  m.width > 0 &&
  m.width <= 4000 &&
  Number.isInteger(m.height) &&
  m.height > 0 &&
  m.height <= 4000 &&
  (m.ext === "webp" || m.ext === "jpg");

// Un solo viaje para todo el grupo: valida, reserva permisos de subida e inserta las filas
export async function createUploads(input: {
  token: string;
  items: UploadMeta[];
}): Promise<CreateResult> {
  const items = Array.isArray(input.items) ? input.items.slice(0, MAX_BATCH) : [];
  if (items.length === 0 || !items.every(isValid)) {
    return { ok: false, error: "Las fotos no son válidas." };
  }

  const link = await getLinkByToken(String(input.token ?? ""));
  if (!link) return { ok: false, error: "Este enlace ya no está activo." };

  const db = supabaseAdmin();

  // Si el enlace está cerca del límite, se aceptan solo las primeras que caben
  let allowed = items.length;
  if (!link.auto_approve) {
    const { count } = await db
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("contribution_link_id", link.id);
    allowed = Math.min(items.length, MAX_PER_LINK - (count ?? 0));
    if (allowed <= 0) return { ok: false, error: "Ya alcanzaste el máximo de fotos. ¡Gracias!" };
  }

  const prepared = items.slice(0, allowed).map((meta) => {
    const id = crypto.randomUUID();
    return { meta, id, path: `${link.celebration_id}/${id}.${meta.ext}` };
  });

  const signed = await Promise.all(
    prepared.map((p) => db.storage.from("memories").createSignedUploadUrl(p.path))
  );
  if (signed.some((s) => s.error || !s.data)) {
    return { ok: false, error: "No pudimos preparar la subida." };
  }

  const approved = link.auto_approve === true;
  const { error } = await db.from("memories").insert(
    prepared.map((p) => ({
      id: p.id,
      celebration_id: link.celebration_id,
      contribution_link_id: link.id,
      image_path: p.path,
      width: p.meta.width,
      height: p.meta.height,
      caption: String(p.meta.caption ?? "").trim().slice(0, 140) || null,
      author_name: link.assigned_name,
      status: approved ? "approved" : "pending",
    }))
  );
  if (error) return { ok: false, error: "No pudimos guardar tus fotos." };

  await db
    .from("contribution_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", link.id);

  if (!approved) {
    const n = prepared.length;
    notifyAdmin({
      title: `${n} ${n === 1 ? "recuerdo nuevo" : "recuerdos nuevos"} de ${link.assigned_name ?? "un invitado"}`,
      path: "/admin/recuerdos?estado=pending",
    });
  }

  return {
    ok: true,
    approved,
    tickets: prepared.map((p, i) => ({
      id: p.id,
      path: p.path,
      uploadToken: signed[i].data!.token,
    })),
  };
}

// Se llama al terminar: borra las filas de las fotos que no llegaron a subirse
export async function finishUploads(token: string, failedIds: string[]) {
  const link = await getLinkByToken(String(token ?? ""));
  if (!link) return;

  const ids = (Array.isArray(failedIds) ? failedIds : []).filter((id) => UUID.test(id));
  if (ids.length > 0) {
    // Solo filas de este enlace
    await supabaseAdmin()
      .from("memories")
      .delete()
      .in("id", ids)
      .eq("contribution_link_id", link.id);
  }

  if (link.auto_approve) revalidatePath("/[slug]", "page");
}