import { Option, OptionsList } from "types";

/**
 * Resolves the effective price for an option item, accounting for
 * size-linked pricing. If the parent option group has sizeLinkedOptionLabel
 * set and the item has priceBySize, looks up the currently selected size
 * and returns the corresponding price. Falls back to priceIncrease.
 */
export function resolveOptionPrice(
  item: OptionsList,
  optionGroup: Option,
  allOptions: Option[]
): string {
  if (!optionGroup.sizeLinkedOptionLabel || !item.priceBySize) {
    return item.priceIncrease ?? "0";
  }

  const sizeGroup = allOptions.find(
    (op) => op.label === optionGroup.sizeLinkedOptionLabel
  );
  if (!sizeGroup) return item.priceIncrease ?? "0";

  const selectedSize = sizeGroup.optionsList.find(
    (op) => op.selected === true
  );
  if (!selectedSize?.label) return item.priceIncrease ?? "0";

  return item.priceBySize[selectedSize.label] ?? item.priceIncrease ?? "0";
}
