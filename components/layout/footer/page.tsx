import React from 'react'
import {nav} from '@/types/nav'

function Tree({
  x,
  y,
  s = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className="tree-sway fill-accent stroke-accent"
        style={{ animationDelay: `${delay}s` }}
        strokeWidth={2}
        strokeLinejoin="round"
        d="M0 -46 L14 -18 L9 14 L-9 14 L-14 -18 Z"
      />
    </g>
  );
}

const footer = () => {
  const year = new Date().getFullYear();
  return (
     <footer className="relative text-primary">
      {/* Ilustración. En móvil se recorta por los lados (slice) y quedan los árboles centrales */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        className="block h-40 w-full md:h-64"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="fill-hill-back"
          d="M0 190 L170 130 L380 185 L620 100 L860 175 L1120 115 L1300 165 L1440 140 L1440 320 L0 320 Z"
        />
        <path
          className="fill-hill-mid"
          d="M0 230 C180 190 320 235 520 215 C760 190 900 150 1100 190 C1260 220 1360 215 1440 195 L1440 320 L0 320 Z"
        />
        <path
          className="fill-ground"
          d="M0 262 C200 235 380 280 620 270 C860 258 1000 235 1200 255 C1330 268 1400 262 1440 250 L1440 320 L0 320 Z"
        />

        {/* Árboles: los de los extremos solo se ven en pantallas anchas */}
        <Tree x={150} y={252} s={0.8} delay={1} />
        <Tree x={420} y={260} />
        <Tree x={760} y={266} s={1.3} delay={0.5} />
        <Tree x={1040} y={254} delay={1.5} />
        <Tree x={1300} y={262} s={0.9} delay={2} />

        {/* Puntitos (bayas / flores) */}
        <circle cx={445} cy={266} r={4} className="fill-primary/50" />
        <circle cx={790} cy={270} r={5} className="fill-primary/50" />
        <circle cx={800} cy={274} r={3} className="fill-accent" />
        <circle cx={1065} cy={260} r={4} className="fill-primary/50" />
        <circle cx={1330} cy={268} r={4} className="fill-primary/50" />
      </svg>

      {/* Contenido sobre el "suelo" (mismo color que la colina frontal) */}
      <div className="bg-ground px-6 pb-8 pt-2">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          {/* Leyenda */}
          <p className="font-display text-2xl italic leading-snug md:text-3xl">
            Cada recuerdo aquí es un abrazo guardado para ti.
          </p>

          {/* Secciones */}
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap justify-center gap-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-block rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary hover:text-secondary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#inicio"
                  className="inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
                >
                  ↑ Volver arriba
                </a>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <p className="w-full border-t border-primary/10 pt-5 text-xs text-primary/70">
            © {year} · Hecho con <span className="text-accent">♥</span> para Nombre
          </p>
        </div>
      </div>
    </footer>
  )
}

export default footer