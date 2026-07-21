/**
 * src/middleware/rateLimiters.js
 *
 * express-rate-limit instances used across the app:
 *   - publicLookupLimiter: throttles the public order-lookup endpoint.
 *   - adminLoginLimiter: throttles admin login attempts.
 *   - globalApiLimiter: broad safety net applied to all /api/* routes.
 */

const rateLimit = require('express-rate-limit');

const publicLookupLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please wait a few minutes and try again.',
  },
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a few minutes and try again.',
  },
});

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a few minutes and try again.',
  },
});

module.exports = { publicLookupLimiter, adminLoginLimiter, globalApiLimiter };
