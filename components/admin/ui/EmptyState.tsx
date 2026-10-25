// EmptyState.tsx
import { Inbox } from "lucide-react";

export default function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl bg-white/60 px-4 py-14 text-center ring-1 ring-primary/10">
      <Inbox className="h-8 w-8 text-primary/40" aria-hidden="true" />
      <p className="font-bold text-primary">{title}</p>
      {text && <p className="max-w-sm text-sm text-text/70">{text}</p>}
    </div>
  );
}