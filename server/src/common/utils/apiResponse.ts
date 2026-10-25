import type { Response } from 'express';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { status?: number; meta?: PageMeta } = {},
) {
  const { status = 200, meta } = options;
  return res.status(status).json({ success: true, data, ...(meta && { meta }) });
}