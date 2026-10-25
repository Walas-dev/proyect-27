// PageHeader.tsx
import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-text/70">{description}</p>}
      </div>
      {children}
    </header>
  );
}