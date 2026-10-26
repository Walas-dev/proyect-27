// src/app/admin/(panel)/layout.tsx
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCelebration } from "@/lib/admin/queries/celebration";
import { getContentStats, toPending } from "@/lib/admin/stats";
import AdminShell from "@/components/admin/shell/AdminShell";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const celebration = await getAdminCelebration();
  if (!celebration) {
    return <p className="p-8">No hay ninguna celebración creada todavía.</p>;
  }

  // Solo 3 números para el menú: nada de cargar contenido aquí
  const pending = toPending(await getContentStats(celebration.id));

  return (
    <AdminShell celebration={celebration} pending={pending}>
      {children}
    </AdminShell>
  );
}