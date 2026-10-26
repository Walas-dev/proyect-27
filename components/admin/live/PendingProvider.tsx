// src/components/admin/live/PendingProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PendingCounts } from "@/lib/admin/types";

const POLL_MS = 45_000;

type Value = { live: PendingCounts; newCount: number; refresh: () => void };

const PendingContext = createContext<Value | null>(null);

export function usePending() {
  const ctx = useContext(PendingContext);
  if (!ctx) throw new Error("usePending debe usarse dentro de PendingProvider");
  return ctx;
}

const total = (p: PendingCounts) => p.memories + p.letters + p.songs;

export function PendingProvider({
  initial,
  children,
}: {
  initial: PendingCounts;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [live, setLive] = useState(initial);

  // Cuando el servidor manda contadores nuevos (tras aprobar algo, por ejemplo), son la verdad
  const signature = `${initial.memories}|${initial.letters}|${initial.songs}`;
  const [seen, setSeen] = useState(signature);
  if (signature !== seen) {
    setSeen(signature);
    setLive(initial);
  }

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pending", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (res.ok) setLive((await res.json()) as PendingCounts);
    } catch {
      /* sin red: se reintenta en el siguiente ciclo */
    }
  }, [router]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      timer = setInterval(poll, POLL_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        poll(); // al volver a la pestaña, se consulta de inmediato
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll]);

  // Solo cuenta lo que llegó desde que se cargó la página
  const newCount = useMemo(
    () =>
      (["memories", "letters", "songs"] as const).reduce(
        (n, k) => n + Math.max(0, live[k] - initial[k]),
        0
      ),
    [live, initial]
  );

  // El título de la pestaña muestra los pendientes
  useEffect(() => {
    const n = total(live);
    document.title = `${n > 0 ? `(${n}) ` : ""}Panel de administración`;
  }, [live, pathname]);

  const value = useMemo<Value>(
    () => ({ live, newCount, refresh: () => router.refresh() }),
    [live, newCount, router]
  );

  return <PendingContext.Provider value={value}>{children}</PendingContext.Provider>;
}