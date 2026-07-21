/**
 * src/services/esimProvider/mockProvider.js
 *
 * Deterministic fake eSIM usage provider. Lets the rest of the app (and
 * anyone developing locally) build and test against realistic-looking usage
 * data without live supplier credentials. Selected via ESIM_PROVIDER=mock
 * (the default) — see index.js.
 *
 * "Deterministic" means the same iccid always maps to the same numbers: we
 * derive everything from a simple hash of the iccid string rather than
 * Math.random(), so repeated lookups for one order stay stable across calls.
 */

const PLAN_SIZES_KB = [1048576, 5242880, 10485760]; // 1GB, 5GB, 10GB in KB
const MIN_EXPIRY_DAYS_OUT = 20;
const MAX_EXPIRY_DAYS_OUT = 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Small, stable, non-cryptographic string hash (djb2 variant). Only used to
 * seed deterministic-looking mock numbers — never for anything security
 * sensitive.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Force unsigned 32-bit so downstream modulo math stays positive.
  return hash >>> 0;
}

function deriveStatus(remainingKb, hash) {
  // Mostly "active", with a deterministic minority of depleted/expired lines
  // so the mock data exercises every UI state.
  const bucket = hash % 10;
  if (remainingKb <= 0) return 'depleted';
  if (bucket === 0) return 'depleted';
  if (bucket === 1) return 'expired';
  return 'active';
}

async function getLineUsage(iccid) {
  const hash = hashString(String(iccid));

  const totalKb = PLAN_SIZES_KB[hash % PLAN_SIZES_KB.length];
  // Use a different slice of the hash space for usage so it isn't
  // correlated 1:1 with the plan-size pick above.
  const usedFraction = ((hash >>> 8) % 1000) / 1000; // 0.000 - 0.999
  const usedKb = Math.round(totalKb * usedFraction);
  const remainingKb = totalKb - usedKb;

  const status = deriveStatus(remainingKb, hash);

  const expiryDaysOut =
    MIN_EXPIRY_DAYS_OUT +
    ((hash >>> 16) % (MAX_EXPIRY_DAYS_OUT - MIN_EXPIRY_DAYS_OUT + 1));
  const expiryAt = new Date(Date.now() + expiryDaysOut * MS_PER_DAY).toISOString();

  return {
    totalKb,
    usedKb,
    remainingKb,
    status,
    expiryAt,
    raw: {},
  };
}

async function refillLine(iccid, amountKb) {
  return { success: true, raw: {} };
}

async function listBundles() {
  return [
    { id: 'mock-1gb-7d', label: '1GB / 7 days', totalKb: 1048576, days: 7 },
    { id: 'mock-3gb-15d', label: '3GB / 15 days', totalKb: 3145728, days: 15 },
    { id: 'mock-5gb-30d', label: '5GB / 30 days', totalKb: 5242880, days: 30 },
    { id: 'mock-10gb-30d', label: '10GB / 30 days', totalKb: 10485760, days: 30 },
  ];
}

module.exports = { getLineUsage, refillLine, listBundles };
