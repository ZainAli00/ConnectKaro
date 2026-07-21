/**
 * src/utils/logger.js
 *
 * Minimal console-based logger plus a scrub() helper used as a defense-in-depth
 * safety net: even if some other module accidentally logs a value that contains
 * supplier-identifying text or a live provider credential, scrub() redacts it
 * before it reaches stdout/stderr. The provider name itself is only ever
 * *referenced* here as a redaction pattern — it is never emitted.
 *
 * The real isolation boundary lives in the two files named in CLAUDE.md's
 * hard invariant under services/esimProvider/; this module exists purely as
 * a fallback in case a string leaks elsewhere, and imports its redaction
 * predicate from there rather than hardcoding any supplier name itself.
 */

const { config } = require('../config/env');
const { containsSupplierName } = require('../services/esimProvider/keepgoClient');

function secretValues() {
  return [config.esimSupplier.apiKey, config.esimSupplier.accessToken].filter(
    (value) => typeof value === 'string' && value.length > 0
  );
}

function redactString(str) {
  let result = str;

  if (containsSupplierName(result)) {
    return '[REDACTED]';
  }

  for (const secret of secretValues()) {
    if (result.includes(secret)) {
      result = result.split(secret).join('[REDACTED]');
    }
  }

  return result;
}

/**
 * Recursively scrubs strings out of arbitrary values (strings, errors,
 * arrays, plain objects) before they are logged.
 */
function scrub(value) {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (value instanceof Error) {
    const scrubbed = new Error(redactString(value.message || ''));
    scrubbed.name = value.name;
    if (value.stack) {
      scrubbed.stack = redactString(value.stack);
    }
    return scrubbed;
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrub(item));
  }

  if (value && typeof value === 'object') {
    const scrubbedObj = {};
    for (const [key, val] of Object.entries(value)) {
      scrubbedObj[key] = scrub(val);
    }
    return scrubbedObj;
  }

  return value;
}

function info(...args) {
  console.log('[info]', ...args.map(scrub));
}

function warn(...args) {
  console.warn('[warn]', ...args.map(scrub));
}

function error(...args) {
  console.error('[error]', ...args.map(scrub));
}

module.exports = { info, warn, error, scrub };
