// src/lib/admin/invite.ts
import "server-only";
import { headers } from "next/headers";

export async function inviteUrl(token: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/i/${token}`;
}