import { Option, OptionsList, SelectedCaseListItem } from "types";

/**
 * Filters an option's choices based on per-choice visibility rules (selectedCaseList).
 *
 * Rules are grouped by the option they reference (selectedCaseKey):
 *   - Within the same option → OR  (e.g. Size=Large OR Size=X-Large)
 *   - Between different options → AND (e.g. Size group AND Crust group)
 */
export function filterVisibleChoices(
  optionsList: OptionsList[],
  allOptions: Option[]
): OptionsList[] {
  return optionsList.filter((choice) => {
    if (!choice.selectedCaseList || choice.selectedCaseList.length === 0) {
      return true;
    }
    return evaluateRules(choice.selectedCaseList, allOptions);
  });
}

function evaluateRules(
  rules: SelectedCaseListItem[],
  allOptions: Option[]
): boolean {
  const groups = new Map<string, SelectedCaseListItem[]>();
  for (const rule of rules) {
    const key = rule.selectedCaseKey ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(rule);
  }
  const checkRule = (rule: SelectedCaseListItem) => {
    if (!rule.selectedCaseKey || !rule.selectedCaseValue) return true;
    const targetOption = allOptions.find(
      (op) => op.label === rule.selectedCaseKey
    );
    if (!targetOption) return true;
    const targetChoice = targetOption.optionsList.find(
      (opL) => opL.label === rule.selectedCaseValue
    );
    return targetChoice?.selected === true;
  };
  // AND between groups, OR within each group
  return [...groups.values()].every((group) => group.some(checkRule));
}
