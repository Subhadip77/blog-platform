import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { validate } from './middleware/validate';
import { registerSchema } from './modules/auth/auth.schema';
import { userService } from './modules/users/user.service';
import authRoutes from './modules/auth/auth.routes';
import { authenticate } from './middleware/authenticate';
import { authorize } from './middleware/authorize';
import postRoutes from './modules/posts/post.routes';

export function createApp() {
  const app = express();

    app.use(helmet());
    app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
    app.use(express.json({ limit: '10kb' }));
    app.use(cookieParser());

    app.get('/api/v1/health', (_req, res) => {
        res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
    });

    if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
    
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/posts', postRoutes);

    app.get('/api/v1/_admin-test', authenticate, authorize('admin'), (_req, res) => {
        res.json({ success: true, data: 'hello admin' });
    });
    
    // Next step: routes, notFound, errorHandler
    app.use(notFound);
    app.use(errorHandler);

    return app;
}