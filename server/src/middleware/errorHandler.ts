import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../common/errors/AppError';
import { env } from '../config/env';

// Express recognizes an error handler by its 4 parameters. Keep all 4.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof AppError) {
    ({ statusCode: status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'BAD_REQUEST';
    message = `Invalid ${err.path}`;
  } else if ((err as { code?: number })?.code === 11000) {
    status = 409;
    code = 'CONFLICT';
    message = 'Duplicate value';
  } else if (err instanceof SyntaxError && 'body' in err) {
    status = 400;
    code = 'BAD_REQUEST';
    message = 'Malformed JSON body';
  }

  if (status >= 500) {
    console.error(err); // we replace this with pino later
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message: status >= 500 && env.NODE_ENV === 'production' ? 'Something went wrong' : message,
      ...(details !== undefined && { details }),
      ...(env.NODE_ENV === 'development' && err instanceof Error && status >= 500 && { stack: err.stack }),
    },
  });
}