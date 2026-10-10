// src/components/sections/Inicio.tsx
import Countdown from "./cont";

type Props = {
  nombre: string;
  fecha: string; // "2026-12-27T00:00:00" (hora local)
  mode?: "invitado" | "homenajeada";
};

const CONFETTI_COLORS = ["bg-accent", "bg-primary/60", "bg-secondary", "bg-primary/30"];

export default function Inicio({ nombre, fecha, mode = "invitado" }: Props) {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-6 py-16 text-center"
    >
      {/* Fondo: círculos suaves, sin blur para cuidar el rendimiento en móvil */}
      <div className="absolute -left-24 -top-20 -z-10 h-72 w-72 rounded-full bg-secondary/60 md:h-96 md:w-96" />
      <div className="absolute -bottom-24 -right-20 -z-10 h-80 w-80 rounded-full bg-accent/25 md:h-[28rem] md:w-[28rem]" />

      {/* Confeti: valores deterministas para no romper la hidratación */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 motion-reduce:hidden">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className={`confetti absolute top-0 h-3 w-2 rounded-sm ${CONFETTI_COLORS[i % 4]}`}
            style={{
              left: `${(i * 37 + 5) % 100}%`,
              animationDelay: `${(i % 5) * 1.4}s`,
              animationDuration: `${8 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-6 md:gap-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary/70">
          Hoy celebramos a
        </p>

        <h1 className="font-display text-5xl font-semibold leading-tight text-primary md:text-7xl">
          ¡Feliz cumpleaños,
          <br />
          <span className="italic underline decoration-accent decoration-wavy decoration-2 underline-offset-8">
            {nombre}
          </span>
          !
        </h1>

        <p className="max-w-md text-base text-text/80 md:text-lg">
          Un regalo hecho con cariño por las personas que más te quieren.
        </p>

        <Countdown fecha={fecha} />

        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          {mode === "invitado" ? (
            <>
              <a
                href="#cartas"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-secondary shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                Dejar un mensaje
              </a>
              <a
                href="#recuerdos"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 font-bold text-primary ring-2 ring-primary/30 transition hover:bg-primary/10"
              >
                Ver los recuerdos
              </a>
            </>
          ) : (
            <a
              href="#recuerdos"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 font-bold text-secondary shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              Abrir mi regalo
            </a>
          )}
        </div>
      </div>
    </section>
  );
}