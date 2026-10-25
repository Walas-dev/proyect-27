// src/components/admin/shell/AdminBrand.tsx
import { PartyPopper } from "lucide-react";

export default function AdminBrand({ name }: { name: string | null }) {
  return (
    <div className="flex items-center gap-2 text-primary">
      <PartyPopper className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
      <p className="font-display text-xl font-semibold leading-tight">
        Panel de {name ?? "la celebración"}
      </p>
    </div>
  );
}