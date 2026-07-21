/**
 * src/routes/admin/index.js
 *
 * Mounts every admin sub-router under /api/admin.
 *
 * requireAuth is NOT applied here — auth.routes.js is intentionally
 * unprotected (it contains the login/refresh/logout endpoints themselves,
 * plus /me which guards itself), while orders.routes.js and stats.routes.js
 * already apply requireAuth internally on their own routes.
 */

const express = require('express');

const authRoutes = require('./auth.routes');
const ordersRoutes = require('./orders.routes');
const statsRoutes = require('./stats.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/orders', ordersRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
