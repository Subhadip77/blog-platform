import crypto from 'node:crypto';
import type { RequestHandler } from 'express';
import { runWithContext } from '../common/context/requestContext';

export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId); // lets a client quote it when reporting a problem
  runWithContext({ requestId, ip: req.ip, userAgent: req.get('user-agent') }, () => next());
};