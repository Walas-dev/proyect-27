'use client';

import { useEffect, useState } from "react";
import {nav} from '@/types/nav'

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}


const Nav = () => {

  const [open, setOpen] = useState(false);
  const active = useActiveSection(nav.map((i) => i.id));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
         className={`fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-500
          md:inset-x-6 md:top-3 md:mx-auto md:h-14 md:max-w-5xl md:rounded-full md:border md:border-primary/10 md:bg-secondary/80 md:shadow-lg md:shadow-primary/10 md:backdrop-blur ${
          open
            ? "text-secondary"
            : "border-b border-primary/10 bg-background/85 text-primary backdrop-blur-sm"
        }`}
      >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 md:px-6">
      <a
        href="#inicio"
        className="group font-display text-2xl font-semibold italic tracking-tight"
      >
        <span className="mr-1 inline-block text-accent transition-transform duration-500 group-hover:rotate-180">
          ✦
        </span>
        Wilmarys Brizuela<span className="text-accent">.</span>
      </a>


          {/* Escritorio */}
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex gap-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "true" : undefined}
                    className={`block rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                      active === item.id
                        ? "bg-primary text-secondary"
                        : "text-primary hover:bg-primary/10"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

           <a
      href="#cartas"
      className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-primary shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 md:inline-flex"
    >
      Boton
    </a>

          {/* Botón móvil */}
          <button
            type="button"
            className="-mr-1 grid h-11 w-11 place-items-center md:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 h-0.5 rounded-full bg-current transition-all duration-500 ${
                  open ? "top-1/2 w-6 -translate-y-1/2 rotate-45" : "top-0 w-6"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${
                  open ? "w-0 opacity-0" : "w-4 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 rounded-full bg-current transition-all duration-500 ${
                  open
                    ? "top-1/2 w-6 -translate-y-1/2 -rotate-45"
                    : "bottom-0 w-6"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Overlay: va FUERA del header porque backdrop-blur rompe position:fixed en hijos */}
      <nav
        id="menu-movil"
        aria-label="Menú móvil"
        data-open={open}
        inert={!open}
        className="menu-reveal fixed inset-0 z-40 overflow-hidden bg-primary md:hidden"
      >
        {/* Decoración */}
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20" />
        <div className="pointer-events-none absolute -bottom-10 left-24 h-24 w-24 rounded-full bg-secondary/10" />

        <ul className="flex h-full flex-col justify-center gap-2 px-8 pt-16">
          {nav.map((item, i) => (
            <li
              key={item.id}
              className={`transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${300 + i * 90}ms` : "0ms" }}
            >
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 py-2 font-display text-5xl font-semibold text-secondary"
              >
                <span className="font-sans text-sm font-bold text-accent">
                  0{i + 1}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default Nav