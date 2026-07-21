/**
 * src/services/esimProvider/errors.js
 *
 * A single error type for anything that goes wrong talking to the eSIM
 * supplier, plus a helper that turns any raw thrown/rejected value into one
 * of these without ever leaking supplier-identifying text or raw upstream
 * error details to a client. The raw error is logged (scrubbed) server-side
 * only — errorHandler.js reads `.publicMessage`/`.statusCode` off whatever
 * bubbles up to it, so this shape plugs straight into the existing error
 * pipeline.
 */

const logger = require('../../utils/logger');

const DEFAULT_PUBLIC_MESSAGE =
  'Unable to retrieve eSIM usage right now. Please try again shortly.';

class EsimProviderError extends Error {
  constructor(publicMessage = DEFAULT_PUBLIC_MESSAGE, statusCode = 502, cause) {
    super(publicMessage);
    this.name = 'EsimProviderError';
    this.publicMessage = publicMessage;
    this.statusCode = statusCode;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/**
 * Wraps any error raised while calling out to the provider. Logs the raw
 * error (never its message text) server-side via logger.error, and returns
 * a fresh EsimProviderError carrying only a generic, connectkro-branded
 * public message — never provider-specific wording or upstream payloads.
 */
function wrapProviderError(err) {
  logger.error('eSIM provider call failed', err);
  return new EsimProviderError(DEFAULT_PUBLIC_MESSAGE, 502, err);
}

module.exports = { EsimProviderError, wrapProviderError, DEFAULT_PUBLIC_MESSAGE };
