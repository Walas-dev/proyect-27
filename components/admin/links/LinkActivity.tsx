// src/components/admin/links/LinkActivity.tsx  (aportes de la persona, con acceso directo a cada lista)
import Link from "next/link";
import { Images, Mail, Music, type LucideIcon } from "lucide-react";
import { plural } from "@/lib/format";
import type { LinkActivity as Activity } from "@/lib/admin/queries/links";

const ROWS: {
  label: string;
  href: string;
  icon: LucideIcon;
  total: keyof Activity;
  pending: keyof Activity;
}[] = [
  { label: "Recuerdos", href: "/admin/recuerdos", icon: Images, total: "memories", pending: "memoriesPending" },
  { label: "Cartas", href: "/admin/cartas", icon: Mail, total: "letters", pending: "lettersPending" },
  { label: "Canciones", href: "/admin/canciones", icon: Music, total: "songs", pending: "songsPending" },
];

export default function LinkActivity({ linkId, activity }: { linkId: string; activity: Activity }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {ROWS.map(({ label, href, icon: Icon, total, pending }) => (
        <li key={label}>
          <Link
            href={`${href}?estado=all&enlace=${linkId}`}
            className="flex flex-col gap-1 rounded-2xl bg-white p-3 ring-1 ring-primary/10 transition hover:shadow-md"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </span>
            <span className="font-display text-3xl font-semibold text-primary">{activity[total]}</span>
            <span className="text-xs text-text/70">
              {activity[pending]} {plural(activity[pending], "pendiente", "pendientes")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}