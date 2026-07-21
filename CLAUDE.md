# CLAUDE.md

Guidance for Claude Code (or any agent) working in this repo.

## Project summary

connectkro.pk sells travel eSIMs. This repo holds the static marketing site (`landing-page/connectkro.html` — plain HTML/CSS/JS, no build step, actively maintained but NOT part of the React build pipeline) plus a full-stack app: a public Order-ID usage lookup page and an admin dashboard for managing orders, backed by an Express/PostgreSQL API. Order fulfillment data (data usage, plan status) is sourced from a third-party eSIM reseller, but the reseller's identity must never be visible to a customer or a competitor inspecting the site.

## HARD INVARIANT — supplier isolation

**Never reference Keepgo/eSIMba by name outside `backend/src/services/esimProvider/keepgoClient.js` and `backend/src/services/esimProvider/keepgoProvider.js`.** Not in frontend code, not in API responses, not in error messages, not in client-visible logs, not in comments elsewhere, not in commit-adjacent docs describing behavior.

Verify before considering any change to this area done:

```bash
grep -rniE "keepgo|esimba" backend/src frontend/src
```

Expected matches: only inside `keepgoClient.js` and `keepgoProvider.js` (including a `require('./keepgoClient')`/`require('./keepgoProvider')` reference from the provider factory in `esimProvider/index.js` and from `utils/logger.js`'s redaction import — those are module-path references to the two allowed files, not new leaks; everything else that greps positive is a real violation to fix).

All provider errors are wrapped into a generic, connectkro-branded `EsimProviderError` (`services/esimProvider/errors.js`) before they can reach a controller or client — raw upstream error text is logged server-side only, through `logger.js`'s `scrub()`, which redacts the supplier name and credential values as defense in depth even if something upstream leaks.

## Architecture

```
React SPA (frontend/)  <-->  Express API (backend/)  <-->  PostgreSQL (Prisma)
                                     |
                                     '--> esimProvider/index.js (factory)
                                              |
                                    mock (default) | live (Keepgo, server-side only)
```

One domain, one Express process in production — see `backend/src/staticSite.js`. This app owns only `/check-usage` and `/dashboard/*` (client-side routed by React Router from there); `/` is `landing-page/connectkro.html`, served directly by the same Express app. `/api/*` is the API. This is why `frontend/src/App.jsx`'s routes are `/check-usage` and `/dashboard/*`, not `/` — `/` belongs to the marketing page, not this SPA. Any `<Link>`/`navigate()` back to the real site root must use a plain `<a>` (via `Logo`'s or `Button`'s `external` prop), never React Router — this app has no route for `/`, so a client-side `<Link to="/">` would just render the in-app 404 instead of leaving the SPA.

Helmet's default CSP (`script-src 'self'`, no `'unsafe-inline'`) would silently break every inline `<script>` in `connectkro.html` (destination tabs, ticker, mobile menu, compatibility search, the dark-mode toggle — the whole page's interactivity). `staticSite.js` strips the CSP header on the `/` response only; every other route (API, the SPA) keeps the strict default. Don't remove that strip, and don't loosen CSP globally to work around it.

`landing-page/` also holds `Logo.jpeg` (the brand mark — used as the page's favicon, and available at `/Logo.jpeg` since `staticSite.js` serves the whole `landing-page/` folder as static files). Anything else dropped into `landing-page/` becomes reachable the same way, referenced with a plain relative path from inside `connectkro.html`.

- The frontend never talks to the eSIM provider directly — only to the Express API.
- Within the backend, only `services/esimProvider/index.js` is imported by the rest of the app (`usageSyncService.js`). It picks `mockProvider.js` or `keepgoProvider.js` based on `ESIM_PROVIDER`. Nothing outside `esimProvider/` imports `keepgoClient.js` or `keepgoProvider.js` directly.
- `orderService.js` (order CRUD) and `usageSyncService.js` (cache-then-provider usage logic) are deliberately separate — order writes never trigger a provider call, and usage sync never does raw order field writes.

## Folder map

```
backend/
├── prisma/                schema.prisma, seed.js
└── src/
    ├── server.js, app.js      entrypoint / Express app assembly (helmet, cors, rate limits, error handler)
    ├── staticSite.js          serves landing-page/ at "/" (CSP stripped, see Architecture) + frontend/dist at "/check-usage", "/dashboard" — no-op until `npm run build` has run in frontend/
    ├── config/                env.js (zod-validated env — the only place process.env is read directly), cors.js
    ├── routes/                public.routes.js, admin/{auth,orders,stats}.routes.js
    ├── controllers/           thin handlers, one file per route group
    ├── services/
    │   ├── orderService.js        order CRUD (create/list/get/update/soft-delete)
    │   ├── usageSyncService.js    cache-then-provider logic, writes usage cache + UsageSnapshot history
    │   ├── authService.js         credential check, JWT issue/verify, tokenVersion revocation
    │   ├── statsService.js        dashboard aggregates from cached data only
    │   ├── orderIdGenerator.js    generates public Order IDs (collision-retry)
    │   └── esimProvider/          index.js (factory), keepgoClient.js, keepgoProvider.js, mockProvider.js, errors.js
    ├── middleware/             requireAuth, rateLimiters, validateRequest, errorHandler, notFound
    ├── validators/             zod schemas, one set per route group
    └── utils/                  logger.js (redacted logging), asyncHandler.js, constants.js (destinations list)

frontend/src/
├── styles/                 tokens.css — brand CSS variables ported from connectkro.html, plus dark mode
├── theme/                  ThemeProvider + light/dark toggle
├── components/
│   ├── ui/                     Button, Card, Input, Select, Badge, Spinner, Modal, ToastProvider, EmptyState
│   ├── layout/                 PublicLayout vs AdminLayout (Sidebar, Topbar)
│   └── dataviz/UsageMeter.jsx  see the `dataviz` skill note below
├── features/               publicLookup/, auth/, orders/, dashboard/ (components + hooks, grouped by feature)
├── pages/                  one file per route
└── services/               apiClient.js (axios, 401 -> silent refresh -> retry) + one file per API group
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the authoritative list. No real values here — reference only.

**Backend:** `PORT`, `NODE_ENV`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`, `ESIM_PROVIDER` (`mock`|`live`), `ESIM_SUPPLIER_BASE_URL`, `ESIM_SUPPLIER_API_KEY`, `ESIM_SUPPLIER_ACCESS_TOKEN`, `USAGE_CACHE_TTL_SECONDS`.

**Frontend:** `VITE_API_BASE_URL`.

`backend/src/config/env.js` validates all of these with zod at process startup and exits fast on a bad/missing value — nothing else in the backend reads `process.env` directly.

## Conventions used in this codebase

- **CommonJS on the backend** (`require`/`module.exports`), **ES modules on the frontend** (`import`/`export`) — matches each app's `package.json` `type` field. Don't mix.
- **~500-line soft cap per file.** If a file is approaching it, split by responsibility rather than growing it further.
- **Thin controllers, logic in services.** Controllers parse `req`, call a service function, shape the response. Business logic (CRUD rules, caching, auth, aggregation) lives in `src/services/*`.
- **zod validation at every route boundary.** Every route that accepts a body/query runs it through `middleware/validateRequest.js` against a schema in `src/validators/` before the controller sees it.
- **Soft-delete, not hard-delete, on `Order`.** Deleting an order sets `deletedAt`; it's excluded from default list/lookup queries but never physically removed. Don't add a hard-delete path without discussing it first — it breaks the audit trail (`UsageSnapshot` rows still reference the order).
- **Redacted logging.** Always log through `utils/logger.js` (`info`/`warn`/`error`), not raw `console.*`, in backend code — its `scrub()` helper strips supplier name and credential values from anything logged, as a defense-in-depth backstop for the hard invariant above.

## Running locally

```bash
docker compose up -d db                 # or point DATABASE_URL at your own Postgres

cd backend && cp .env.example .env      # fill in secrets
npm install
npx prisma migrate dev
npm run seed
npm run dev                             # http://localhost:4000

cd ../frontend && cp .env.example .env
npm install
npm run dev                             # http://localhost:5173
```

## Adding another admin

There is no public registration route, by design — the only way to provision an admin account is `backend/prisma/seed.js`. It upserts by email, so it's safe to re-run. To add another admin, either:
- run it again with different `SEED_ADMIN_*` env values, or
- extend `seed.js` to accept/loop over a small list of admins.

## Dataviz

Any change touching `frontend/src/components/dataviz/UsageMeter.jsx` (or adding another chart/meter component) must go through the project's `dataviz` skill first for color, contrast, and light/dark rules — don't freehand a new palette or meter style.

## Manual verification checklist

A full end-to-end manual test checklist (health check, login, order creation, public lookup PII/supplier-leak check, rate limiting, token refresh, soft-delete, dark mode, the supplier-name grep, and the live-provider cutover steps) lives in the approved plan file: `/Users/huzaifabinshahid/.claude/plans/i-have-added-a-glimmering-locket.md` (see "Verification (manual end-to-end)"). Run through it after any change touching auth, the public lookup response shape, or the provider adapter.
