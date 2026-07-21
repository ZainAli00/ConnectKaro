/**
 * src/app.js
 *
 * Assembles the Express application: global middleware, the mounted route
 * tree, and the error-handling tail. Exported for server.js to listen on
 * and for tests to import without binding a port.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { config } = require('./config/env');
const { buildCorsOptions } = require('./config/cors');
const { globalApiLimiter } = require('./middleware/rateLimiters');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes/index');
const { mountStaticSite } = require('./staticSite');

const app = express();

app.use(helmet());
app.use(cors(buildCorsOptions(config)));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Everything lives under /api. globalApiLimiter is a broad outer safety net;
// the route-specific limiters in rateLimiters.js (login, public lookup)
// still apply additionally on top of this for their own endpoints.
app.use('/api', globalApiLimiter, routes);

// Marketing page ("/") + the built React app ("/check-usage", "/dashboard")
// — see staticSite.js. No-op if frontend/dist hasn't been built yet.
mountStaticSite(app);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
