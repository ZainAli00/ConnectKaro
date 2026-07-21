/**
 * src/routes/public.routes.js
 *
 * POST /api/public/lookup
 * GET  /api/public/destinations
 *
 * Unauthenticated by design (this is the customer-facing surface); the
 * lookup route is rate-limited to slow down order-ID enumeration attempts.
 */

const express = require('express');

const { publicLookupLimiter } = require('../middleware/rateLimiters');
const { validate } = require('../middleware/validateRequest');
const { lookupSchema } = require('../validators/publicLookup.schema');
const publicLookupController = require('../controllers/publicLookup.controller');
const destinationsController = require('../controllers/destinations.controller');

const router = express.Router();

router.post(
  '/lookup',
  publicLookupLimiter,
  validate({ body: lookupSchema }),
  publicLookupController.lookup
);

router.get('/destinations', destinationsController.list);

module.exports = router;
