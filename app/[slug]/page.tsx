// src/app/(site)/[slug]/page.tsx
import { notFound } from "next/navigation";
import HomeView from "@/components/HomeView";
import {
  getApprovedLetters,
  getApprovedMemories,
  getApprovedSongs,
  getCelebrationBySlug,
  getSpotifyPlaylistUrl,
} from "@/lib/celebration";

export const revalidate = 60;

export default async function Celebracion({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const celebration = await getCelebrationBySlug(slug);
  if (!celebration) notFound();

  const [memories, letters, songs, playlistUrl] = await Promise.all([
    getApprovedMemories(celebration.id),
    getApprovedLetters(celebration.id),
    getApprovedSongs(celebration.id),
    getSpotifyPlaylistUrl(celebration.id),
  ]);

  return (
    <HomeView
      mode="homenajeada"
      celebration={celebration}
      memories={memories}
      letters={letters}
      songs={songs}
      playlistUrl={playlistUrl}
    />
  );
}