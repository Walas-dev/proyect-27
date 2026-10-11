// src/app/i/[token]/page.tsx  (vista de invitados)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeView from "@/components/HomeView";
import {
  getApprovedMemories,
  getCelebrationById,
  getLinkByToken,
} from "@/lib/celebration";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Invitado({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await getLinkByToken(token);
  if (!link) notFound();

  const celebration = await getCelebrationById(link.celebration_id);
  if (!celebration) notFound();

  const memories = await getApprovedMemories(celebration.id);
  return (
    <HomeView
      mode="invitado"
      token={token}
      celebration={celebration}
      memories={memories}
    />
  );
}