"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type FieldErrors = Record<string, string>;

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  categoryId: "",
  imageUrl: "",
};

export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          stock: form.stock,
          categoryId: form.categoryId || null,
          imageUrl: form.imageUrl || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.errors) setErrors(payload.errors);
        setMessage(payload?.error ?? "Не удалось сохранить товар");
        return;
      }

      setForm(initialForm);
      setMessage(`Товар «${payload.data.name}» создан`);
      router.refresh();
    } catch {
      setMessage("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Название *</span>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Серьги «Капля»"
            required
          />
          {errors.name ? <span className="text-xs text-red-600">{errors.name}</span> : null}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Цена, ₽ *</span>
          <input
            className="input"
            name="price"
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="1299"
            required
          />
          {errors.price ? <span className="text-xs text-red-600">{errors.price}</span> : null}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Категория</span>
          <select
            className="input"
            name="categoryId"
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Остаток, шт.</span>
          <input
            className="input"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
          />
          {errors.stock ? <span className="text-xs text-red-600">{errors.stock}</span> : null}
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Ссылка на изображение</span>
        <input
          className="input"
          name="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="https://res.cloudinary.com/..."
        />
        {errors.imageUrl ? (
          <span className="text-xs text-red-600">{errors.imageUrl}</span>
        ) : null}
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Описание</span>
        <textarea
          className="input min-h-24"
          name="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Материал, размеры, особенности ухода"
        />
      </label>

      <div className="flex items-center gap-3">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : "Создать товар"}
        </button>
        <button
          className="btn-outline"
          type="button"
          onClick={() => {
            setForm(initialForm);
            setErrors({});
            setMessage(null);
          }}
        >
          Очистить
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className={`text-sm ${errors.name || errors.price ? "text-red-600" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
