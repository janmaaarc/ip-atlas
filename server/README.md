# Server

Backend for the IP geolocation app. Built with Express, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **ORM**: Prisma 6
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT with httpOnly cookies
- **Validation**: Zod
- **Security**: Helmet, bcrypt, express-rate-limit, CORS
- **Docs**: Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express)

## Project Structure

```
src/
  app.ts                # Express app setup, middleware, route mounting
  index.ts              # Entry point — imports app, starts listening
  types.ts              # Shared TypeScript interfaces (AuthRequest, GeoData)
  middleware/
    auth.ts             # JWT verification from cookie or Bearer header
  routes/
    auth.ts             # Login, register, logout, /me, /refresh, change password, delete account
    geo.ts              # IP geolocation lookup via ipinfo.io + batch lookup + caching
    history.ts          # Paginated search history with server-side filtering
    favorites.ts        # Favorite IPs — CRUD, labels, bulk delete
    analytics.ts        # Search analytics (top countries, orgs, trends)
    share.ts            # Shareable geo result links (24h TTL)
  lib/
    cookies.ts          # httpOnly cookie helpers (set/clear auth cookies)
    env.ts              # Startup env validation (JWT_SECRET, DATABASE_URL)
    prisma.ts           # Prisma client singleton
    responses.ts        # Standardized response helpers (success, error, validation)
    swagger.ts          # OpenAPI/Swagger configuration
    validators.ts       # Zod schemas for all endpoints
prisma/
  schema.prisma         # User, SearchHistory, FavoriteIp, GeoCache, SharedLink models
  seed.ts               # Seeds test user
```

## Setup

```bash
npm install
cp .env.example .env
```

Fill in your `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string ([Neon](https://neon.tech/) recommended) |
| `JWT_SECRET` | Yes | Random string for JWT signing |
| `REFRESH_SECRET` | Yes | Random string for refresh token signing |
| `FRONTEND_URL` | No | Defaults to `http://localhost:5173` |
| `PORT` | No | Defaults to `8000` |

Both `DATABASE_URL` and `JWT_SECRET` are validated at startup. The app will not start without them.

Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

This creates a test user: `test@jlabs.com` / `Password1`

## Run

```bash
npm run dev
```

Runs on http://localhost:8000 with hot reload via tsx.

## Database Schema

```
User
  id        String   (cuid, PK)
  email     String   (unique)
  password  String   (bcrypt hash)
  createdAt DateTime

SearchHistory
  id        String   (cuid, PK)
  userId    String   (FK -> User, cascade delete)
  ipAddress String
  geoData   Json
  createdAt DateTime
  @@index([userId, createdAt DESC])

FavoriteIp
  id        String   (cuid, PK)
  userId    String   (FK -> User, cascade delete)
  ipAddress String
  label     String?
  createdAt DateTime
  @@unique([userId, ipAddress])
  @@index([userId, createdAt DESC])

GeoCache
  id        String   (cuid, PK)
  ip        String   (unique)
  data      Json
  cachedAt  DateTime
  @@index([cachedAt])

SharedLink
  id        String   (cuid, PK)
  token     String   (unique)
  geoData   Json
  createdAt DateTime
  expiresAt DateTime
  @@index([expiresAt])
```

## API Endpoints

Interactive API docs available at **`/api/docs`** (Swagger UI).

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/login` | Login, sets httpOnly auth cookies |
| `POST` | `/api/register` | Create account, sets httpOnly auth cookies |
| `POST` | `/api/logout` | Clears auth cookies |
| `POST` | `/api/refresh` | Refreshes access token using refresh cookie |
| `GET` | `/api/health` | Health check |

### Share (public read)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/shared/:token` | View shared geo data (public, no auth) |

### Protected (require auth cookie or Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me` | Get current user |
| `GET` | `/api/geo` | Get geolocation for your IP (cached 24h) |
| `GET` | `/api/geo?ip=8.8.8.8` | Look up a specific IP (cached 24h) |
| `POST` | `/api/geo/batch` | Batch lookup up to 25 IPs `{ ips: [...] }` |
| `GET` | `/api/history` | Paginated + filtered search history (`page`, `limit`, `search`, `dateFrom`, `dateTo`) |
| `DELETE` | `/api/history` | Bulk delete history entries `{ ids: [...] }` |
| `PATCH` | `/api/password` | Change password `{ currentPassword, newPassword }` |
| `DELETE` | `/api/account` | Delete account `{ password }` |
| `GET` | `/api/favorites` | List favorite IPs |
| `POST` | `/api/favorites` | Add favorite `{ ipAddress, label? }` |
| `PATCH` | `/api/favorites/:id` | Update favorite label `{ label }` |
| `DELETE` | `/api/favorites/bulk` | Bulk delete favorites `{ ids: [...] }` |
| `DELETE` | `/api/favorites/:id` | Remove a single favorite |
| `GET` | `/api/analytics` | Search analytics (top countries, orgs, trends) |
| `POST` | `/api/share` | Create shareable geo link `{ geoData }` (expires 24h) |

### Batch IP Lookup

`POST /api/geo/batch` accepts `{ ips: string[] }` with 1-25 IPv4 addresses. Uses `Promise.allSettled` for partial failure handling. Each successful lookup is saved to search history.

Response:
```json
{
  "data": [
    { "ip": "8.8.8.8", "status": "success", "data": { ... }, "error": null },
    { "ip": "999.0.0.1", "status": "error", "data": null, "error": "Lookup failed" }
  ]
}
```

### Password Requirements

Registration and password change require: 8+ characters, at least one uppercase letter, at least one number.

### Response Format

All endpoints use a consistent envelope:

**Success (single resource):**
```json
{
  "data": { "id": "abc", "email": "user@example.com" }
}
```

**Success (collection with pagination):**
```json
{
  "data": [...],
  "meta": { "total": 42, "page": 1, "limit": 50, "total_pages": 1 }
}
```

**Error:**
```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "Invalid email or password"
  }
}
```

**Validation error (returns all field errors):**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Please enter a valid email" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
}
```

### Error Codes

| Code | Status | When |
|------|--------|------|
| `validation_error` | 400 | Zod validation failure |
| `invalid_credentials` | 401 | Wrong email or password |
| `unauthorized` | 401 | Missing/expired token |
| `email_taken` | 409 | Duplicate registration |
| `already_favorited` | 409 | IP already favorited |
| `not_found` | 404 | Resource not found (favorite, share link) |
| `geo_lookup_failed` | 500 | ipinfo.io request failed |
| `rate_limit_exceeded` | 429 | Too many requests (auth, geo, or share) |
| `internal_error` | 500 | Unexpected server error |

## Security

- **Helmet** for security headers (XSS, HSTS, content sniffing, etc.)
- **httpOnly cookies** for JWT storage (not accessible from JavaScript)
- **Access token** expires in 1 hour, **refresh token** in 7 days
- **Secure + SameSite** cookie flags in production
- **Rate limiting**: auth (20/15min), geo (100/15min), share (10/15min)
- **GeoIP caching** — 24-hour TTL with lazy cleanup of stale entries
- **bcrypt** password hashing (10 salt rounds)
- **Zod** input validation on every endpoint
- **CORS** restricted to frontend origin with credentials
- **Request body limit** of 1kb (10kb for batch endpoint)
- **Env validation** at startup — missing secrets fail immediately
- **Cascade delete** — deleting a user removes all history and favorites
- **Ownership checks** — users can only access/delete their own favorites

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (hot reload via tsx) |
| `npm run build` | TypeScript compile |
| `npm start` | Run production build |
| `npm run seed` | Seed database |

## Deploy

Deployed on Render as a Node.js web service.

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm start` |

Set `DATABASE_URL`, `JWT_SECRET`, `REFRESH_SECRET`, and `FRONTEND_URL` in environment variables.
