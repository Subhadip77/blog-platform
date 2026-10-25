import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { sendSuccess } from '../../common/utils/apiResponse';
import { authService } from './auth.service';
import type { LoginInput, RegisterInput } from './auth.schema';
import { userService } from '../users/user.service';
import { NotFoundError } from '../../common/errors/AppError';

const COOKIE_NAME = 'refreshToken';

const cookieBase = {
  httpOnly: true, // JavaScript cannot read it, which blunts XSS token theft
  secure: env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // not sent on cross-site POSTs, which blunts CSRF
  path: '/api/v1/auth', // browser sends it only to auth routes
};

const setRefreshCookie = (res: Response, token: string) =>
  res.cookie(COOKIE_NAME, token, { ...cookieBase, maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000 });

export const authController = {
  async register(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.register(req.body as RegisterInput);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken }, { status: 201 });
  },

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(req.body as LoginInput);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken });
  },

  async refresh(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.refresh(req.cookies?.[COOKIE_NAME]);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { user, accessToken });
  },

  async me(req: Request, res: Response) {
    const user = await userService.findById(req.user!.id);
    if (!user || !user.isActive) throw new NotFoundError('User not found');
    sendSuccess(res, { user });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies?.[COOKIE_NAME]);
    res.clearCookie(COOKIE_NAME, cookieBase);
    sendSuccess(res, { message: 'Logged out' });
  },
};