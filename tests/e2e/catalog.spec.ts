import { expect, test } from "@playwright/test";

/**
 * Smoke-тесты: проверяем, что приложение вообще живо после деплоя.
 * Держим их быстрыми и независимыми от конкретных данных.
 */

test.describe("smoke", () => {
  test("home page renders the hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Каталог бижутерии",
    );
  });

  test("health endpoint reports database up", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe("up");
  });

  test("catalog page lists products", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Каталог" })).toBeVisible();
    await expect(page.locator("ul li").first()).toBeVisible();
  });

  test("search with no matches shows empty state", async ({ page }) => {
    await page.goto("/products?q=zzz-no-such-product-zzz");
    await expect(page.getByText("Ничего не найдено")).toBeVisible();
  });

  test("api returns validation error for invalid product", async ({ request }) => {
    const response = await request.post("/api/products", {
      data: { name: "A", price: -5 },
    });
    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body.errors.name).toBeTruthy();
    expect(body.errors.price).toBeTruthy();
  });
});
