import { describe, expect, it } from "vitest";
import { applyDiscount, formatPrice, toCents, toRubles } from "@/lib/format";
import {
  formatZodErrors,
  productInputSchema,
  productPatchSchema,
} from "@/lib/validation";

describe("money helpers", () => {
  it("converts rubles to cents without float drift", () => {
    expect(toCents(1299)).toBe(129900);
    expect(toCents(0.1)).toBe(10);
    expect(toCents(19.99)).toBe(1999);
  });

  it("converts cents back to rubles", () => {
    expect(toRubles(129900)).toBe(1299);
    expect(toRubles(1999)).toBe(19.99);
  });

  it("formats price for ru-RU without kopecks when they are zero", () => {
    const formatted = formatPrice(129900);
    expect(formatted).toContain("1");
    expect(formatted).toContain("299");
    expect(formatted).toMatch(/₽/);
  });

  it("applies discount and rounds to cents", () => {
    expect(applyDiscount(100000, 10)).toBe(90000);
    expect(applyDiscount(1999, 15)).toBe(1699);
  });

  it("rejects invalid discount values", () => {
    expect(() => applyDiscount(1000, -1)).toThrow(RangeError);
    expect(() => applyDiscount(1000, 101)).toThrow(RangeError);
  });
});

describe("productInputSchema", () => {
  const valid = {
    name: "Серьги «Капля»",
    description: "Латунь с позолотой",
    price: "1299",
    stock: "5",
    categoryId: null,
    imageUrl: "",
  };

  it("accepts valid input and coerces numeric strings", () => {
    const parsed = productInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.price).toBe(1299);
      expect(parsed.data.stock).toBe(5);
    }
  });

  it("rejects a too short name", () => {
    const parsed = productInputSchema.safeParse({ ...valid, name: "A" });
    expect(parsed.success).toBe(false);
  });

  it("rejects zero or negative price", () => {
    expect(productInputSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...valid, price: -10 }).success).toBe(false);
  });

  it("rejects non-integer stock", () => {
    expect(productInputSchema.safeParse({ ...valid, stock: "1.5" }).success).toBe(false);
  });

  it("rejects a malformed image url", () => {
    expect(
      productInputSchema.safeParse({ ...valid, imageUrl: "not-a-url" }).success,
    ).toBe(false);
  });

  it("returns human readable field errors", () => {
    const parsed = productInputSchema.safeParse({ ...valid, name: "", price: 0 });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = formatZodErrors(parsed.error);
      expect(errors.name).toBeTruthy();
      expect(errors.price).toBeTruthy();
    }
  });
});

describe("productPatchSchema", () => {
  it("accepts a single field", () => {
    expect(productPatchSchema.safeParse({ stock: 3 }).success).toBe(true);
  });

  it("rejects an empty patch", () => {
    expect(productPatchSchema.safeParse({}).success).toBe(false);
  });
});
