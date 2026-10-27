import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatZodErrors, productPatchSchema } from "@/lib/validation";
import { toCents } from "@/lib/format";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

// GET /api/products/:id
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}

// PATCH /api/products/:id
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ошибка валидации", errors: formatZodErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { price, description, imageUrl, ...rest } = parsed.data;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined ? { priceCents: toCents(price) } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
      },
      include: { category: true },
    });

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
}

// DELETE /api/products/:id
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
}
