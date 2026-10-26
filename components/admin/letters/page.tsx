// components/admin/letters/LetterCard.tsx
import type { AdminLetter } from "@/lib/admin/queries/letters";
import { colorById } from "@/lib/letter-style";
import LetterIcon from "@/components/home/letters/letterIcon"; //components/sections/LetterIcon ajusta la ruta a donde tengas LetterIcon
import CardMeta from "../ui/CardMeta";
import ModerationButtons from "../ui/ModerationButtons";

export default function page({ letter }: { letter: AdminLetter }) {
  const c = colorById(letter.color);

  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-primary/10">
      <CardMeta status={letter.status} createdAt={letter.createdAt} />

      <div className="rounded-xl p-4" style={{ backgroundColor: c.bg, color: c.ink }}>
        <LetterIcon name={letter.icon} className="h-6 w-6" />
        {letter.title && <p className="mt-2 font-display text-lg font-semibold">{letter.title}</p>}
        <p className="mt-1 whitespace-pre-line warp-break-word text-sm">{letter.message}</p>
        <p className="mt-3 text-right font-hand text-2xl">
          {letter.authorName ? `— ${letter.authorName}` : "Con cariño"}
        </p>
      </div>

      <ModerationButtons table="letters" id={letter.id} status={letter.status} />
    </li>
  );
}