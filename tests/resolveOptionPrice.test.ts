import { describe, it, expect } from "vitest";
import { resolveOptionPrice } from "utils/resolveOptionPrice";
import { Option, OptionsList } from "types";

function makeOptionItem(overrides: Partial<OptionsList> = {}): OptionsList {
  return {
    label: "Pepperoni",
    priceIncrease: "2.00",
    ...overrides,
  };
}

function makeOptionGroup(overrides: Partial<Option> = {}): Option {
  return {
    label: "Toppings",
    optionType: "Quantity Dropdown",
    optionsList: [],
    ...overrides,
  };
}

describe("resolveOptionPrice", () => {
  it("returns priceIncrease when no size-linked pricing", () => {
    const item = makeOptionItem({ priceIncrease: "3.50" });
    const group = makeOptionGroup();
    const result = resolveOptionPrice(item, group, [group]);
    expect(result).toBe("3.50");
  });

  it("returns '0' when no priceIncrease and no size-linked pricing", () => {
    const item = makeOptionItem({ priceIncrease: undefined });
    const group = makeOptionGroup();
    const result = resolveOptionPrice(item, group, [group]);
    expect(result).toBe("0");
  });

  it("returns size-linked price when size is selected", () => {
    const sizeGroup = makeOptionGroup({
      label: "Size",
      optionsList: [
        { label: "Small", selected: false },
        { label: "Large", selected: true },
      ],
    });
    const toppingsGroup = makeOptionGroup({
      label: "Toppings",
      sizeLinkedOptionLabel: "Size",
    });
    const item = makeOptionItem({
      priceIncrease: "2.00",
      priceBySize: { Small: "1.50", Large: "3.00" },
    });

    const result = resolveOptionPrice(item, toppingsGroup, [sizeGroup, toppingsGroup]);
    expect(result).toBe("3.00");
  });

  it("falls back to priceIncrease when size group not found", () => {
    const toppingsGroup = makeOptionGroup({
      sizeLinkedOptionLabel: "NonexistentSize",
    });
    const item = makeOptionItem({
      priceIncrease: "2.00",
      priceBySize: { Small: "1.50" },
    });

    const result = resolveOptionPrice(item, toppingsGroup, [toppingsGroup]);
    expect(result).toBe("2.00");
  });

  it("uses first priceBySize value when no size is selected", () => {
    const sizeGroup = makeOptionGroup({
      label: "Size",
      optionsList: [
        { label: "Small", selected: false },
        { label: "Large", selected: false },
      ],
    });
    const toppingsGroup = makeOptionGroup({
      sizeLinkedOptionLabel: "Size",
    });
    const item = makeOptionItem({
      priceIncrease: "2.00",
      priceBySize: { Small: "1.50", Large: "3.00" },
    });

    const result = resolveOptionPrice(item, toppingsGroup, [sizeGroup, toppingsGroup]);
    expect(result).toBe("1.50");
  });

  it("uses first priceBySize when no size selected and priceIncrease is null", () => {
    const sizeGroup = makeOptionGroup({
      label: "Size",
      optionsList: [
        { label: "Small", selected: false },
        { label: "Large", selected: false },
      ],
    });
    const toppingsGroup = makeOptionGroup({
      sizeLinkedOptionLabel: "Size",
    });
    const item = makeOptionItem({
      priceIncrease: undefined,
      priceBySize: { Small: "1.25", Medium: "1.50" },
    });

    const result = resolveOptionPrice(item, toppingsGroup, [sizeGroup, toppingsGroup]);
    expect(result).toBe("1.25");
  });

  it("falls back to priceIncrease when selected size not in priceBySize", () => {
    const sizeGroup = makeOptionGroup({
      label: "Size",
      optionsList: [{ label: "XL", selected: true }],
    });
    const toppingsGroup = makeOptionGroup({
      sizeLinkedOptionLabel: "Size",
    });
    const item = makeOptionItem({
      priceIncrease: "2.00",
      priceBySize: { Small: "1.50", Large: "3.00" },
    });

    const result = resolveOptionPrice(item, toppingsGroup, [sizeGroup, toppingsGroup]);
    expect(result).toBe("2.00");
  });

  it("returns correct price when item has no priceBySize but size-linked is set", () => {
    const sizeGroup = makeOptionGroup({
      label: "Size",
      optionsList: [{ label: "Large", selected: true }],
    });
    const toppingsGroup = makeOptionGroup({
      sizeLinkedOptionLabel: "Size",
    });
    const item = makeOptionItem({ priceIncrease: "4.00" });

    const result = resolveOptionPrice(item, toppingsGroup, [sizeGroup, toppingsGroup]);
    expect(result).toBe("4.00");
  });
});
