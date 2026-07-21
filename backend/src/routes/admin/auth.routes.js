/**
 * src/routes/admin/auth.routes.js
 *
 * POST /api/admin/auth/login
 * POST /api/admin/auth/refresh
 * POST /api/admin/auth/logout
 * GET  /api/admin/auth/me
 */

const express = require('express');

const { adminLoginLimiter } = require('../../middleware/rateLimiters');
const { validate } = require('../../middleware/validateRequest');
const requireAuth = require('../../middleware/requireAuth');
const { loginSchema } = require('../../validators/auth.schema');
const controller = require('../../controllers/auth.controller');

const router = express.Router();

router.post('/login', adminLoginLimiter, validate({ body: loginSchema }), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);

module.exports = router;
