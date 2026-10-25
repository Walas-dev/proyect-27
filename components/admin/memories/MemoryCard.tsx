// components/admin/memories/MemoryCard.tsx
import Image from "next/image";
import type { AdminMemory } from "@/lib/admin/queries/memories";
import CardMeta from "../ui/CardMeta";
import ModerationButtons from "../ui/ModerationButtons";

export default function MemoryCard({ memory }: { memory: AdminMemory }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10">
      <div className="relative aspect-4/3 w-full bg-primary/5">
        <Image
          src={memory.url}
          alt={memory.caption ?? "Recuerdo"}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <CardMeta status={memory.status} createdAt={memory.createdAt} />
        <p className="text-sm">{memory.caption}</p>
        <p className="text-xs font-bold text-primary/70">{memory.authorName ?? "Sin nombre"}</p>
        <div className="mt-auto pt-2">
          <ModerationButtons table="memories" id={memory.id} status={memory.status} />
        </div>
      </div>
    </li>
  );
}