const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance across the app (recommended for
// long-running Node servers to avoid exhausting DB connections).
const prisma = new PrismaClient();

module.exports = prisma;
