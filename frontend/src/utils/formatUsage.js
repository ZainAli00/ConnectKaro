/**
 * src/utils/formatUsage.js
 *
 * Formatting/guard helpers for eSIM data-usage values (GB), shared by
 * UsageMeter's caller (UsageResultCard) and any other data-usage display.
 */

/**
 * @param {number|string|null|undefined} value
 * @returns {string} e.g. "4.32 GB" (2 decimals), or "—" when the value is
 *   missing/not a number.
 */
export function formatGb(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${num.toFixed(2)} GB`;
}

/**
 * Clamps a percentage into the 0-100 range UsageMeter expects, guarding
 * against any unexpected upstream value (missing, negative, >100 from a
 * rounding edge case, etc.) before it reaches the meter's width/aria-valuenow.
 *
 * @param {number|string|null|undefined} value
 * @returns {number} an integer in [0, 100]
 */
export function clampPercent(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}
