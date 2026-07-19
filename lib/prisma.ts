import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton — prevents exhausting DB connections
 * in Next.js dev mode (hot reload creates a new module scope each time).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
