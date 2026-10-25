// src/lib/admin/queries/celebration.ts  (reemplaza)
import "server-only";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { memoTtl } from "@/lib/admin/memo";

export type AdminCelebration = {
  id: string;
  slug: string | null;
  recipient_name: string | null;
  celebration_date: string | null;
};

// La celebración casi nunca cambia: se recuerda 5 minutos en memoria.
// Si editas su nombre o fecha en la base de datos, el panel lo verá en ese plazo.
export const getAdminCelebration = memoTtl(async () => {
  const { data } = await supabaseAdmin()
    .from("celebrations")
    .select("id, slug, recipient_name, celebration_date")
    .limit(1)
    .maybeSingle();
  return (data as AdminCelebration | null) ?? null;
}, 5 * 60_000);

// Cada página la llama: los layouts no se vuelven a ejecutar al navegar en el cliente
export async function requireCelebration() {
  await requireAdmin();
  const celebration = await getAdminCelebration();
  if (!celebration) notFound();
  return celebration;
}