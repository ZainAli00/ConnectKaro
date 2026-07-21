/**
 * src/server.js
 *
 * Entry point: binds the assembled Express app to config.port.
 */

const app = require('./app');
const { config } = require('./config/env');

app.listen(config.port, () => {
  console.log(`connectkro backend listening on :${config.port}`);
});
