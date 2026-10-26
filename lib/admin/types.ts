// src/lib/admin/types.ts
import type { Status } from "./constants";

export type ContentKind = "memories" | "letters" | "songs";
export type StatusCounts = Record<Status, number>;
export type ContentStats = Record<ContentKind, StatusCounts>;
export type PendingCounts = Record<ContentKind, number>;