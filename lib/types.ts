export type Celebration = {
    id: string;
    recipient_name: string | null;
    celebration_date: string | null;
};

export type Memory = {
    id: string;
    src:string;
    width: number;
    height: number;
    caption: string;
    author: string | null;
};

export type Letter = {
  id: string;
  title: string | null;
  message: string;
  author: string | null;
  color: string;
  icon: string;
};


// src/lib/types.ts
export type SongResult = {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  previewUrl: string | null;
  durationMs: number | null;
  album: string | null;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  previewUrl: string | null;
  audioUrl: string | null; // archivo completo
  spotifyId: string | null;
  author: string | null;
};