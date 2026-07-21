/**
 * src/middleware/requireAuth.js
 *
 * Protects /api/admin/* routes (other than login/refresh/logout). Expects
 * `Authorization: Bearer <accessToken>`. On any failure (missing header,
 * malformed token, expired/invalid signature) it forwards a generic 401 to
 * errorHandler.js rather than responding directly, so the response shape
 * stays consistent with every other error in the app.
 */

const authService = require('../services/authService');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next({
      statusCode: 401,
      publicMessage: 'Session expired. Please log in again.',
    });
  }

  try {
    const decoded = authService.verifyAccessToken(token);
    req.admin = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    next({
      statusCode: 401,
      publicMessage: 'Session expired. Please log in again.',
    });
  }
}

module.exports = requireAuth;
