import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../common/errors/AppError';
import { tokenService } from '../modules/auth/token.service';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication required');
  }
  const payload = tokenService.verifyAccess(header.slice(7));
  req.user = { id: payload.sub, role: payload.role };
  next();
};