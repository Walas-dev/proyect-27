// src/lib/admin/dates.ts
import "server-only";
import { utcOffsetMs } from "@/lib/time";

// "2026-12-27" → el final de ese día en tu zona horaria, como ISO
export function dateToExpiryISO(date: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return null;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59) - utcOffsetMs();
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

// Operación inversa, para rellenar el campo <input type="date">
export function expiryToDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + utcOffsetMs()).toISOString().slice(0, 10);
}