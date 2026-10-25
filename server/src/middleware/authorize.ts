import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors/AppError';
import type { UserRole } from '../modules/users/user.model';

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    if (!roles.includes(req.user.role)) throw new ForbiddenError();
    next();
  };