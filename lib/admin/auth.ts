// src/lib/admin-auth.ts
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET debe tener al menos 32 caracteres");
  return s;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("hex");

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export function checkPassword(input: string) {
  const real = process.env.ADMIN_PASSWORD ?? "";
  if (!real) return false;
  // Se comparan hashes para que ambos midan lo mismo
  const h = (v: string) => createHmac("sha256", "pw").update(v).digest();
  return timingSafeEqual(h(input), h(real));
}

export async function createSession() {
  const payload = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [payload, sig] = v.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  return Number(payload) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}