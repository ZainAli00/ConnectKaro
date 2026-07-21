/**
 * src/services/usageSyncService.js
 *
 * Cache-then-provider logic for eSIM usage data. Reads/writes only the
 * Order.lastUsage* cache columns and UsageSnapshot rows — order CRUD itself
 * lives in orderService.js and is never touched here. Every real provider
 * call (i.e. every cache miss) is recorded as a UsageSnapshot row, which
 * doubles as an audit trail of actual supplier calls.
 *
 * The only import from services/esimProvider/ is the factory (index.js) —
 * never any concrete provider implementation directly — so this file never
 * needs to know (and never does know) which provider is active.
 */

const prisma = require('../prismaClient');
const provider = require('./esimProvider');
const logger = require('../utils/logger');
const { config } = require('../config/env');

const CACHE_TTL_MS = config.usageCacheTtlSeconds * 1000;

function isFresh(order) {
  return Boolean(
    order.lastUsageSyncedAt &&
      Date.now() - order.lastUsageSyncedAt.getTime() < CACHE_TTL_MS
  );
}

function hasCachedUsage(order) {
  return Boolean(order.lastUsageSyncedAt);
}

/**
 * Calls the provider for fresh usage, persists it onto the order row and as
 * a UsageSnapshot (both in one transaction), and returns the updated order.
 */
async function fetchAndPersistUsage(order) {
  const usage = await provider.getLineUsage(order.iccid);

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        lastUsageTotalKb: usage.totalKb,
        lastUsageUsedKb: usage.usedKb,
        lastUsageRemainingKb: usage.remainingKb,
        lastUsageStatus: usage.status,
        lastUsageExpiryAt: usage.expiryAt ? new Date(usage.expiryAt) : null,
        lastUsageSyncedAt: new Date(),
      },
    }),
    prisma.usageSnapshot.create({
      data: {
        orderId: order.id,
        totalKb: usage.totalKb,
        usedKb: usage.usedKb,
        remainingKb: usage.remainingKb,
        status: usage.status,
        expiryAt: usage.expiryAt ? new Date(usage.expiryAt) : null,
      },
    }),
  ]);

  return updatedOrder;
}

/**
 * Returns the order with fresh usage data, hitting the provider only if the
 * cached value is missing or older than CACHE_TTL_MS. On provider failure:
 * if a cached value already exists, degrade gracefully by logging and
 * returning the stale cached order rather than failing the request; if no
 * cached value exists yet, the provider error propagates (there is nothing
 * useful to show instead).
 */
async function syncIfStale(order) {
  if (isFresh(order)) {
    return order;
  }

  try {
    return await fetchAndPersistUsage(order);
  } catch (err) {
    if (hasCachedUsage(order)) {
      logger.error(
        'Usage sync failed; serving stale cached usage for order',
        order.orderId,
        err
      );
      return order;
    }
    throw err;
  }
}

/**
 * Same as syncIfStale but always hits the provider, ignoring the cache TTL.
 * Used by the admin "refresh usage" action.
 */
async function forceRefresh(order) {
  try {
    return await fetchAndPersistUsage(order);
  } catch (err) {
    if (hasCachedUsage(order)) {
      logger.error(
        'Forced usage refresh failed; serving stale cached usage for order',
        order.orderId,
        err
      );
      return order;
    }
    throw err;
  }
}

function deriveStatusLabel(order) {
  if (order.lastUsageRemainingKb !== null && order.lastUsageRemainingKb <= 0) {
    return 'depleted';
  }
  if (order.lastUsageExpiryAt && order.lastUsageExpiryAt.getTime() < Date.now()) {
    return 'expired';
  }
  if (order.lastUsageSyncedAt) {
    return 'active';
  }
  return 'unknown';
}

function kbToGb(kb) {
  return kb == null ? null : Math.round((kb / 1024 / 1024) * 100) / 100;
}

function percentRemaining(order) {
  const totalKb = order.lastUsageTotalKb;
  const remainingKb = order.lastUsageRemainingKb;
  if (!totalKb || totalKb <= 0 || remainingKb == null) {
    return 0;
  }
  return Math.round((remainingKb / totalKb) * 100);
}

/**
 * Customer-facing shape. Deliberately excludes iccid, customerName,
 * customerContact, notes, and any raw provider payload.
 */
function toPublicUsageShape(order) {
  return {
    orderId: order.orderId,
    destinationLabel: order.destinationLabel,
    planLabel: order.planLabel,
    status: deriveStatusLabel(order),
    totalGb: kbToGb(order.lastUsageTotalKb),
    usedGb: kbToGb(order.lastUsageUsedKb),
    remainingGb: kbToGb(order.lastUsageRemainingKb),
    percentRemaining: percentRemaining(order),
    expiryAt: order.lastUsageExpiryAt,
    lastSyncedAt: order.lastUsageSyncedAt,
  };
}

/**
 * Admin-facing shape: everything in toPublicUsageShape plus identifying and
 * lifecycle fields. The order lifecycle enum (ACTIVE/CANCELLED) is exposed
 * as `orderStatus` to avoid colliding with the usage-derived `status` field.
 */
function toAdminUsageShape(order) {
  return {
    ...toPublicUsageShape(order),
    id: order.id,
    iccid: order.iccid,
    customerName: order.customerName,
    customerContact: order.customerContact,
    notes: order.notes,
    orderStatus: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

module.exports = {
  isFresh,
  syncIfStale,
  forceRefresh,
  deriveStatusLabel,
  toPublicUsageShape,
  toAdminUsageShape,
};
