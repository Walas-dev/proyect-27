// src/components/HomeView.tsx
import Inicio from "@/components/home/hero/page";
import Recuerdos from "@/components/home/memory/Remenber";
import Cartas from "@/components/home/letters/page";
import Melodias from "@/components/home/songs/melodies";
import type { Celebration, Memory, Letter, Song } from "@/lib/types";

const Placeholder = ({ id, title }: { id: string; title: string }) => (
  <section id={id} className="grid min-h-dvh place-items-center">
    <h2 className="font-display text-4xl text-primary">{title}</h2>
  </section>
);

export default function HomeView({
  mode,
  token,
  defaultName,
  celebration,
  memories,
  letters,
  songs,
}: {
  mode: "invitado" | "homenajeada";
  token?: string;
  defaultName?:string;
  celebration: Celebration;
  memories: Memory[];
  letters: Letter[];
  songs: Song[];
}) {
  return (
    <>
      <Inicio
        nombre={celebration.recipient_name ?? ""}
        fecha={`${celebration.celebration_date}T00:00:00`} // la celebración debe tener fecha
        mode={mode}
      />
      <Recuerdos memories={memories} token={token} />
      <Cartas letters={letters} token={token} defaultName={defaultName} />
      <Melodias songs={songs} token={token} />
    </>
  );
}