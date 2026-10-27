import { z } from "zod";

/**
 * Схема валидации входящих данных для создания/обновления товара.
 * Единая точка правды: используется и в API, и в тестах.
 */
export const productInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Название: минимум 2 символа")
    .max(120, "Название: максимум 120 символов"),
  description: z
    .string()
    .trim()
    .max(2000, "Описание: максимум 2000 символов")
    .optional()
    .or(z.literal("")),
  price: z.coerce
    .number({ invalid_type_error: "Цена должна быть числом" })
    .positive("Цена должна быть больше 0")
    .max(1_000_000, "Цена слишком большая"),
  stock: z.coerce
    .number({ invalid_type_error: "Остаток должен быть числом" })
    .int("Остаток должен быть целым")
    .min(0, "Остаток не может быть отрицательным")
    .max(100_000, "Остаток слишком большой")
    .default(0),
  categoryId: z.string().cuid("Некорректный id категории").optional().nullable(),
  imageUrl: z
    .string()
    .url("Некорректный URL изображения")
    .optional()
    .or(z.literal("")),
});

/** Схема для PATCH: все поля опциональны, но хотя бы одно должно быть. */
export const productPatchSchema = productInputSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Нужно передать хотя бы одно поле" },
);

export type ProductInput = z.infer<typeof productInputSchema>;

/** Утилита для приведения ZodError к читаемому виду. */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
