/**
 * src/utils/asyncHandler.js
 *
 * Wraps an async Express route/middleware handler so rejected promises are
 * forwarded to next(err) instead of crashing the process or hanging the
 * request.
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
