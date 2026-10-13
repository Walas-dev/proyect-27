// src/components/sections/NoteCard.tsx
import LetterIcon from "./letterIcon";
import { colorById } from "@/lib/letter-style";

export type NoteData = {
  title: string | null;
  message: string;
  author: string | null;
  color: string;
  icon: string;
};

export default function NoteCard({
  note,
  tilt = "",
  onOpen,
}: {
  note: NoteData;
  tilt?: string;
  onOpen?: () => void;
}) {
  const c = colorById(note.color);

  const content = (
    <>
      <span
        className="grid h-9 w-9 place-items-center rounded-full sm:h-11 sm:w-11"
        style={{
          backgroundColor: c.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.07)",
        }}
      >
        <LetterIcon name={note.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>

      {note.title && (
        <h3 className="mt-2 break-words font-display text-base font-semibold leading-snug sm:mt-3 sm:text-xl">
          {note.title}
        </h3>
      )}

      <p className="mt-1.5 line-clamp-5 whitespace-pre-line break-words text-[13px] leading-snug sm:mt-2 sm:line-clamp-4 sm:text-[15px] sm:leading-relaxed">
        {note.message}
      </p>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-3 sm:pt-4">
        <span className="font-hand text-xl leading-none sm:text-2xl">
          {note.author ? `— ${note.author}` : "Con cariño"}
        </span>
        {onOpen && (
          <span className="shrink-0 text-[11px] font-bold underline underline-offset-4 sm:text-xs">
            Leer carta
          </span>
        )}
      </div>
    </>
  );

  const cls =
    "note relative flex h-full w-full flex-col p-3 pt-5 text-left sm:p-5 sm:pt-6";
  const style = { backgroundColor: c.bg, color: c.ink };

  return (
    <div
      className={`relative h-full drop-shadow-md transition duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-primary ${
        onOpen ? "hover:-translate-y-1 hover:rotate-0" : ""
      } ${tilt}`}
    >
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-1/2 z-10 h-4 w-14 -translate-x-1/2 -rotate-3 bg-accent/60 sm:h-5 sm:w-20"
      />
      {onOpen ? (
        <button type="button" onClick={onOpen} className={cls} style={style}>
          {content}
        </button>
      ) : (
        <div className={cls} style={style}>
          {content}
        </div>
      )}
    </div>
  );
}