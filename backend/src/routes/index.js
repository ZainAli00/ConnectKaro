/**
 * src/routes/index.js
 *
 * Top-level API router, mounted at /api in app.js.
 *
 *   GET  /api/health           liveness check, no auth
 *   *    /api/public/*         customer-facing surface, no auth
 *   *    /api/admin/*          admin surface, auth applied per sub-route
 */

const express = require('express');

const publicRoutes = require('./public.routes');
const adminRoutes = require('./admin/index');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
