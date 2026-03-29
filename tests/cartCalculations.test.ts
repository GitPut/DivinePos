import { describe, it, expect } from "vitest";
import { calculateCartTotals } from "utils/cartCalculations";
import { CartItemProp } from "types";

function makeItem(
  name: string,
  price: string,
  quantity?: string
): CartItemProp {
  return { name, price, description: "", options: [], extraDetails: "", quantity };
}

describe("calculateCartTotals", () => {
  // ─── Basic calculations ───

  it("calculates subtotal for a single item", () => {
    const cart = [makeItem("Burger", "10.00")];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(10);
    expect(result.subtotal).toBeCloseTo(10);
    expect(result.tax).toBeCloseTo(1.3);
    expect(result.total).toBeCloseTo(11.3);
  });

  it("calculates subtotal for multiple items", () => {
    const cart = [
      makeItem("Burger", "10.00"),
      makeItem("Fries", "5.50"),
      makeItem("Drink", "3.00"),
    ];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(18.5);
    expect(result.total).toBeCloseTo(18.5 * 1.13);
  });

  it("handles item quantities", () => {
    const cart = [makeItem("Burger", "10.00", "3")];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(30);
  });

  it("treats missing quantity as 1", () => {
    const cart = [makeItem("Burger", "10.00")];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(10);
  });

  it("treats zero quantity as 1", () => {
    const cart = [makeItem("Burger", "10.00", "0")];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(10);
  });

  // ─── Empty cart ───

  it("returns zeros for empty cart", () => {
    const result = calculateCartTotals([], "13", "0", false);
    expect(result.itemsSubtotal).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });

  // ─── Tax rates ───

  it("applies 13% tax rate", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.tax).toBeCloseTo(13);
    expect(result.total).toBeCloseTo(113);
  });

  it("applies 5% tax rate", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "5", "0", false);
    expect(result.tax).toBeCloseTo(5);
    expect(result.total).toBeCloseTo(105);
  });

  it("applies 0% tax rate", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "0", "0", false);
    expect(result.tax).toBe(0);
    expect(result.total).toBeCloseTo(100);
  });

  it("falls back to 13% for invalid tax rate", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "abc", "0", false);
    expect(result.tax).toBeCloseTo(13);
  });

  // ─── Delivery fee ───

  it("includes delivery fee when includeDelivery is true", () => {
    const cart = [makeItem("Item", "10")];
    const result = calculateCartTotals(cart, "13", "5.00", true);
    expect(result.deliveryFee).toBeCloseTo(5);
    expect(result.subtotal).toBeCloseTo(15);
    expect(result.tax).toBeCloseTo(15 * 0.13);
    expect(result.total).toBeCloseTo(15 * 1.13);
  });

  it("excludes delivery fee when includeDelivery is false", () => {
    const cart = [makeItem("Item", "10")];
    const result = calculateCartTotals(cart, "13", "5.00", false);
    expect(result.deliveryFee).toBe(0);
    expect(result.subtotal).toBeCloseTo(10);
  });

  // ─── Percentage discount ───

  it("applies percentage discount", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "13", "0", false, "10%");
    expect(result.discount).toBeCloseTo(10);
    expect(result.subtotal).toBeCloseTo(90);
    expect(result.tax).toBeCloseTo(90 * 0.13);
    expect(result.total).toBeCloseTo(90 * 1.13);
  });

  it("applies 50% discount", () => {
    const cart = [makeItem("Item", "80")];
    const result = calculateCartTotals(cart, "13", "0", false, "50%");
    expect(result.discount).toBeCloseTo(40);
    expect(result.subtotal).toBeCloseTo(40);
  });

  // ─── Flat discount ───

  it("applies flat dollar discount", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "13", "0", false, "15");
    expect(result.discount).toBeCloseTo(15);
    expect(result.subtotal).toBeCloseTo(85);
    expect(result.total).toBeCloseTo(85 * 1.13);
  });

  // ─── Discount + Delivery ───

  it("applies percentage discount on subtotal including delivery", () => {
    const cart = [makeItem("Item", "100")];
    const result = calculateCartTotals(cart, "13", "10", true, "10%");
    // preDiscountSubtotal = 100 + 10 = 110
    // discount = 110 * 0.10 = 11
    expect(result.discount).toBeCloseTo(11);
    expect(result.subtotal).toBeCloseTo(99);
  });

  // ─── No discount ───

  it("handles null discount", () => {
    const cart = [makeItem("Item", "50")];
    const result = calculateCartTotals(cart, "13", "0", false, null);
    expect(result.discount).toBe(0);
    expect(result.subtotal).toBeCloseTo(50);
  });

  it("handles undefined discount", () => {
    const cart = [makeItem("Item", "50")];
    const result = calculateCartTotals(cart, "13", "0", false, undefined);
    expect(result.discount).toBe(0);
  });

  it("handles empty string discount", () => {
    const cart = [makeItem("Item", "50")];
    const result = calculateCartTotals(cart, "13", "0", false, "");
    expect(result.discount).toBe(0);
  });

  // ─── Edge cases ───

  it("handles malformed price gracefully", () => {
    const cart = [makeItem("Item", "notanumber")];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBe(0);
    expect(result.total).toBe(0);
  });

  it("handles negative price items (discount line items)", () => {
    const cart = [
      makeItem("Burger", "10"),
      makeItem("Discount", "-2"),
    ];
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(8);
  });

  it("handles large orders", () => {
    const cart = Array.from({ length: 100 }, (_, i) =>
      makeItem(`Item ${i}`, "9.99")
    );
    const result = calculateCartTotals(cart, "13", "0", false);
    expect(result.itemsSubtotal).toBeCloseTo(999);
  });
});
