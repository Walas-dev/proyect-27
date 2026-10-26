// src/app/actions/letters.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getLinkByToken } from "@/lib/celebration";
import { LETTER_COLORS, LETTER_ICONS } from "@/lib/letter-style";
import { notifyAdmin } from "@/lib/notify";

const MAX_PER_LINK = 5;
const COLOR_IDS: string[] = LETTER_COLORS.map((c) => c.id);
const ICON_IDS: string[] = [...LETTER_ICONS];

type Input = {
  token: string;
  title: string;
  message: string;
  signature: string;
  color: string;
  icon: string;
};

type Result = { ok: true; approved: boolean } | { ok: false; error: string };

export async function createLetter(input: Input): Promise<Result> {
  const message = String(input.message ?? "").trim().slice(0, 400);
  const title = String(input.title ?? "").trim().slice(0, 50);
  const signature = String(input.signature ?? "").trim().slice(0, 40);
  const color = COLOR_IDS.includes(input.color) ? input.color : "lila";
  const icon = ICON_IDS.includes(input.icon) ? input.icon : "corazon";

  if (!message) return { ok: false, error: "Escribe tu mensaje." };

  const link = await getLinkByToken(String(input.token ?? ""));
  if (!link) return { ok: false, error: "Este enlace ya no está activo." };

  const db = supabaseAdmin();

  if (!link.auto_approve) {
    const { count } = await db
      .from("letters")
      .select("id", { count: "exact", head: true })
      .eq("contribution_link_id", link.id);
    if ((count ?? 0) >= MAX_PER_LINK)
      return { ok: false, error: "Ya alcanzaste el máximo de cartas. ¡Gracias!" };
  }

  const approved = link.auto_approve === true;
  const { error } = await db.from("letters").insert({
    celebration_id: link.celebration_id,
    contribution_link_id: link.id,
    title: title || null,
    message,
    color,
    icon,
    author_name: signature || link.assigned_name || null,
    status: approved ? "approved" : "pending",
  });
  if (error) return { ok: false, error: "No pudimos guardar tu carta." };

  await db
    .from("contribution_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", link.id);

    if (!approved) {
      notifyAdmin({
        title: `Nueva carta de ${link.assigned_name ?? "un invitado"}`,
        detail: title || message.slice(0, 120),
        path: "/admin/cartas?estado=pending",
      });
    }
  if (approved) revalidatePath("/[slug]", "page");
  return { ok: true, approved };
}