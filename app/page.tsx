import Hero from "@/components/home/hero/page";
import Recuerdos from "@/components/home/memory/Remenber";
import type { Celebration, Memory } from "@/lib/types";


const Placeholder = ({ id, title }: { id: string; title: string }) => (
  <section id={id} className="grid min-h-dvh place-items-center">
    <h2 className="font-display text-4xl text-primary">{title}</h2>
  </section>
);

export default function Home({
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
    <div className="flex flex-col min-h-screen bg-background">
      <Hero nombre="Nombre" fecha="2026-10-27T00:00:00" mode="invitado" />
      <Recuerdos memories={memories} token={token} />
      <Placeholder id="cartas" title="Cartas" />
      <Placeholder id="melodías" title="Melodías" />
    </div>
  );
}
