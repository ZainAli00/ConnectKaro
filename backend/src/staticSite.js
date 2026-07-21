/**
 * src/staticSite.js
 *
 * Serves the marketing site AND the built React app from this same Express
 * process, so the whole product lives on one origin/domain:
 *   "/"            -> landing-page/connectkro.html (static marketing page)
 *   "/check-usage" -> the React SPA (public order lookup)
 *   "/dashboard"   -> the React SPA (admin, client-side routed from there)
 * "/api/*" is handled separately in app.js and is unaffected by this file.
 *
 * Requires `npm run build` to have been run in frontend/ first. If
 * frontend/dist doesn't exist yet, the SPA routes are simply skipped — this
 * keeps local dev (Vite on :5173 with its own /api proxy) unaffected; this
 * module only matters for a "one domain, one process" production-style run.
 */

const path = require('path');
const fs = require('fs');
const express = require('express');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LANDING_PAGE_DIR = path.join(REPO_ROOT, 'landing-page');
const MARKETING_HTML_PATH = path.join(LANDING_PAGE_DIR, 'connectkro.html');
const FRONTEND_DIST_DIR = path.join(REPO_ROOT, 'frontend', 'dist');
const SPA_INDEX_PATH = path.join(FRONTEND_DIST_DIR, 'index.html');

// The only two path prefixes this app's React Router owns (see frontend/src/App.jsx).
const SPA_PATH_PREFIXES = ['/check-usage', '/dashboard'];

function mountStaticSite(app) {
  if (fs.existsSync(MARKETING_HTML_PATH)) {
    app.get('/', (req, res) => {
      // connectkro.html relies entirely on inline <script>/<style> blocks
      // with no nonce — helmet's default script-src 'self' (set globally
      // above) would silently break every interactive feature on the page
      // (destination tabs, ticker, mobile menu, compatibility search).
      // Strip it for this one response only; every other route (API, the
      // React SPA) keeps the strict default CSP.
      res.removeHeader('Content-Security-Policy');
      res.sendFile(MARKETING_HTML_PATH);
    });

    // Logo.jpeg (and anything else dropped in landing-page/) referenced by
    // connectkro.html via a relative path, e.g. href="Logo.jpeg" — the page
    // is served at "/", so that resolves to "/Logo.jpeg" in the browser.
    app.use(express.static(LANDING_PAGE_DIR, { index: false }));
  }

  if (!fs.existsSync(SPA_INDEX_PATH)) {
    return;
  }

  // Serves /assets/* (and any other built file) — index:false so this
  // never auto-serves dist/index.html for a bare "/" request, which must
  // stay the marketing page above.
  app.use(express.static(FRONTEND_DIST_DIR, { index: false }));

  const spaRoutePatterns = SPA_PATH_PREFIXES.flatMap((prefix) => [prefix, `${prefix}/*`]);
  app.get(spaRoutePatterns, (req, res) => res.sendFile(SPA_INDEX_PATH));
}

module.exports = { mountStaticSite };
