import type { Paginated } from '../types/index.js';

export interface PaginationParams {
  page: number;
  limit: number;
}

/** Normaliza page/limit con límites sanos para evitar abusos. */
export function resolvePagination(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(1, Math.floor(page ?? 1));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit ?? 12)));
  return { page: safePage, limit: safeLimit };
}

/** Construye un resultado paginado a partir de los items y el total. */
export function buildPaginated<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams,
): Paginated<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
