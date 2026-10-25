import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { requestContext } from './middleware/requestContext';
import authRoutes from './modules/auth/auth.routes';
import postRoutes from './modules/posts/post.routes';
import { commentRoutes, postCommentRoutes } from './modules/comments/comment.routes';
import adminRoutes from './modules/admin/admin.routes';

export function createApp() {
  const app = express();

  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use(requestContext); // before any route, so every request has context

  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/posts/:postId/comments', postCommentRoutes);
  app.use('/api/v1/posts', postRoutes);
  app.use('/api/v1/comments', commentRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}