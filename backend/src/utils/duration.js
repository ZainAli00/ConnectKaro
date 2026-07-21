/**
 * src/utils/duration.js
 *
 * Tiny duration-string → milliseconds parser for values like the ones used
 * in JWT_REFRESH_EXPIRES_IN (e.g. "30d", "1h", "15m", "60s"). Supports a
 * bare number of seconds too (jsonwebtoken's own convention), and a bare
 * "<n>ms" form for completeness.
 */

const UNIT_TO_MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

function msFromDuration(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value * 1000; // bare numbers are treated as seconds, per jsonwebtoken convention
  }

  if (typeof value !== 'string') {
    throw new TypeError(`msFromDuration: unsupported value ${value}`);
  }

  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)$/i.exec(trimmed);
  if (!match) {
    throw new TypeError(`msFromDuration: cannot parse duration "${value}"`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  return Math.round(amount * UNIT_TO_MS[unit]);
}

module.exports = { msFromDuration };
