import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // With Prisma 7 + prisma.config.ts, the URL comes from config/env.
    // No adapter needed for Postgres.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
