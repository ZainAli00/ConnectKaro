/**
 * src/features/orders/orderStatus.js
 *
 * Display constants for the order *lifecycle* enum (Order.status on the
 * backend, exposed to the frontend as `orderStatus` to avoid colliding with
 * the live-usage `status` field — see utils/constants.js STATUS_LABELS/
 * STATUS_TONE for that one). Kept separate on purpose: these two enums are
 * unrelated (an order can be ACTIVE with depleted usage, etc.).
 */

export const ORDER_STATUS_LABELS = {
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
};

/** Feeds ui/Badge's `tone` prop. */
export const ORDER_STATUS_TONE = {
  ACTIVE: 'good',
  CANCELLED: 'neutral',
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: ORDER_STATUS_LABELS.ACTIVE },
  { value: 'CANCELLED', label: ORDER_STATUS_LABELS.CANCELLED },
];
