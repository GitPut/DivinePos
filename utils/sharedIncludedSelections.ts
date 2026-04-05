import { Option } from "types";

/**
 * For options linked via `sharedIncludedGroup`, calculates the shared pool state.
 *
 * The shared included count comes from the FIRST option in the group that has
 * a non-zero `includedSelections` value. All options in the group draw from
 * this single pool.
 *
 * Returns null if the option is not part of a shared group.
 */
export function getSharedIncludedState(
  allOptions: Option[],
  currentOptionIndex: number
): {
  /** Total free selections for the entire shared group */
  sharedIncludedCount: number;
  /** Total selections used across ALL options in the shared group */
  sharedTotalUsed: number;
  /** Free selections remaining BEFORE this option (used by prior options in the group) */
  usedBeforeCurrent: number;
  /** The effective free remaining for this specific option */
  freeRemainingForCurrent: number;
  /** The extraSelectionPrice from the group source option */
  sharedExtraPrice: number;
} | null {
  const currentOption = allOptions[currentOptionIndex];
  if (!currentOption?.sharedIncludedGroup) return null;

  const group = currentOption.sharedIncludedGroup;

  // Find the shared included count: first non-zero includedSelections in the group
  let sharedIncludedCount = 0;
  let sharedExtraPrice = 0;
  for (const op of allOptions) {
    if (op.sharedIncludedGroup !== group || op.optionType !== "Included Selections") continue;
    const inc = parseFloat(op.includedSelections ?? "0");
    if (inc > 0 && sharedIncludedCount === 0) {
      sharedIncludedCount = inc;
      sharedExtraPrice = parseFloat(op.extraSelectionPrice ?? "0");
    }
  }

  // Calculate total used across the entire group
  let sharedTotalUsed = 0;
  let usedBeforeCurrent = 0;
  let reachedCurrent = false;

  for (let i = 0; i < allOptions.length; i++) {
    const op = allOptions[i];
    if (op.sharedIncludedGroup !== group || op.optionType !== "Included Selections") continue;

    if (i === currentOptionIndex) {
      reachedCurrent = true;
    }

    let opUsed = 0;
    for (const item of op.optionsList) {
      const countsAs = parseFloat(item.countsAs ?? "1");
      opUsed += parseFloat(item.selectedTimes ?? "0") * countsAs;
    }

    sharedTotalUsed += opUsed;
    if (!reachedCurrent) {
      usedBeforeCurrent += opUsed;
    }
  }

  const freeRemainingForCurrent = Math.max(0, sharedIncludedCount - usedBeforeCurrent);

  return {
    sharedIncludedCount,
    sharedTotalUsed,
    usedBeforeCurrent,
    freeRemainingForCurrent,
    sharedExtraPrice,
  };
}
