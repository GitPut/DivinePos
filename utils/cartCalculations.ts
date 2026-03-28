import { CartItemProp } from "types";

export interface CartTotals {
  itemsSubtotal: number;
  deliveryFee: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Calculates cart totals including delivery fee, discount, and tax.
 * This is the single source of truth for cart math across POS, online store, and order views.
 */
export function calculateCartTotals(
  cart: CartItemProp[],
  taxRate: string,
  deliveryPrice: string,
  includeDelivery: boolean,
  discountAmount?: string | null
): CartTotals {
  let itemsSubtotal = 0;

  for (const item of cart) {
    try {
      const price = parseFloat(item.price ?? "0") || 0;
      const quantity = item.quantity ? parseFloat(item.quantity) : 1;
      itemsSubtotal += price * (quantity > 0 ? quantity : 1);
    } catch {
      // skip malformed items
    }
  }

  const deliveryFee =
    includeDelivery && deliveryPrice ? parseFloat(deliveryPrice) || 0 : 0;
  const preDiscountSubtotal = itemsSubtotal + deliveryFee;

  let discount = 0;
  if (discountAmount) {
    if (discountAmount.includes("%")) {
      const pct = parseFloat(discountAmount.replace("%", "")) / 100;
      discount = preDiscountSubtotal * pct;
    } else {
      discount = parseFloat(discountAmount) || 0;
    }
  }

  const subtotal = preDiscountSubtotal - discount;
  const taxMultiplier =
    parseFloat(taxRate) >= 0 ? parseFloat(taxRate) / 100 : 0.13;
  const tax = subtotal * taxMultiplier;
  const total = subtotal + tax;

  return { itemsSubtotal, deliveryFee, discount, subtotal, tax, total };
}
