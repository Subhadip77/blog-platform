import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { sendSuccess } from '../../common/utils/apiResponse';
import { authService } from './auth.service';
import type { LoginInput, RegisterInput } from './auth.schema';
import { userService } from '../users/user.service';
import crypto from 'node:crypto';
import type { NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import { AppError, NotFoundError } from '../../common/errors/AppError';
import { enabledProviders } from '../../config/passport';
import type { SocialProvider } from './social.service';



const COOKIE_NAME = 'refreshToken';

const STATE_COOKIE = 'oauth_state';
const SCOPES = { google: ['profile', 'email'], facebook: ['email'] };

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

    socialStart: (provider: SocialProvider): RequestHandler => (req, res, next) => {
        if (!enabledProviders.has(provider)) throw new NotFoundError(`${provider} login is not configured`);

        // No session here, so we keep the anti-CSRF `state` in a short-lived httpOnly cookie.
        const state = crypto.randomBytes(16).toString('hex');
        res.cookie(STATE_COOKIE, state, { ...cookieBase, maxAge: 10 * 60 * 1000 });
        passport.authenticate(provider, { session: false, scope: SCOPES[provider], state })(req, res, next);
    },

    socialCallback: (provider: SocialProvider): RequestHandler => (req, res, next: NextFunction) => {
        const fail = (msg: string) => res.redirect(`${env.CLIENT_URL}/auth/callback?error=${encodeURIComponent(msg)}`);

        const expected = req.cookies?.[STATE_COOKIE];
        res.clearCookie(STATE_COOKIE, cookieBase);
        if (!expected || expected !== req.query.state) return fail('Invalid login state');

        // Custom callback: passport verifies the code, we decide what happens next.
        passport.authenticate(provider, { session: false }, async (err: unknown, user?: Express.User | false | null) => {
        try {
            if (err) throw err;
            if (!user) return fail('Social login was cancelled');
            const session = await authService.startSession(user, provider);
            setRefreshCookie(res, session.refreshToken);
            res.redirect(`${env.CLIENT_URL}/auth/callback`); // no token in the URL
        } catch (e) {
            if (e instanceof AppError) return fail(e.message);
            next(e);
        }
        })(req, res, next);
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