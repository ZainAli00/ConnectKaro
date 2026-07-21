/**
 * src/utils/constants.js
 *
 * Display constants for the public lookup feature. Keys mirror the
 * `status` enum on the backend's public lookup response
 * ('active' | 'depleted' | 'expired' | 'unknown').
 */

export const STATUS_LABELS = {
  active: 'Active',
  depleted: 'Data depleted',
  expired: 'Expired',
  unknown: 'Status unknown',
};

/**
 * Feeds the ui/Badge `tone` prop. Note: 'neutral' is a valid Badge tone
 * (styled with the generic --line/--muted tokens) but is NOT a valid
 * dataviz/UsageMeter tone — UsageMeter only understands
 * 'good' | 'warning' | 'critical' per its own spec. Callers driving
 * UsageMeter must remap 'neutral' to one of those three (see
 * UsageResultCard's toMeterTone helper) rather than passing it straight
 * through.
 */
export const STATUS_TONE = {
  active: 'good',
  depleted: 'critical',
  expired: 'critical',
  unknown: 'neutral',
};
