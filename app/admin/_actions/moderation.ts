// src/app/admin/_actions/moderation.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { STATUSES, UUID_RE } from "@/lib/admin/constants";

const TABLES = ["memories", "letters", "songs"] as const;
type Table = (typeof TABLES)[number];

const isTable = (v: string): v is Table => (TABLES as readonly string[]).includes(v);

export async function setStatus(formData: FormData) {
  await requireAdmin();

  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isTable(table) || !UUID_RE.test(id) || !(STATUSES as readonly string[]).includes(status)) {
    return;
  }

  const patch: Record<string, string> = { status };
  if (table !== "songs") patch.updated_at = new Date().toISOString();

  await supabaseAdmin().from(table).update(patch).eq("id", id);

  revalidatePath("/admin", "layout"); // refresca también los contadores del menú
  revalidatePath("/[slug]", "page");
}