import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
  });

  app.get('/api/v1/boom', () => {
    throw new Error('secret internal detail');
  });
  // Next step: routes, notFound, errorHandler
  app.use(notFound);
  app.use(errorHandler);
  return app;
}