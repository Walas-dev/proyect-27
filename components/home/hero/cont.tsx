// src/components/sections/Countdown.tsx
"use client";

import { useEffect, useState } from "react";

function useRemaining(target: string) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setMs(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return ms;
}

export default function Count({ fecha }: { fecha: string }) {
  const ms = useRemaining(fecha);

  if (ms === 0) {
    return (
      <p className="font-display text-3xl font-semibold text-primary md:text-4xl">
        ¡Hoy es tu día! 🎉
      </p>
    );
  }

  const total = ms ?? 0;
  const units = [
    { label: "días", value: Math.floor(total / 86_400_000) },
    { label: "horas", value: Math.floor(total / 3_600_000) % 24 },
    { label: "min", value: Math.floor(total / 60_000) % 60 },
    { label: "seg", value: Math.floor(total / 1000) % 60 },
  ];

  return (
    <div
      className="grid w-full max-w-sm grid-cols-4 gap-2 md:max-w-md md:gap-3"
      role="timer"
      aria-label="Cuenta regresiva para el cumpleaños"
    >
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-2xl bg-secondary/80 py-3 ring-1 ring-primary/10"
        >
          <div className="font-display text-3xl font-semibold tabular-nums text-primary md:text-4xl">
            {ms === null ? "--" : String(u.value).padStart(2, "0")}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}