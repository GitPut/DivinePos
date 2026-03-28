import { Option, OptionsList } from "types";

/**
 * Filters an option's choices based on per-choice visibility rules (selectedCaseList).
 * A choice is visible if it has no selectedCaseList, or ALL conditions are met.
 * Conditions check if another option has a specific value selected.
 */
export function filterVisibleChoices(
  optionsList: OptionsList[],
  allOptions: Option[]
): OptionsList[] {
  return optionsList.filter((choice) => {
    if (!choice.selectedCaseList || choice.selectedCaseList.length === 0) {
      return true;
    }
    return choice.selectedCaseList.every((condition) => {
      if (!condition.selectedCaseKey || !condition.selectedCaseValue) return true;
      const targetOption = allOptions.find(
        (op) => op.label === condition.selectedCaseKey
      );
      if (!targetOption) return true;
      const targetChoice = targetOption.optionsList.find(
        (opL) => opL.label === condition.selectedCaseValue
      );
      return targetChoice?.selected === true;
    });
  });
}
