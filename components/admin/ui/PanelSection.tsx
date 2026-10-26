// src/components/admin/ui/PanelSection.tsx
import type { ReactNode } from "react";

export default function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl font-semibold text-primary">{title}</h2>
      {children}
    </section>
  );
}