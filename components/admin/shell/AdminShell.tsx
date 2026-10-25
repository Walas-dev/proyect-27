// src/components/admin/shell/AdminShell.tsx
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { AdminCelebration } from "@/lib/admin/queries/celebration";
import type { PendingCounts } from "@/lib/admin/types";
import { PendingProvider } from "@/components/admin/live/PendingProvider";
import NewContentBanner from "../live/NewContentBanner";
import AdminBrand from "./AdminBrand";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

export default function AdminShell({
  celebration,
  pending,
  children,
}: {
  celebration: AdminCelebration;
  pending: PendingCounts;
  children: ReactNode;
}) {
  return (
    <PendingProvider initial={pending}>
      <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-primary/10 bg-secondary/60 p-4 md:flex">
          <AdminBrand name={celebration.recipient_name} />
          <AdminNav variant="sidebar" />

          <div className="mt-auto flex flex-col gap-1">
            {celebration.slug && (
              <a
                href={`/${celebration.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
                Ver el sitio
              </a>
            )}
            <LogoutButton />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-primary/10 bg-secondary/60 px-4 py-2 md:hidden">
            <AdminBrand name={celebration.recipient_name} />
            <LogoutButton compact />
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-28 md:px-8 md:pb-10">
            <NewContentBanner />
            {children}
          </main>
        </div>

        <AdminNav variant="tabbar" />
      </div>
    </PendingProvider>
  );
}