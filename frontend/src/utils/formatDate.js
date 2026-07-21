/**
 * src/utils/formatDate.js
 *
 * Date formatting helpers for the public lookup feature.
 */

const EXPIRY_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * @param {string|null|undefined} isoStringOrNull
 * @returns {string} e.g. "12 Aug 2026", or "No expiry" when null/invalid.
 */
export function formatExpiry(isoStringOrNull) {
  if (!isoStringOrNull) return 'No expiry';
  const date = new Date(isoStringOrNull);
  if (Number.isNaN(date.getTime())) return 'No expiry';
  return EXPIRY_FORMATTER.format(date);
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * @param {string|null|undefined} isoString
 * @returns {string} e.g. "Updated just now" / "Updated 4 min ago" /
 *   "Updated 3 hr ago" / "Updated 2 days ago".
 */
export function formatRelativeSync(isoString) {
  if (!isoString) return 'Updated recently';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Updated recently';

  // Clamp negative diffs (clock skew / just-issued timestamps) to 0 rather
  // than showing a nonsensical "-2 min ago".
  const diffMs = Math.max(0, Date.now() - date.getTime());

  if (diffMs < MINUTE_MS) return 'Updated just now';
  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `Updated ${minutes} min ago`;
  }
  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `Updated ${hours} hr ago`;
  }
  const days = Math.floor(diffMs / DAY_MS);
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
}
