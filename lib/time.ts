// src/lib/time.ts
export const utcOffsetMs = () => (Number(process.env.ADMIN_UTC_OFFSET) || 0) * 3_600_000;