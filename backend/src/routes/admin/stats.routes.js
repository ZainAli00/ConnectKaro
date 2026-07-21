/**
 * src/routes/admin/stats.routes.js
 *
 * GET /api/admin/stats
 */

const express = require('express');

const requireAuth = require('../../middleware/requireAuth');
const controller = require('../../controllers/stats.controller');

const router = express.Router();

router.get('/', requireAuth, controller.get);

module.exports = router;
