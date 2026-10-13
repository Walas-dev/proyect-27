// src/lib/letter-style.ts
export const LETTER_COLORS = [
  { id: "lila", label: "Lila", bg: "#E4CFF5", ink: "#35252A", dark: false },
  { id: "rosa", label: "Rosa", bg: "#FBD9E1", ink: "#35252A", dark: false },
  { id: "durazno", label: "Durazno", bg: "#F8DDC4", ink: "#35252A", dark: false },
  { id: "menta", label: "Menta", bg: "#D5EBDD", ink: "#35252A", dark: false },
  { id: "cielo", label: "Cielo", bg: "#D3E5F7", ink: "#35252A", dark: false },
  { id: "mantequilla", label: "Mantequilla", bg: "#FAEFC2", ink: "#35252A", dark: false },
  { id: "ciruela", label: "Ciruela", bg: "#43275D", ink: "#F9EAEB", dark: true },
] as const;

export const LETTER_ICONS = [
  "corazon", "estrella", "flor", "pastel", "regalo", "sol", "luna", "destello",
] as const;

export type LetterIconId = (typeof LETTER_ICONS)[number];

export const ICON_LABELS: Record<LetterIconId, string> = {
  corazon: "Corazón",
  estrella: "Estrella",
  flor: "Flor",
  pastel: "Pastel",
  regalo: "Regalo",
  sol: "Sol",
  luna: "Luna",
  destello: "Destello",
};

export const colorById = (id: string) =>
  LETTER_COLORS.find((c) => c.id === id) ?? LETTER_COLORS[0];