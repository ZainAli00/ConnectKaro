/**
 * src/services/esimProvider/keepgoProvider.js
 *
 * Implements the same provider interface as mockProvider.js, backed by the
 * real Keepgo/eSIMba API via keepgoClient.js. This file (and keepgoClient.js)
 * are the ONLY two files in the codebase allowed to reference
 * "Keepgo"/"eSIMba" — see CLAUDE.md for the hard invariant. Selected via
 * ESIM_PROVIDER=keepgo (see index.js).
 *
 * Every function here normalizes Keepgo's raw response shape into the
 * generic { totalKb, usedKb, remainingKb, status, expiryAt, raw } shape the
 * rest of the app depends on, and wraps every failure in
 * errors.wrapProviderError so no raw supplier error/message ever escapes to
 * a controller or client.
 */

const keepgoClient = require('./keepgoClient');
const { wrapProviderError } = require('./errors');

/**
 * Confirmed fields (from Keepgo's own public eSIMba docs): allowed_usage_kb
 * (total), active_kb (used), remaining_usage_kb (left).
 *
 * Status/expiry field names are UNCONFIRMED — the real API doc PDF wasn't
 * available to check. We read a handful of plausible keys defensively and
 * fall back to deriving a status from remainingKb, and to a null expiry, if
 * none of them match. CONFIRM these against the real Keepgo/eSIMba API docs
 * before relying on them.
 */
function mapLineDetailsToUsage(raw) {
  const totalKb = Number(raw.allowed_usage_kb) || 0;
  const usedKb = Number(raw.active_kb) || 0;
  const remainingKb =
    raw.remaining_usage_kb !== undefined && raw.remaining_usage_kb !== null
      ? Number(raw.remaining_usage_kb)
      : totalKb - usedKb;

  // Unconfirmed field names — best-effort guesses, first match wins.
  const rawStatus = raw.status || raw.line_status || null;
  const rawExpiry =
    raw.expire_at || raw.expiry_date || raw.expires_at || null;

  const status = rawStatus || (remainingKb <= 0 ? 'depleted' : 'active');
  const expiryAt = rawExpiry ? new Date(rawExpiry).toISOString() : null;

  return {
    totalKb,
    usedKb,
    remainingKb,
    status,
    expiryAt,
    raw,
  };
}

async function getLineUsage(iccid) {
  try {
    const raw = await keepgoClient.getLineDetails(iccid);
    return mapLineDetailsToUsage(raw);
  } catch (err) {
    throw wrapProviderError(err);
  }
}

async function refillLine(iccid, amountKb) {
  try {
    const raw = await keepgoClient.postRefill(iccid, amountKb);
    return { success: true, raw };
  } catch (err) {
    throw wrapProviderError(err);
  }
}

async function listBundles() {
  try {
    const raw = await keepgoClient.getBundles();
    return raw;
  } catch (err) {
    throw wrapProviderError(err);
  }
}

module.exports = { getLineUsage, refillLine, listBundles };
