# connectkro.pk — Order Lookup & Admin Dashboard

A customer-facing eSIM usage lookup page and an admin dashboard for managing orders, built as a full-stack app alongside connectkro.pk's existing marketing site.

## What's in this repo

| Path | What it is |
|---|---|
| `landing-page/` | The static marketing site (`connectkro.html` + `Logo.jpeg`) — plain HTML/CSS/JS, no build step, actively maintained |
| `backend/` | Express + PostgreSQL (Prisma) API |
| `frontend/` | React (Vite) single-page app |
| `docker-compose.yml` | Optional local Postgres for development |

`backend/` and `frontend/` don't share code or a build pipeline with `landing-page/connectkro.html` — but all three are served from **one domain, one Express process** (see "One-domain routing" below). `backend/src/staticSite.js` serves `landing-page/` directly (so `Logo.jpeg` is reachable at `/Logo.jpeg`, referenced by the page itself as its favicon) and hands off to the built React app for its two routes.

## One-domain routing

| Path | What loads |
|---|---|
| `/` | `landing-page/connectkro.html` — the static marketing page, served as-is |
| `/check-usage` | React app — public Order-ID usage lookup (no login) |
| `/dashboard` (and `/dashboard/*`) | React app — admin dashboard (login required) |
| `/api/*` | The Express API |

This works because `backend/src/staticSite.js` mounts three things onto the same Express app that already serves `/api/*`: a route for `/` that sends `landing-page/connectkro.html` (and serves the rest of `landing-page/` as static files, e.g. `Logo.jpeg`), static-file serving for the built frontend's JS/CSS (`frontend/dist/assets/*`), and a catch-all that sends `frontend/dist/index.html` for anything under `/check-usage` or `/dashboard` — React Router takes it from there client-side. One process, one origin, no CORS or cross-domain cookie complexity between the frontend and its own API.

It only activates once `frontend/dist` exists — run `npm run build` in `frontend/` first. Until then (or during day-to-day frontend development), keep using `npm run dev` in `frontend/` on its own port (:5173) with Vite's hot reload; that continues to work unchanged and proxies `/api` to the backend exactly as before.

**Deploying:** point your domain at wherever this one Express process runs (a VPS, Render, Railway, etc.) — see the "Environment variables" section below for what production needs. No subdomain or reverse proxy is required for the routing itself; add one only if you want to split things across multiple hosts.

## Features

- **Public Order-ID lookup** (`/check-usage`) — a customer enters their Order ID (no login) and sees destination, plan, status, and live data usage. No ICCID, customer name, or supplier information is ever exposed on this surface.
- **Admin login** (`/dashboard/login`) — email/password, JWT-based session (short-lived access token + httpOnly refresh cookie).
- **Full order management** (`/dashboard`) — create, list/search/filter, view, edit, and soft-delete orders from the admin dashboard.
- **Live usage sync with caching** — usage numbers are pulled from the eSIM provider and cached for a configurable TTL so the dashboard and lookup page stay fast; admins can force a live re-sync per order.
- **Dashboard stats** — order counts, a destination breakdown chart, and status data computed from cached data (no live provider calls on page load).

## Folder structure

```
connectKaro/
├── landing-page/
│   ├── connectkro.html            marketing site — inline CSS/JS, own light/dark toggle, no build step
│   └── Logo.jpeg                  brand mark — used as favicon, reachable at /Logo.jpeg
├── docker-compose.yml
├── backend/
│   ├── prisma/                    schema.prisma, seed.js, migrations/
│   └── src/
│       ├── server.js, app.js      entrypoint + Express app assembly
│       ├── staticSite.js          serves landing-page/ at "/" + the built React app at "/check-usage", "/dashboard"
│       ├── config/                env.js (zod-validated env), cors.js
│       ├── routes/                public.routes.js, admin/{auth,orders,stats}.routes.js
│       ├── controllers/           thin handlers, one per route group
│       ├── services/              orderService, usageSyncService, authService,
│       │                          statsService, orderIdGenerator, esimProvider/
│       ├── middleware/            requireAuth, rateLimiters, validateRequest, errorHandler
│       ├── validators/            zod schemas per route group
│       └── utils/                 logger.js, asyncHandler.js, constants.js
└── frontend/
    └── src/
        ├── styles/                tokens.css (brand tokens ported from connectkro.html)
        ├── theme/                 light/dark ThemeProvider
        ├── components/            ui/ (Button, Card, Modal, ...), layout/, dataviz/UsageMeter.jsx
        ├── features/              publicLookup/, auth/, orders/, dashboard/
        ├── pages/                 one file per route
        └── services/              apiClient.js + one file per API group
```

## Editing the landing page

`landing-page/connectkro.html` is a single self-contained file (inline `<style>`/`<script>`, no build step) — edit it directly and refresh. A few things worth knowing before you do:

- **Destinations & pricing** live in the `DEST` object (search for `const DEST = {`) — each entry has a `cov` coverage-description string and a `groups`/`cats`/`p` (packages) structure. A package's `trial:true` flag is what renders its gold "Try it first" ribbon.
- **Phone compatibility list** lives in the `DEVICES` object (search for `const DEVICES = {`) — one array per brand, rendered into columns automatically; add a brand by adding a new key, no other wiring needed. Brands beyond Apple/Samsung/Google Pixel get a plain colored-initial badge (see `brandIco`/`brandBadge`) rather than a hand-drawn logo — add a real SVG mark to `brandIco` if/when one's available.
- **Dark mode** is a self-contained toggle (`#themeToggle` button + the IIFE right after `const root = ...` near the top of the `<script>` block) — persists to `localStorage` under `ck-theme`, independent of the React app's own theme system.
- **Favicon/logo**: `Logo.jpeg` sits alongside the HTML in `landing-page/`; referenced with a plain relative path (`href="Logo.jpeg"`), so anything else dropped in that folder is reachable the same way once `staticSite.js` serves it.

## Prerequisites

- Node.js 20+
- PostgreSQL — either:
  - `docker compose up -d db` (uses `docker-compose.yml` at the repo root), or
  - a local or hosted Postgres instance (Neon, Supabase, Railway, etc.)

## Setup

```bash
# 1. Start Postgres (skip if using your own instance)
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env        # fill in secrets — see env reference below
npm install
npx prisma migrate dev      # creates tables
npm run seed                # creates the first admin user from SEED_ADMIN_* vars
npm run dev                 # http://localhost:4000

# 3. Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Visit `http://localhost:5173/check-usage` for the public lookup page, and `http://localhost:5173/dashboard/login` to sign in with the seeded admin credentials. (To instead test the merged one-domain setup — marketing page at `/`, app at `/check-usage` and `/dashboard`, all on :4000 — run `npm run build` in `frontend/` once, then hit `http://localhost:4000/`.)

## Environment variables

### `backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Port the Express server listens on |
| `NODE_ENV` | `development` / `production` / `test` |
| `DATABASE_URL` | Postgres connection string |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of origins allowed to call the API |
| `JWT_ACCESS_SECRET` | Signing secret for short-lived access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime (e.g. `1h`) |
| `JWT_REFRESH_SECRET` | Signing secret for the long-lived refresh token |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `30d`) |
| `SEED_ADMIN_EMAIL` | Email for the admin account created by `npm run seed` |
| `SEED_ADMIN_PASSWORD` | Password for that seeded admin account |
| `SEED_ADMIN_NAME` | Display name for that seeded admin account |
| `ESIM_PROVIDER` | `mock` (default) or `live` — which eSIM data source to use |
| `ESIM_SUPPLIER_BASE_URL` | Base URL for the live provider (only needed when `ESIM_PROVIDER=live`) |
| `ESIM_SUPPLIER_API_KEY` | Live provider credential (only needed when `ESIM_PROVIDER=live`) |
| `ESIM_SUPPLIER_ACCESS_TOKEN` | Live provider credential (only needed when `ESIM_PROVIDER=live`) |
| `USAGE_CACHE_TTL_SECONDS` | How long a synced usage figure is served from cache before the next lookup triggers a fresh sync |

### `frontend/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base path/URL the frontend calls for the API (proxied to the backend in dev) |

None of the values above are real secrets in this repo — copy `.env.example` in each app to `.env` and fill in your own.

## A note on the eSIM provider

`ESIM_PROVIDER` defaults to `mock`, which returns deterministic fake usage data. **The entire app — public lookup, admin dashboard, usage sync — is fully runnable and testable with no live provider credentials at all.**

When you're ready to go live, set `ESIM_PROVIDER=live` and fill in `ESIM_SUPPLIER_*`. The actual integration code lives entirely in `backend/src/services/esimProvider/keepgoClient.js` (raw HTTP calls, including the auth header wiring — currently marked TODO pending confirmed credentials) — that's the one file to edit to connect a real supplier account.
