// src/app/admin/actions.ts
"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/admin/auth";
import { getAdminCelebration } from "@/lib/admin/data";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (v: unknown, max: number) =>
  String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

/* ---------- Sesión ---------- */

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // frena los intentos repetidos
    return { error: "Contraseña incorrecta." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Moderación ---------- */

const TABLES = ["memories", "letters", "songs"] as const;
type Table = (typeof TABLES)[number];
const isTable = (v: string): v is Table => (TABLES as readonly string[]).includes(v);
const STATUSES = ["pending", "approved", "rejected"];

export async function setStatus(formData: FormData) {
  await requireAdmin();

  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isTable(table) || !UUID.test(id) || !STATUSES.includes(status)) return;

  const patch: Record<string, string> = { status };
  if (table !== "songs") patch.updated_at = new Date().toISOString();

  await supabaseAdmin().from(table).update(patch).eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/[slug]", "page");
}

/* ---------- Enlaces ---------- */

export type CreateLinkState =
  | { error: string }
  | { url: string; name: string }
  | undefined;

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createLink(
  _prev: CreateLinkState,
  formData: FormData
): Promise<CreateLinkState> {
  await requireAdmin();

  const name = clean(formData.get("name"), 40);
  const label = clean(formData.get("label"), 60);
  const autoApprove = formData.get("auto") === "on";
  const expiresRaw = String(formData.get("expires") ?? "");

  if (!name) return { error: "Escribe el nombre de la persona." };

  let expiresAt: string | null = null;
  if (expiresRaw) {
    const d = new Date(`${expiresRaw}T23:59:59`);
    if (Number.isNaN(d.getTime())) return { error: "La fecha no es válida." };
    expiresAt = d.toISOString();
  }

  const celebration = await getAdminCelebration();
  if (!celebration) return { error: "No hay ninguna celebración creada." };

  // En la base solo se guarda el hash: el token se muestra una única vez
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { error } = await supabaseAdmin().from("contribution_links").insert({
    celebration_id: celebration.id,
    token_hash: tokenHash,
    label: label || null,
    assigned_name: name,
    auto_approve: autoApprove,
    expires_at: expiresAt,
  });
  if (error) return { error: "No pudimos crear el enlace." };

  revalidatePath("/admin");
  return { url: `${await getOrigin()}/i/${token}`, name };
}

export async function revokeLink(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;

  await supabaseAdmin()
    .from("contribution_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
}