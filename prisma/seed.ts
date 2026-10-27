import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Серьги", slug: "earrings" },
  { name: "Кольца", slug: "rings" },
  { name: "Колье", slug: "necklaces" },
  { name: "Браслеты", slug: "bracelets" },
];

const products = [
  { name: "Серьги «Капля»", price: 1299, category: "earrings", stock: 24 },
  { name: "Серьги «Луна» с эмалью", price: 1590, category: "earrings", stock: 12 },
  { name: "Серьги-кольца «Орбита»", price: 990, category: "earrings", stock: 40 },
  { name: "Серьги «Жемчуг»", price: 2190, category: "earrings", stock: 8 },
  { name: "Кольцо «Вена»", price: 1490, category: "rings", stock: 17 },
  { name: "Кольцо «Плато»", price: 1890, category: "rings", stock: 6 },
  { name: "Кольцо-печатка «Герб»", price: 2390, category: "rings", stock: 3 },
  { name: "Кольцо «Твист»", price: 1190, category: "rings", stock: 31 },
  { name: "Колье «Нить»", price: 2790, category: "necklaces", stock: 9 },
  { name: "Колье «Каскад»", price: 3490, category: "necklaces", stock: 4 },
  { name: "Цепочка «Зерно»", price: 1690, category: "necklaces", stock: 22 },
  { name: "Колье с подвеской «Солнце»", price: 2590, category: "necklaces", stock: 11 },
  { name: "Браслет «Плетение»", price: 1390, category: "bracelets", stock: 19 },
  { name: "Браслет «Бусины»", price: 990, category: "bracelets", stock: 27 },
  { name: "Браслет-кафф «Волна»", price: 1790, category: "bracelets", stock: 14 },
  { name: "Браслет «Цепь»", price: 2090, category: "bracelets", stock: 5 },
];

async function main() {
  console.log("Seeding database...");

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryIds.set(category.slug, created.id);
  }

  // Идемпотентность: чистим товары перед заливкой, чтобы seed можно было гонять повторно.
  await prisma.product.deleteMany();

  for (const [index, item] of products.entries()) {
    await prisma.product.create({
      data: {
        name: item.name,
        description: `Бижутерия из коллекции «Базовый гардероб». Позиция #${index + 1}.`,
        priceCents: item.price * 100,
        stock: item.stock,
        categoryId: categoryIds.get(item.category) ?? null,
        imageUrl: null,
      },
    });
  }

  const total = await prisma.product.count();
  console.log(`Done. Categories: ${categories.length}, products: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
