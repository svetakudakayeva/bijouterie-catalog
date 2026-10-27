/**
 * Деньги храним в минимальных единицах (копейки), а форматируем только для UI.
 * Это исключает ошибки округления вида 0.1 + 0.2 = 0.30000000000000004.
 */

/** Рубли (число) -> копейки (целое). */
export function toCents(rubles: number): number {
  return Math.round(rubles * 100);
}

/** Копейки (целое) -> рубли (число). */
export function toRubles(cents: number): number {
  return cents / 100;
}

/** Копейки -> строка для отображения: 129900 -> "1 299 ₽". */
export function formatPrice(cents: number, locale = "ru-RU", currency = "RUB"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Применяет скидку в процентах и округляет до копеек. */
export function applyDiscount(cents: number, percent: number): number {
  if (percent < 0 || percent > 100) {
    throw new RangeError("Скидка должна быть в диапазоне 0..100");
  }
  return Math.round(cents * (1 - percent / 100));
}
