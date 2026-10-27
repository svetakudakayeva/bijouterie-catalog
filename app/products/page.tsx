import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

// Каталог всегда читает актуальные данные из БД, без статической генерации.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category } = await searchParams;

  const [categories, products, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.product.count(),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Каталог</h1>
          <p className="text-sm text-black/60">
            Всего в базе: {total} · показано: {products.length}
          </p>
        </div>

        <form className="flex gap-2" action="/products" method="get">
          <input
            className="input w-56"
            type="search"
            name="q"
            placeholder="Поиск по названию"
            defaultValue={q ?? ""}
            aria-label="Поиск по названию"
          />
          {category ? <input type="hidden" name="category" value={category} /> : null}
          <button className="btn" type="submit">
            Найти
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"}
          className={`rounded-full border px-3 py-1 ${
            !category ? "border-ink bg-ink text-white" : "border-black/15"
          }`}
        >
          Все
        </Link>
        {categories.map((c) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          params.set("category", c.slug);
          const active = category === c.slug;
          return (
            <Link
              key={c.id}
              href={`/products?${params.toString()}`}
              className={`rounded-full border px-3 py-1 ${
                active ? "border-ink bg-ink text-white" : "border-black/15"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="card text-center text-black/60">
          Ничего не найдено. Попробуйте изменить запрос или{" "}
          <Link href="/products" className="underline">
            сбросить фильтры
          </Link>
          .
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="card">
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-sand text-3xl">
                💎
              </div>
              <h2 className="font-medium">{product.name}</h2>
              <p className="text-xs text-black/50">
                {product.category?.name ?? "Без категории"}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold">{formatPrice(product.priceCents)}</span>
                <span
                  className={`text-xs ${
                    product.stock > 0 ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {product.stock > 0 ? `в наличии: ${product.stock}` : "нет в наличии"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
