// components/admin/songs/SongCard.tsx
import { FileAudio, Music } from "lucide-react";
import type { AdminSong } from "@/lib/admin/queries/songs";
import CardMeta from "../ui/CardMeta";
import ModerationButtons from "../ui/ModerationButtons";

export default function SongCard({ song }: { song: AdminSong }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-primary/10">
      <CardMeta status={song.status} createdAt={song.createdAt} />

      <div className="flex items-center gap-3">
        {song.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.coverUrl} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Music className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-primary">{song.title}</p>
          <p className="truncate text-sm text-text/70">{song.artist}</p>
          <p className="text-xs font-bold text-primary/70">Pedida por {song.authorName ?? "—"}</p>
        </div>
      </div>

      <p
        className={`flex items-center gap-1.5 text-xs font-bold ${
          song.hasAudio ? "text-emerald-800" : "text-text/70"
        }`}
      >
        <FileAudio className="h-4 w-4" aria-hidden="true" />
        {song.hasAudio ? "Archivo completo" : "Sin archivo: suena el fragmento de 30 s"}
      </p>

      {song.previewUrl && <audio controls preload="none" src={song.previewUrl} className="h-10 w-full" />}

      <ModerationButtons table="songs" id={song.id} status={song.status} />
    </li>
  );
}