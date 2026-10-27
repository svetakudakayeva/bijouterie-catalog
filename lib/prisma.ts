import { PrismaClient } from "@prisma/client";

/**
 * Переиспользуем один экземпляр Prisma Client.
 * В dev Next.js перезагружает модули (HMR) - без singleton
 * мы получили бы утечку соединений к БД.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
