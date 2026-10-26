
import Countdown from "./cont";

type Props = {
  nombre: string;
  fecha: string;
  mode?: "invitado" | "homenajeada";
};

const CONFETTI_COLORS = ["bg-accent", "bg-primary/60", "bg-secondary", "bg-primary/30"];


export default function Inicio({
  nombre,
  fecha,
  mode = "invitado",
}: Props) {
  const esHomenajeada = mode === "homenajeada";

  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[calc(100svh-4rem)] scroll-mt-20 items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/45 via-background to-background px-5 py-20 sm:px-8 sm:py-24"
    >

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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-8 -z-10 h-64 w-64 rounded-full bg-accent/15 blur-3xl sm:h-96 sm:w-96"
      />
      
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(85vw,36rem)] w-[min(85vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(68vw,28rem)] w-[min(68vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/25"
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/55 px-4 py-2 shadow-sm backdrop-blur-sm sm:mb-9">
          <span className="text-accent" aria-hidden="true">
            ✦
          </span>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 sm:text-xs sm:tracking-[0.25em]">
            {esHomenajeada
              ? "Un regalo hecho especialmente para ti"
              : "Hoy tenemos a alguien especial que celebrar"}
          </p>

          <span className="text-accent" aria-hidden="true">
            ✦
          </span>
        </div>

        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.12] tracking-tight text-primary sm:text-6xl md:text-7xl lg:text-8xl">
          {esHomenajeada ? (
            <>
              Este día es
              <br />
              <span className="mt-1 inline-block italic text-accent">
                todo tuyo.
              </span>
            </>
          ) : (
            <>
              Celebramos la
              <br />
              <span className="mt-1 inline-block italic text-accent">
                alegría de tenerte,
              </span>
            </>
          )}
        </h1>

        <div className="my-5 flex items-center justify-center gap-3 sm:my-7">
          <span className="h-px w-8 bg-accent/60 sm:w-12" />
          <span className="text-sm text-accent" aria-hidden="true">
            ♥
          </span>
          <span className="h-px w-8 bg-accent/60 sm:w-12" />
        </div>

        <p className="font-display text-3xl font-medium leading-tight text-primary sm:text-4xl md:text-5xl">
          {nombre}
        </p>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-text/75 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
          {esHomenajeada
            ? "Cada recuerdo, cada palabra y cada canción guarda un poquito de todo lo bonito que significas para quienes te quieren."
            : `Preparamos este pequeño rincón para celebrar a ${nombre}, compartir recuerdos y dejarle palabras que pueda guardar para siempre.`}
        </p>

        <div className="flex items-center justify-center mt-9 w-full sm:mt-11">
          <Countdown fecha={fecha} />
        </div>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center">
          {esHomenajeada ? (
            <a
              href="#recuerdos"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-7 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 sm:min-w-48"
            >
              Descubrir mi regalo
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          ) : (
            <>
              <a
                href="#cartas"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-7 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 sm:min-w-48"
              >
                Dejarle unas palabras
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>

              <a
                href="#recuerdos"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/20 bg-white/40 px-7 py-3 text-sm font-bold text-primary backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-white/70 active:translate-y-0 sm:min-w-48"
              >
                Revivir recuerdos
              </a>
            </>
          )}
        </div>

        <div className="mt-12 flex items-center gap-2 text-xs font-medium tracking-wide text-primary/50 sm:mt-16">
          <span className="h-px w-6 bg-primary/20" />
          <span>Hecho con cariño, pensado para ti</span>
          <span className="h-px w-6 bg-primary/20" />
        </div>
      </div>
    </section>
  );
}
