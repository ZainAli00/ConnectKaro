/**
 * src/services/orderService.js
 *
 * Pure Prisma CRUD for orders. No eSIM provider calls happen here — usage
 * refresh is wired up against services/esimProvider/* in the
 * provider-adapter stage.
 */

const prisma = require('../prismaClient');
const { DESTINATIONS } = require('../utils/constants');
const { generateOrderId } = require('./orderIdGenerator');

// Fields an admin may change after an order already exists. iccid and
// orderId are deliberately excluded — they are set once at creation and
// never editable.
const EDITABLE_SIMPLE_FIELDS = [
  'customerName',
  'customerContact',
  'planLabel',
  'notes',
  'status',
];

function findDestination(destinationCode) {
  return DESTINATIONS.find((destination) => destination.code === destinationCode);
}

function isUniqueConstraintOnIccid(err) {
  return (
    err &&
    err.code === 'P2002' &&
    Array.isArray(err.meta && err.meta.target) &&
    err.meta.target.includes('iccid')
  );
}

async function createOrder({
  iccid,
  customerName,
  customerContact,
  destinationCode,
  planLabel,
  notes,
  createdByAdminId,
}) {
  const destination = findDestination(destinationCode);
  if (!destination) {
    throw { statusCode: 400, publicMessage: 'Unknown destination.' };
  }

  const orderId = await generateOrderId(prisma);

  try {
    return await prisma.order.create({
      data: {
        orderId,
        iccid,
        customerName,
        customerContact,
        destinationCode: destination.code,
        destinationLabel: destination.label,
        planLabel,
        notes,
        createdByAdminId,
      },
    });
  } catch (err) {
    if (isUniqueConstraintOnIccid(err)) {
      throw { statusCode: 409, publicMessage: 'This ICCID is already linked to an order.' };
    }
    throw err;
  }
}

async function listOrders({ query, status, destinationCode, page, pageSize }) {
  const where = { deletedAt: null };

  if (status) {
    where.status = status;
  }

  if (destinationCode) {
    where.destinationCode = destinationCode;
  }

  if (query) {
    where.OR = [
      { customerName: { contains: query, mode: 'insensitive' } },
      { customerContact: { contains: query, mode: 'insensitive' } },
      { orderId: { contains: query, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

async function getOrderById(id) {
  const order = await prisma.order.findFirst({
    where: { id, deletedAt: null },
  });

  if (!order) {
    throw { statusCode: 404, publicMessage: 'Order not found.' };
  }

  return order;
}

// Used by the public-lookup stage later, where customers look an order up
// by its public orderId rather than the internal database id.
async function getOrderByOrderId(orderId) {
  const order = await prisma.order.findFirst({
    where: { orderId, deletedAt: null },
  });

  if (!order) {
    throw { statusCode: 404, publicMessage: 'Order not found.' };
  }

  return order;
}

async function updateOrder(id, patch) {
  await getOrderById(id); // 404s up front if missing/already deleted

  const data = {};

  for (const field of EDITABLE_SIMPLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(patch, field)) {
      data[field] = patch[field];
    }
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'destinationCode')) {
    const destination = findDestination(patch.destinationCode);
    if (!destination) {
      throw { statusCode: 400, publicMessage: 'Unknown destination.' };
    }
    data.destinationCode = destination.code;
    data.destinationLabel = destination.label;
  }

  return prisma.order.update({ where: { id }, data });
}

async function softDeleteOrder(id) {
  await getOrderById(id); // 404s up front if missing/already deleted

  return prisma.order.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  getOrderByOrderId,
  updateOrder,
  softDeleteOrder,
};
