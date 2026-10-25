// src/components/admin/shell/LogoutButton.tsx
import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/_actions/auth";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Salir"
        className={
          compact
            ? "grid h-11 w-11 place-items-center rounded-full text-primary hover:bg-primary/10"
            : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
        }
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        {!compact && "Salir"}
      </button>
    </form>
  );
}