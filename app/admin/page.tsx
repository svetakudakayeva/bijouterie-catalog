import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Админка</h1>
        <p className="text-sm text-black/60">
          Форма отправляет POST /api/products, данные валидируются Zod на сервере.
        </p>
      </div>
      <ProductForm categories={categories.map(({ id, name }) => ({ id, name }))} />
    </section>
  );
}
