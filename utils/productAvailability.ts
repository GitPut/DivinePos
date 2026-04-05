import { ProductProp } from "types";

/**
 * Checks if a product is currently available based on its time restrictions.
 * Returns true if the product has no time restrictions or if the current time
 * falls within the specified availability window.
 *
 * Supports overnight ranges (e.g., availableAfter: "20:00", availableBefore: "02:00").
 */
export function isProductAvailableNow(product: ProductProp): boolean {
  if (!product.availableAfter && !product.availableBefore) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const afterMinutes = parseTime(product.availableAfter);
  const beforeMinutes = parseTime(product.availableBefore);

  // Only "after" is set — available from that time until midnight
  if (afterMinutes !== null && beforeMinutes === null) {
    return currentMinutes >= afterMinutes;
  }

  // Only "before" is set — available from midnight until that time
  if (afterMinutes === null && beforeMinutes !== null) {
    return currentMinutes <= beforeMinutes;
  }

  // Both are set
  if (afterMinutes !== null && beforeMinutes !== null) {
    if (afterMinutes <= beforeMinutes) {
      // Same-day range (e.g., 08:00 – 14:00)
      return currentMinutes >= afterMinutes && currentMinutes <= beforeMinutes;
    } else {
      // Overnight range (e.g., 20:00 – 02:00)
      return currentMinutes >= afterMinutes || currentMinutes <= beforeMinutes;
    }
  }

  return true;
}

function parseTime(time?: string): number | null {
  if (!time) return null;
  const parts = time.split(":");
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
