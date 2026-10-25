# Architecture

## Layers (one direction only)

`routes -> middleware -> controllers -> services -> models`

- **Routes** map URLs to controllers and attach middleware (auth, validation, rate limit).
- **Controllers** are thin: read the request, call a service, send the response.
- **Services** hold business rules (ownership, slugs, tokens, soft delete). They know nothing about `req`/`res`, so they are easy to test.
- **Models** are Mongoose schemas, indexes and the soft-delete query hook.

Cross-cutting: `AppError` hierarchy + one `errorHandler` (a single error response shape), Zod validation middleware, `authenticate`, `authorize(...roles)`, request-context middleware, and an event bus feeding the audit log.

`app.ts` builds the Express app and `server.ts` opens the port and DB, so tests can drive the app in-process.

## Request flow

```
client -> helmet/cors/json -> requestContext -> router
       -> [rateLimiter] -> [authenticate] -> [authorize] -> [validate]
       -> controller -> service -> model -> MongoDB
       -> errors anywhere -> errorHandler -> { success:false, error }
```

## Auth design

1. Login returns a 15-minute access token (kept in memory by the client) and sets a 7-day refresh token as an httpOnly, SameSite=Lax cookie scoped to `/api/v1/auth`.
2. `/auth/refresh` atomically claims the stored token (`findOneAndUpdate` on `revokedAt: null`), then issues a new one in the same family.
3. A token that is valid but already used triggers reuse detection: the whole family is revoked.
4. Social login: Passport verifies the provider, we find or create the user, then issue our own session and redirect with no token in the URL. The SPA exchanges the cookie via `/refresh`. A `state` cookie guards against login CSRF. Accounts link by email only when the provider verifies it.

## Data model

- **User:** name, email (unique), passwordHash (`select:false`), role, isActive, googleId/facebookId (unique, sparse).
- **Post:** title, slug, content, author -> User, `isDeleted`/`deletedAt`. Partial unique index on `slug` where `isDeleted:false`; indexes on `createdAt` and `author+createdAt`. A query hook hides deleted posts unless `withDeleted` is set.
- **Comment:** post -> Post, author -> User, content. Index `post+createdAt`. Referenced, not embedded, because comments are unbounded and paginated.
- **RefreshToken:** user, family, jti, tokenHash, expiresAt (TTL index), revokedAt, replacedBy.
- **AuditLog:** action, actor, target, requestId, ip, meta (append-only).

## Performance

Pagination with a hard limit cap, compound indexes matching the query shapes, `lean()` on reads, list queries that skip heavy fields, `populate` limited to `name`, and `Promise.all` for independent queries (items + count, dashboard totals).

## Frontend

Feature folders; TanStack Query for server state (caching, invalidation, pagination); Context only for auth; layout-route guards (`RequireAuth`, `RequireRole`); lazy-loaded admin area; React Hook Form + Zod; axios interceptor with a single-flight refresh so parallel 401s trigger one refresh call.

## Production deployment (proposed)

Container image for the API on Cloud Run or ECS Fargate; MongoDB Atlas; secrets in a secret manager; client on a static host/CDN served from the same site as the API (so the SameSite cookie keeps working); Redis for rate limiting and events when running more than one instance; central log shipping; CI running typecheck, tests and build.