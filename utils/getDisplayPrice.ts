import { ProductProp } from "types";

/**
 * Returns the display price for a product card.
 * If base price is 0 and there's a required option with prices,
 * returns the lowest option price as the starting "from" price.
 * Returns { price: string, isFrom: boolean }
 */
export function getDisplayPrice(product: ProductProp): {
  price: string;
  isFrom: boolean;
} {
  const basePrice = parseFloat(product.price) || 0;

  if (basePrice > 0) {
    return { price: basePrice.toFixed(2), isFrom: false };
  }

  // Base price is 0 — check required options for a starting price
  for (const option of product.options) {
    if (!option.isRequired || !option.optionsList?.length) continue;

    const prices = option.optionsList
      .map((choice) => parseFloat(choice.priceIncrease ?? "0") || 0)
      .filter((p) => p > 0);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      return { price: minPrice.toFixed(2), isFrom: true };
    }
  }

  return { price: "0.00", isFrom: false };
}
