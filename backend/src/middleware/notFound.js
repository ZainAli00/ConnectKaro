/**
 * src/middleware/notFound.js
 *
 * Catch-all for requests that matched no route. Mounted after all routes.
 */

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Not found' });
}

module.exports = notFound;
