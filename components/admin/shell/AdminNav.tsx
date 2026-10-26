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
  const activeIndex = ITEMS.findIndex(isActive);

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
      className=" fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-primary/10 bg-secondary pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(40,54,24,0.06)] md:hidden"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-0.5 w-1/5 rounded-full bg-primary transition-transform duration-300 ease-in-out motion-reduce:transition-none"
        style={{
          transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
        }}
      />
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 pt-3 pb-1 text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
              active ? "text-primary" : "text-primary/65"
            }`}
          >
            <span className="relative">
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ease-out ${
                  active ? "scale-110" : "scale-100"
                }`}
                aria-hidden="true"
              />
              <CountBadge
                n={item.kind ? live[item.kind] : 0}
                className="absolute -right-3 -top-2"
              />
            </span>

            <span className="max-w-full truncate">{item.label}</span>

            
          </Link>
        );
      })}
    </nav>
  );

}