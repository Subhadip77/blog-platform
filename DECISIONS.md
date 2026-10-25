# Design Decisions

Each entry: what I chose, the alternative, why, and the trade-off.

## Language and tooling

### TypeScript (strict)
- **Alternative:** plain JavaScript
- **Why:** compile-time safety, and `z.infer` gives types from the same Zod schemas
- **Trade-off:** more setup and some library type friction

### Express 5
- **Alternative:** Express 4
- **Why:** async errors are forwarded to the error handler automatically
- **Trade-off:** newer, and `req.query` is read-only

### Feature modules
- **Alternative:** global `controllers/`, `services/` folders
- **Why:** everything for a feature lives together
- **Trade-off:** a grader must map the names (the README does)

### Zod
- **Alternative:** Joi
- **Why:** one schema gives validation and types
- **Trade-off:** v4 syntax differs from older tutorials

### Validated env, fail fast
- **Alternative:** raw `process.env`
- **Why:** bad config stops boot, and values are typed
- **Trade-off:** none worth noting

## Authentication

### Refresh rotation with reuse detection
- **Alternative:** a single long-lived token
- **Why:** a stolen token is detected and the family is revoked
- **Trade-off:** a double refresh logs the user out, hence the single-flight client

### Access token in memory, refresh token in httpOnly cookie
- **Alternative:** localStorage
- **Why:** XSS cannot read either token
- **Trade-off:** a reload needs a `/refresh` call

### bcrypt, cost 12
- **Alternative:** argon2id
- **Why:** widely understood and acceptable
- **Trade-off:** argon2id is OWASP's stronger default

## Architecture and data

### Service layer separate from controllers
- **Alternative:** logic inside controllers
- **Why:** testable without `req`/`res`, and rules live in one place
- **Trade-off:** more files

### Soft delete via query hook and `isDeleted` partial index
- **Alternative:** filtering in every query
- **Why:** forgetting a filter cannot leak deleted posts
- **Trade-off:** aggregates and updates bypass the hook

### Boolean flag in the partial index
- **Alternative:** `{ deletedAt: { $exists: false } }`
- **Why:** MongoDB partial indexes do not support `$exists: false`
- **Trade-off:** one extra field

### Offset pagination
- **Alternative:** cursor pagination
- **Why:** simple, and admin tables need jump-to-page
- **Trade-off:** deep pages are slower; cursor suits huge feeds

### Comments referenced, not embedded
- **Alternative:** embedded array
- **Why:** unbounded, paginated and independently indexed
- **Trade-off:** a second query

### Hard delete for comments
- **Alternative:** soft delete
- **Why:** leaf data, and the audit log records who deleted
- **Trade-off:** not restorable

### Event bus for the audit log
- **Alternative:** direct calls inside services
- **Why:** services stay focused, and Socket.io would be one more listener
- **Trade-off:** in-process, events are lost on a crash

### AsyncLocalStorage request context
- **Alternative:** passing `req` through services
- **Why:** request ID and IP are available anywhere
- **Trade-off:** implicit behavior

## Testing and dependencies

### Tests on a separate Atlas database with a `-test` name guard
- **Alternative:** mongodb-memory-server
- **Why:** its binary did not match Mongoose 9's driver, and a real engine is closer to production
- **Trade-off:** needs network and is slower

### TypeScript pinned to 5.9
- **Alternative:** TypeScript 7
- **Why:** ts-jest's peer range
- **Trade-off:** revisit when ts-jest supports 7

### `@hookform/resolvers` v5
- **Alternative:** v6
- **Why:** avoids an optional peer conflict with `effect`
- **Trade-off:** none

## Frontend

### TanStack Query
- **Alternative:** `useEffect` and `fetch`
- **Why:** caching, deduplication, invalidation, retries
- **Trade-off:** extra dependency

### Context for auth state
- **Alternative:** Redux
- **Why:** small state that rarely changes
- **Trade-off:** not suited to large global state

## Scope

### Port 5001
- **Alternative:** 5000
- **Why:** macOS AirPlay uses 5000

### Skipped tags, categories and Socket.io
- **Why:** not in the brief, so I kept scope tight
- **Trade-off:** listed as future work in the README