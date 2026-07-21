/**
 * src/config/cors.js
 *
 * Builds the options object passed to the `cors` middleware. Only origins
 * explicitly listed in config.corsAllowedOrigins are reflected back; any
 * other origin is rejected (the cors package treats `false` as "no CORS
 * headers for this origin", the browser then blocks the response).
 */

function buildCorsOptions(config) {
  const allowedOrigins = config.corsAllowedOrigins;

  return {
    origin(origin, callback) {
      // Allow non-browser / same-origin requests that send no Origin header
      // (curl, server-to-server health checks, etc.).
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  };
}

module.exports = { buildCorsOptions };
