# Blog Platform (MERN + TypeScript)

A blog system with authentication, post and comment management, social login and an admin panel.

**Stack:** MongoDB, Express 5, React 19 (Vite), Node.js, TypeScript (strict), Zod, TanStack Query, Tailwind CSS, Jest.

## Features

- **Auth:** register, login, logout; JWT access token (15 min) + rotating refresh token in an httpOnly cookie with reuse detection; bcrypt hashing; rate limiting; Google and Facebook login (OAuth 2.0 via Passport).
- **RBAC:** `admin` and `user` roles enforced by API middleware. Users edit only their own posts and comments; admins manage everything.
- **Posts:** CRUD, unique URL slugs, soft delete, Zod validation, pagination, indexes.
- **Comments:** CRUD referenced to posts, own-or-admin rules, pagination.
- **Admin panel:** dashboard (users, posts, comments totals), user management (role, activate/deactivate), post restore, comment moderation, activity log.
- **Activity log:** event-driven audit trail with request IDs.
- **Tests:** Jest unit and integration tests (supertest) for auth, ownership, RBAC, soft delete.

## Project structure

```
server/src/
  config/        env validation, db, passport
  modules/       auth, users, posts, comments, admin, audit
                 (each: routes -> controller -> service -> model, plus Zod schema)
  middleware/    authenticate, authorize, validate, rateLimiter, requestContext, errorHandler
  common/        AppError, events, utils
client/src/
  features/      auth, posts, comments, admin
  layouts/       PublicLayout, RequireAuth, RequireRole
  lib/           axios + refresh, token store
```

Mapping to the brief: controllers, services, models, routes and middleware exist as `*.controller.ts`, `*.service.ts`, `*.model.ts`, `*.routes.ts` inside each feature module and in `middleware/`.

## Installation

Requirements: Node 20+, a MongoDB database (Atlas free tier works).

```bash
git clone https://github.com/Subhadip77/blog-platform.git
cd blog-platform

# backend
cd server
cp .env.example .env      # fill in values, see below
npm install
npm run dev               # http://localhost:5001

# frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Environment setup

Backend `server/.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `MONGO_URI` | app database |
| `MONGO_URI_TEST` | separate database whose name ends in `-test` (tests wipe it) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | two different random strings, 32+ chars |
| `CLIENT_URL`, `API_URL` | used for CORS and OAuth redirects |
| `GOOGLE_*`, `FACEBOOK_*` | optional; a provider is disabled if its keys are missing |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Frontend `client/.env`: `VITE_API_URL=http://localhost:5001/api/v1`

**Social login setup:** add `http://localhost:5001/api/v1/auth/google/callback` (and the `/facebook/` equivalent) as redirect URIs in the Google and Meta consoles. Facebook apps in Development mode only allow the app admin and testers. The Meta app needs the `email` permission.

**First admin:** register a user, then set `role` to `"admin"` on that document in MongoDB and log in again.

Port 5001 is used because macOS reserves 5000 for AirPlay.

## Scripts

| Where | Command | What |
|---|---|---|
| server | `npm run dev` | watch mode |
| server | `npm run typecheck` | `tsc --noEmit` |
| server | `npm test` | Jest (needs `MONGO_URI_TEST`) |
| client | `npm run dev` / `npm run build` | dev server / production build |

## API overview

Base URL `/api/v1`. Success: `{ success: true, data, meta? }`. Error: `{ success: false, error: { code, message, details? } }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/me`; `GET /auth/google`, `/auth/facebook` (+ `/callback`) |
| Posts | `GET /posts?page&limit`, `GET /posts/:slug`, `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id` (soft) |
| Comments | `GET/POST /posts/:postId/comments`, `PATCH/DELETE /comments/:id` |
| Admin (admin only) | `GET /admin/stats`, `/admin/users`, `/admin/posts?status=`, `/admin/comments`, `/admin/audit-logs`; `PATCH /admin/users/:id/role`, `/admin/users/:id/status`; `POST /admin/posts/:id/restore` |

A Postman collection is in `docs/postman/`.

## Security notes

Refresh tokens are rotated on every use and the whole family is revoked on reuse. Access tokens live in memory only. Passwords are bcrypt-hashed (cost 12) and never returned. Login failures use one message and equal timing. Zod rejects NoSQL operator payloads. Helmet, strict CORS and body-size limits are enabled.

## Known limitations / future work

- Access tokens stay valid up to 15 minutes after logout or deactivation (stateless JWT).
- In-memory rate limiter and event bus: use Redis for multiple instances.
- Tags and categories, real-time notifications (Socket.io) and optimistic UI updates are planned.
- Facebook login requires an app in Development mode.