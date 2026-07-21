/**
 * src/prismaClient.js
 *
 * Module-level singleton PrismaClient instance. Import this everywhere
 * instead of constructing `new PrismaClient()` in individual services —
 * that would open a separate connection pool per import.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
