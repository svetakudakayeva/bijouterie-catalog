import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatZodErrors, productInputSchema } from "@/lib/validation";
import { toCents } from "@/lib/format";

export const dynamic = "force-dynamic";

// GET /api/products?q=&category=&limit=&offset=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 20) || 20, 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0) || 0, 0);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ data: items, meta: { total, limit, offset } });
}

// POST /api/products
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Тело запроса должно быть корректным JSON" },
      { status: 400 },
    );
  }

  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ошибка валидации", errors: formatZodErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { name, description, price, stock, categoryId, imageUrl } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        priceCents: toCents(price),
        stock,
        categoryId: categoryId ?? null,
        imageUrl: imageUrl || null,
      },
      include: { category: true },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products failed", error);
    return NextResponse.json({ error: "Не удалось создать товар" }, { status: 500 });
  }
}
