import { z } from 'zod';
import type { PageMeta } from './apiResponse';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10), // hard cap protects the DB
});

export const buildMeta = (page: number, limit: number, total: number): PageMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});