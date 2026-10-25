import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../common/errors/AppError';
import type { UserRole } from '../users/user.model';

export interface AccessPayload {
  sub: string;
  role: UserRole;
}
export interface RefreshPayload {
  sub: string;
  fam: string; // family id: all rotated descendants of one login share it
  jti: string; // unique id of this specific token
}

export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export const tokenService = {
  signAccess(payload: AccessPayload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    });
  },

  verifyAccess(token: string): AccessPayload {
    try {
      const d = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      return { sub: d.sub as string, role: d.role };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  },

  signRefresh(payload: RefreshPayload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60, // seconds
    });
  },

  verifyRefresh(token: string): RefreshPayload {
    try {
      const d = jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      return { sub: d.sub as string, fam: d.fam, jti: d.jti };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  },
};