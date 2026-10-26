
"use client";

import { useEffect, useState } from "react";

function useRemaining(target: string) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(target).getTime();

    const tick = () => {
      setMs(Math.max(0, end - Date.now()));
    };

    tick();

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return ms;
}

export default function Countdown({ fecha }: { fecha: string }) {
  const ms = useRemaining(fecha);

  if (ms === 0) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-accent/30 bg-secondary/70 px-6 py-5 text-center shadow-sm backdrop-blur-sm">
        <span className="mb-2 block text-2xl" aria-hidden="true">
          ✨
        </span>
        <p className="font-display text-2xl font-semibold text-primary sm:text-3xl">
          ¡Hoy es tu día!
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text/75">
          Que no falten las sonrisas, los abrazos y los momentos bonitos.
        </p>
      </div>
    );
  }

  const total = ms ?? 0;

  const units = [
    { label: "Días", value: Math.floor(total / 86_400_000) },
    { label: "Horas", value: Math.floor(total / 3_600_000) % 24 },
    { label: "Minutos", value: Math.floor(total / 60_000) % 60 },
    { label: "Segundos", value: Math.floor(total / 1000) % 60 },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-accent/60" />
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/75">
          La cuenta regresiva
        </p>
        <span className="h-px w-8 bg-accent/60" />
      </div>

      <div
        className="grid grid-cols-4 gap-2 sm:gap-3"
        role="timer"
        aria-label="Cuenta regresiva para el cumpleaños"
      >
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white/65 px-1 py-4 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-md sm:rounded-3xl sm:py-5"
          >
            <span
              className="pointer-events-none absolute -right-3 -top-4 h-12 w-12 rounded-full bg-accent/10 transition-transform duration-500 group-hover:scale-150"
              aria-hidden="true"
            />

            <p className="relative font-display text-2xl font-semibold tabular-nums tracking-tight text-primary sm:text-4xl">
              {ms === null ? "--" : String(unit.value).padStart(2, "0")}
            </p>

            <p className="relative mt-1 text-[9px] font-bold uppercase tracking-wider text-text/65 sm:text-[11px]">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
