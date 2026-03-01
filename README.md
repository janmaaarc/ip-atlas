# IP Atlas

Full-stack IP geolocation app. Look up any IPv4 address to see its location on a map, compare IPs side by side, batch lookup up to 25 at once, and manage search history and favorites.

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Client** | React 19, Vite 7, TypeScript, Tailwind CSS 4, Leaflet, Recharts |
| **Server** | Express 4, Prisma 6, PostgreSQL (Neon), JWT auth, Swagger/OpenAPI |

## Project Structure

```
client/   → React SPA (Vite)
server/   → Express REST API
```

See each folder's README for detailed docs:
- [client/README.md](client/README.md) — frontend setup, features, components
- [server/README.md](server/README.md) — API endpoints, database schema, security

## Quick Start

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npx prisma db seed
npm run dev             # http://localhost:8000
```

### 2. Client

```bash
cd client
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev             # http://localhost:5173
```

### Test Account

```
Email:    test@jlabs.com
Password: Password1
```

## Features

- **Single IP lookup** with auto-suggest from recent searches
- **Batch lookup** up to 25 IPs at once
- **Compare** two IPs side by side with diff highlighting
- **Interactive map** with fly-to animations, history pins, marker clustering, distance calculation, polyline, fullscreen, and street/satellite/dark tile toggle
- **Search history** with filter, bulk delete, pagination, date range presets, CSV/JSON export
- **Favorites** with labels, inline editing, and bulk delete
- **Analytics dashboard** with search trends, top countries, and top organizations (Recharts)
- **Shareable results** — generate 24-hour expiring links to share geo lookups publicly
- **Keyboard shortcuts** — Cmd+K to focus search, Cmd+Enter to submit
- **GeoIP caching** — 24-hour TTL cache layer for faster repeat lookups
- **Rate limiting** on geo, auth, and share endpoints
- **API documentation** at `/api/docs` (Swagger/OpenAPI)
- **Dark mode** with system preference detection
- **Auth** with httpOnly cookies, token refresh, password change, account deletion
