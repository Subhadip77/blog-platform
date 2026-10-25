import rateLimit from 'express-rate-limit';
import { AppError } from '../common/errors/AppError';
import { env } from '../config/env';

const createLimiter = (limit: number, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    // Route through our central error handler so the response shape stays consistent.
    handler: (_req, _res, next) =>
      next(new AppError(429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later')),
  });

export const authLimiter = createLimiter(10); // login + register
export const refreshLimiter = createLimiter(60); // refresh runs on every page load, so it's looser