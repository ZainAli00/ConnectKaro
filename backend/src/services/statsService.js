/**
 * src/services/statsService.js
 *
 * Dashboard aggregate numbers for the admin home page. Reads exclusively
 * from already-cached Order columns via Prisma — never calls the eSIM
 * provider, so this endpoint stays cheap and fast regardless of provider
 * latency/availability.
 */

const prisma = require('../prismaClient');
const { DESTINATIONS } = require('../utils/constants');

const FLAG_BY_CODE = new Map(DESTINATIONS.map((d) => [d.code, d.flag]));

const RECENT_ORDERS_LIMIT = 5;
const DESTINATION_BREAKDOWN_LIMIT = 8;
const EXPIRING_SOON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

async function getDashboardStats() {
  const now = new Date();
  const expiringSoonCutoff = new Date(now.getTime() + EXPIRING_SOON_WINDOW_MS);

  const [totalOrders, activeLinesCount, expiringSoonCount, recentOrders, destinationGroups] =
    await Promise.all([
      prisma.order.count({
        where: { deletedAt: null },
      }),
      prisma.order.count({
        where: { deletedAt: null, status: 'ACTIVE' },
      }),
      prisma.order.count({
        where: {
          deletedAt: null,
          lastUsageExpiryAt: { gte: now, lte: expiringSoonCutoff },
        },
      }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: RECENT_ORDERS_LIMIT,
        select: {
          id: true,
          orderId: true,
          customerName: true,
          destinationLabel: true,
          planLabel: true,
          createdAt: true,
        },
      }),
      prisma.order.groupBy({
        by: ['destinationCode', 'destinationLabel'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

  const ordersByDestination = destinationGroups
    .map((group) => ({
      destinationCode: group.destinationCode,
      destinationLabel: group.destinationLabel,
      flag: FLAG_BY_CODE.get(group.destinationCode) || '🌍',
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, DESTINATION_BREAKDOWN_LIMIT);

  return {
    totalOrders,
    activeLinesCount,
    expiringSoonCount,
    recentOrders,
    ordersByDestination,
  };
}

module.exports = { getDashboardStats };
