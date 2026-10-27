import { PrismaClient } from "@prisma/client";

/**
 * Быстрая проверка состояния БД после инициализации.
 * Запуск: npm run db:check
 */
const prisma = new PrismaClient();

async function main() {
  const [products, categories] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
  ]);

  const first = await prisma.product.findFirst({
    orderBy: { createdAt: "asc" },
    select: { name: true, priceCents: true },
  });

  console.log(`categories=${categories} products=${products}`);
  if (first) {
    console.log(`first product: ${first.name} (${first.priceCents} cents)`);
  }

  if (products === 0) {
    console.log("WARN: база пустая, запустите npm run db:seed");
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("DB check failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
