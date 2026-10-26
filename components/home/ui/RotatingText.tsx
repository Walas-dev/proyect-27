// src/components/ui/RotatingText.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";

export type RotatingItem = { id: string; label: string };

export default function RotatingText({
  items,
  suffix,
  intervalMs = 2800,
  className = "",
}: {
  items: RotatingItem[];
  suffix?: ReactNode; // se dibuja pegado a cada palabra (por ejemplo, el punto del logo)
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const prev = (index - 1 + items.length) % items.length;

  return (
    <span className={`inline-grid ${className}`}>
      {/* Lectores de pantalla: leen todas las palabras una vez, sin el efecto */}
      <span className="sr-only">{items.map((i) => i.label).join(", ")}</span>

      {items.map((item, i) => {
        const state =
          i === index
            ? "translate-y-0 opacity-100"
            : i === prev
              ? "-translate-y-2 opacity-0" // la que sale, hacia arriba
              : "translate-y-2 opacity-0"; // las que esperan, abajo
        return (
          <span
            key={item.id}
            aria-hidden="true"
            className={`col-start-1 row-start-1 whitespace-nowrap transition-all duration-500 ease-out motion-reduce:transition-none ${state}`}
          >
            {item.label}
            {suffix}
          </span>
        );
      })}
    </span>
  );
}