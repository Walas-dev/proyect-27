// src/app/[slug]/page.tsx  (vista de la homenajeada)
import { notFound } from "next/navigation";
import HomeView from "@/components/HomeView";
import { getApprovedLetters, getApprovedMemories, getCelebrationBySlug } from "@/lib/celebration";

export const revalidate = 60; // lo aprobado aparece en ≤ 1 min

export default async function Celebracion({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const celebration = await getCelebrationBySlug(slug);
  if (!celebration) notFound();

  const [memories, letters] = await Promise.all([
    getApprovedMemories(celebration.id),
    getApprovedLetters(celebration.id),
  ]);

  return (
    <HomeView
      mode="homenajeada" 
      celebration={celebration} 
      memories={memories} 
      letters={letters}
    />
    );
}