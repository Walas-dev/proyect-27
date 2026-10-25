// src/components/admin/shell/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, LayoutDashboard, Link2, Mail, Music, type LucideIcon } from "lucide-react";
import type { ContentKind } from "@/lib/admin/types";
import { usePending } from "../live/PendingProvider";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  kind?: ContentKind;
  exact?: boolean;
};

// Los iconos viven aquí porque no se pueden pasar funciones de servidor a cliente
const ITEMS: Item[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/recuerdos", label: "Recuerdos", icon: Images, kind: "memories" },
  { href: "/admin/cartas", label: "Cartas", icon: Mail, kind: "letters" },
  { href: "/admin/canciones", label: "Canciones", icon: Music, kind: "songs" },
  { href: "/admin/enlaces", label: "Enlaces", icon: Link2 },
];

function CountBadge({ n, className = "" }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span
      className={`grid min-w-5 place-items-center rounded-full bg-amber-300 px-1.5 text-[11px] font-bold leading-5 text-amber-950 ${className}`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

export default function AdminNav({
  variant,
}: {
  variant: "sidebar" | "tabbar";
}) {
  const pathname = usePathname();
  const { live } = usePending();

  const isActive = (i: Item) => (i.exact ? pathname === i.href : pathname.startsWith(i.href));

  if (variant === "sidebar") {
    return (
      <nav aria-label="Panel" className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                active ? "bg-primary text-secondary" : "text-primary hover:bg-primary/10"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              <CountBadge n={item.kind ? live[item.kind] : 0} />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Panel"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-primary/10 bg-secondary/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${
              active ? "text-primary" : "text-primary/55"
            }`}
          >
            <span className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
              <CountBadge n={item.kind ? live[item.kind] : 0} className="absolute -right-3 -top-2" />
            </span>
            {item.label}
            {active && (
              <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}