// src/lib/format.ts  (reemplaza)
import { utcOffsetMs } from "@/lib/time";

// Se muestra en tu zona horaria (ADMIN_UTC_OFFSET) y no en la del servidor
export const fmtDate = (iso: string | null) =>
  iso
    ? new Date(new Date(iso).getTime() + utcOffsetMs()).toLocaleString("es", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      })
    : "—";

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);