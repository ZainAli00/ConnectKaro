/**
 * src/services/orderIdGenerator.js
 *
 * Generates the public-facing Order.orderId ("CK-XXXXXXX") used everywhere a
 * human needs to read, type, or share an order reference. Characters are
 * drawn with crypto.randomInt (cryptographically secure, unlike Math.random)
 * from ORDER_ID_ALPHABET, and the candidate is checked for uniqueness
 * against the database before being handed back to the caller.
 */

const crypto = require('crypto');

const {
  ORDER_ID_PREFIX,
  ORDER_ID_ALPHABET,
  ORDER_ID_RANDOM_LENGTH,
} = require('../utils/constants');

const MAX_ATTEMPTS = 10;

function randomOrderIdCandidate() {
  let suffix = '';
  for (let i = 0; i < ORDER_ID_RANDOM_LENGTH; i += 1) {
    const index = crypto.randomInt(0, ORDER_ID_ALPHABET.length);
    suffix += ORDER_ID_ALPHABET[index];
  }
  return `${ORDER_ID_PREFIX}${suffix}`;
}

/**
 * Generates a unique Order.orderId, retrying on collision (checked via a
 * findUnique lookup against the passed-in Prisma client) up to MAX_ATTEMPTS
 * times. With ORDER_ID_ALPHABET.length ** ORDER_ID_RANDOM_LENGTH possible
 * values, exhausting every attempt is astronomically unlikely and would
 * signal something else is wrong (e.g. a broken uniqueness check), so we
 * throw a clear error rather than looping forever.
 */
async function generateOrderId(prismaClient) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = randomOrderIdCandidate();

    // eslint-disable-next-line no-await-in-loop
    const existing = await prismaClient.order.findUnique({
      where: { orderId: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(
    `orderIdGenerator: could not find a unique order ID after ${MAX_ATTEMPTS} attempts.`
  );
}

module.exports = { generateOrderId };
