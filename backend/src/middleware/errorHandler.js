/**
 * src/middleware/errorHandler.js
 *
 * Central Express error handler. Services throw errors shaped like
 * `{ statusCode, publicMessage }` (see utils/asyncHandler.js for how async
 * route handlers forward rejections here). The full error is always logged
 * server-side (scrubbed); only a safe, generic message ever reaches the
 * client. err.stack and raw err.message are NEVER included in the response
 * body, in any environment — not even in development — so this behavior
 * can't drift if NODE_ENV is ever misconfigured.
 */

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const publicMessage = err.publicMessage || 'Something went wrong. Please try again.';

  logger.error('Unhandled error on', req.method, req.originalUrl, err);

  res.status(statusCode).json({
    success: false,
    message: publicMessage,
  });
}

module.exports = errorHandler;
