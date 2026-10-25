import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    // parse() throws ZodError; Express forwards it to errorHandler, which already formats it.
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
    if (schemas.query) {
      // Express 5: req.query is a read-only getter, so we redefine it instead of assigning.
      Object.defineProperty(req, 'query', {
        value: schemas.query.parse(req.query),
        configurable: true,
        enumerable: true,
      });
    }
    next();
  };