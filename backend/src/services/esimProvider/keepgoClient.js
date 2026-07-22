/**
 * src/services/esimProvider/keepgoClient.js
 *
 * Low-level HTTP layer for the Keepgo/eSIMba reseller API. This file (and
 * keepgoProvider.js) are the ONLY two files in the codebase allowed to
 * reference "Keepgo"/"eSIMba" — see CLAUDE.md for the hard invariant. Every
 * other module must go through services/esimProvider/index.js, which never
 * mentions the supplier by name.
 *
 * Nothing here is wired up as the active provider unless ESIM_PROVIDER=keepgo
 * (see index.js / config/env.js). Endpoint paths below follow the naming
 * noted in the integration plan; only `/line/:iccid/get_details` is
 * confirmed against Keepgo's own public eSIMba API documentation. Everything
 * else is a reasonable-guess placeholder to be corrected once the full API
 * doc PDF is available.
 */

const axios = require('axios');

const { config } = require('../../config/env');

const client = axios.create({
  baseURL: config.esimSupplier.baseUrl,
  timeout: 15000,
});

/**
 * TODO(connectkro): exact Keepgo auth header wiring not yet confirmed. The
 * MyAccount API Credentials page shows two separate secret values — an
 * "API Key" (config.esimSupplier.apiKey) and an "Access Token"
 * (config.esimSupplier.accessToken) — but how they combine into request
 * headers (two headers? one header with a delimiter? request signing?) is
 * unconfirmed. The placeholder below sends both as separate headers as a
 * reasonable starting guess; CORRECT THIS once confirmed from the eSIMba
 * API Documentation PDF's Authentication section.
 */
function buildAuthHeaders() {
  return {
    'apiKey': config.esimSupplier.apiKey,
    'accessToken': config.esimSupplier.accessToken,
  };
}

/**
 * Case-insensitive pattern for supplier-identifying vocabulary, kept ONLY in
 * this file per the hard invariant in CLAUDE.md. Exported as a predicate
 * (never the pattern itself) so utils/logger.js can use it as a
 * defense-in-depth redaction check without the literal supplier name ever
 * appearing in any other module's source.
 */
const SUPPLIER_NAME_PATTERN = /keepgo|esimba/i;

function containsSupplierName(str) {
  return typeof str === 'string' && SUPPLIER_NAME_PATTERN.test(str);
}

/**
 * Confirmed from Keepgo's own public docs — leave this path as-is.
 */
async function getLineDetails(iccid) {
  const res = await client.get(`/line/${iccid}/get_details`, {
    headers: buildAuthHeaders(),
  });
  return res.data;
}

// --- Stubs below: not wired to anything yet, kept for future use. Endpoint
// names follow the plan file's Keepgo section; unconfirmed against the full
// API doc PDF, same as buildAuthHeaders() above. ---

async function postRefill(iccid, amountKb) {
  const res = await client.post(
    `/line/${iccid}/refill`,
    { amount_kb: amountKb },
    { headers: buildAuthHeaders() }
  );
  return res.data;
}

async function getBundles() {
  const res = await client.get('/bundles', { headers: buildAuthHeaders() });
  return res.data;
}

async function getCountries() {
  const res = await client.get('/countries', { headers: buildAuthHeaders() });
  return res.data;
}

async function getAccountBalance() {
  const res = await client.get('/account_balance', { headers: buildAuthHeaders() });
  return res.data;
}

async function getNetworkProviders() {
  const res = await client.get('/network_providers', { headers: buildAuthHeaders() });
  return res.data;
}

async function getRegions() {
  const res = await client.get('/regions', { headers: buildAuthHeaders() });
  return res.data;
}

module.exports = {
  getLineDetails,
  postRefill,
  getBundles,
  getCountries,
  getAccountBalance,
  getNetworkProviders,
  getRegions,
  containsSupplierName,
};
