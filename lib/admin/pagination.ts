// src/lib/admin/pagination.ts
import { PAGE_SIZE } from "./constants";

export const pageRange = (page: number) => ({
  from: (page - 1) * PAGE_SIZE,
  to: page * PAGE_SIZE - 1,
});

export const totalPages = (total: number) =>
  Math.max(1, Math.ceil(total / PAGE_SIZE));