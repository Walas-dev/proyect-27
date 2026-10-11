// src/components/HomeView.tsx
import Inicio from "@/components/home/hero/page";
import Recuerdos from "@/components/home/memory/Remenber";
import type { Celebration, Memory } from "@/lib/types";

const Placeholder = ({ id, title }: { id: string; title: string }) => (
  <section id={id} className="grid min-h-dvh place-items-center">
    <h2 className="font-display text-4xl text-primary">{title}</h2>
  </section>
);

export default function HomeView({
  mode,
  token,
  celebration,
  memories,
}: {
  mode: "invitado" | "homenajeada";
  token?: string;
  celebration: Celebration;
  memories: Memory[];
}) {
  return (
    <>
      <Inicio
        nombre={celebration.recipient_name ?? ""}
        fecha={`${celebration.celebration_date}T00:00:00`} // la celebración debe tener fecha
        mode={mode}
      />
      <Recuerdos memories={memories} token={token} />
      <Placeholder id="cartas" title="Cartas" />
      <Placeholder id="melodias" title="Melodías" />
    </>
  );
}