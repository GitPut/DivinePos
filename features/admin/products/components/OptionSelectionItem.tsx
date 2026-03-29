import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiTrash2, FiEye } from "react-icons/fi";
import { Option, OptionsList, SelectedCaseListItem } from "types";

interface OptionSelectionItemProps {
  style?: React.CSSProperties;
  eInnerListStart: OptionsList;
  indexInnerList: number;
  testMap: OptionsList[];
  settestMap: (val: OptionsList[]) => void;
  setnewProductOptions: (val: ((prev: Option[]) => Option[]) | Option[]) => void;
  index: number;
  setmoveToOptionPos: (val: number) => void;
  highlightedOptionID: string | null;
  sethighlightedOptionID: (val: string | null) => void;
  scrollToPositionIncluding: (val: number) => void;
  sizeLinkedLabels?: string[];
  allOptions?: Option[];
  optionType?: string | null;
}

function OptionSelectionItem({
  style,
  eInnerListStart,
  indexInnerList,
  testMap,
  settestMap,
  setnewProductOptions,
  index,
  setmoveToOptionPos,
  highlightedOptionID,
  sethighlightedOptionID,
  scrollToPositionIncluding,
  sizeLinkedLabels,
  allOptions,
  optionType,
}: OptionSelectionItemProps) {
  const eInnerList = structuredClone(eInnerListStart);
  const [showVisibility, setShowVisibility] = useState(
    (eInnerList.selectedCaseList?.length ?? 0) > 0
  );

  const otherOptions = (allOptions ?? []).filter((_, i) => i !== index);
  const hasRules = (eInnerList.selectedCaseList?.length ?? 0) > 0;

  const updateChoiceField = (updater: (choice: OptionsList) => void) => {
    const cloneOuter = structuredClone(testMap);
    updater(cloneOuter[indexInnerList]);
    setnewProductOptions((prev) => {
      const clone = structuredClone(prev);
      clone[index].optionsList = cloneOuter;
      return clone;
    });
    settestMap(cloneOuter);
  };

  return (
    <div
      style={{
        ...styles.container,
        ...style,
        ...(highlightedOptionID === eInnerList.id
          ? { borderColor: "#1D294E" }
          : {}),
      }}
    >
      <div style={styles.fieldsRow}>
        <div style={styles.nameGroup}>
          <span style={styles.fieldLabel}>Selection Name</span>
          <input
            style={styles.input}
            onChange={(e) => {
              const val = e.target.value;
              const cloneOuter = structuredClone(testMap);
              cloneOuter[indexInnerList].label = val;
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                clone[index].optionsList = cloneOuter;
                return clone;
              });
              settestMap(cloneOuter);
            }}
            value={eInnerList?.label ?? ""}
            placeholder="e.g. Small, Pepperoni, Extra Cheese"
          />
        </div>
        {sizeLinkedLabels && sizeLinkedLabels.length > 0 ? (
          <div style={styles.sizePriceRow}>
            {sizeLinkedLabels.map((sizeLabel) => (
              <div key={sizeLabel} style={styles.sizePriceGroup}>
                <span style={styles.fieldLabel}>{sizeLabel}</span>
                <input
                  style={styles.input}
                  onChange={(e) => {
                    const val = e.target.value;
                    const re = /^-?\d*\.?\d*$/;
                    if (val === "" || re.test(val)) {
                      const cloneOuter = structuredClone(testMap);
                      if (!cloneOuter[indexInnerList].priceBySize) {
                        cloneOuter[indexInnerList].priceBySize = {};
                      }
                      cloneOuter[indexInnerList].priceBySize![sizeLabel] = val;
                      setnewProductOptions((prev) => {
                        const clone = structuredClone(prev);
                        clone[index].optionsList = cloneOuter;
                        return clone;
                      });
                      settestMap(cloneOuter);
                    }
                  }}
                  value={eInnerList?.priceBySize?.[sizeLabel] ?? ""}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.priceGroup}>
            <span style={styles.fieldLabel}>Price Increase</span>
            <input
              style={styles.input}
              onChange={(e) => {
                const val = e.target.value;
                const re = /^-?\d*\.?\d*$/;

                if (val === "" || re.test(val)) {
                  const cloneOuter = structuredClone(testMap);
                  cloneOuter[indexInnerList].priceIncrease = val;
                  setnewProductOptions((prev) => {
                    const clone = structuredClone(prev);
                    clone[index].optionsList = cloneOuter;
                    return clone;
                  });
                  settestMap(cloneOuter);
                }
              }}
              value={eInnerList?.priceIncrease ? eInnerList.priceIncrease.toString() : ""}
              placeholder="0.00"
            />
          </div>
        )}
      </div>
      <div style={styles.btnsRow}>
        {(optionType === "Included Selections" || optionType === "Table View" || optionType === "Quantity Dropdown") && (
          <>
            <div style={styles.defaultQtyRow}>
              <span style={styles.defaultQtyLabel}>Default</span>
              <input
                style={{
                  ...styles.defaultQtyInput,
                  ...(parseFloat(eInnerList?.defaultSelectedTimes ?? "0") > 0
                    ? { borderColor: "#1D294E", backgroundColor: "#f0f4ff" }
                    : {}),
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  const re = /^\d*$/;
                  if (val === "" || re.test(val)) {
                    updateChoiceField((choice) => {
                      choice.defaultSelectedTimes = val || undefined;
                    });
                  }
                }}
                value={eInnerList?.defaultSelectedTimes ?? ""}
                placeholder="0"
              />
            </div>
            <div style={styles.defaultQtyRow}>
              <span style={styles.defaultQtyLabel}>Counts As</span>
              <input
                style={{
                  ...styles.defaultQtyInput,
                  ...(parseFloat(eInnerList?.countsAs ?? "1") > 1
                    ? { borderColor: "#d97706", backgroundColor: "#fffbeb" }
                    : {}),
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  const re = /^\d*\.?\d*$/;
                  if (val === "" || re.test(val)) {
                    updateChoiceField((choice) => {
                      choice.countsAs = val || undefined;
                    });
                  }
                }}
                value={eInnerList?.countsAs ?? ""}
                placeholder="1"
              />
            </div>
          </>
        )}
        {otherOptions.length > 0 && (
          <button
            style={{
              ...styles.iconBtn,
              ...(hasRules ? { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" } : {}),
            }}
            onClick={() => setShowVisibility(!showVisibility)}
            title="Visibility rules"
          >
            <FiEye size={14} color={hasRules ? "#1D294E" : "#64748b"} />
          </button>
        )}
        <button
          style={styles.iconBtn}
          onClick={() => {
            if (testMap.length > 1 && indexInnerList !== testMap.length - 1) {
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                const f = clone[index].optionsList.splice(indexInnerList, 1)[0];
                clone[index].optionsList.splice(indexInnerList + 1, 0, f);
                settestMap(clone[index].optionsList);
                sethighlightedOptionID(eInnerList.id);
                scrollToPositionIncluding(135);
                return clone;
              });
            }
          }}
          title="Move down"
        >
          <FiChevronDown size={14} color="#64748b" />
        </button>
        <button
          style={styles.iconBtn}
          onClick={() => {
            if (testMap.length > 1 && indexInnerList !== 0) {
              setnewProductOptions((prev) => {
                const clone = structuredClone(prev);
                const f = clone[index].optionsList.splice(indexInnerList, 1)[0];
                clone[index].optionsList.splice(indexInnerList - 1, 0, f);
                settestMap(clone[index].optionsList);
                sethighlightedOptionID(eInnerList.id);
                scrollToPositionIncluding(-135);
                return clone;
              });
            }
          }}
          title="Move up"
        >
          <FiChevronUp size={14} color="#64748b" />
        </button>
        <button
          style={styles.deleteBtn}
          onClick={() => {
            const cloneOuter = structuredClone(testMap);
            cloneOuter.splice(indexInnerList, 1);
            setnewProductOptions((prev) => {
              const clone = structuredClone(prev);
              clone[index].optionsList = cloneOuter;
              return clone;
            });
            settestMap(cloneOuter);
            if (indexInnerList !== 0) {
              setmoveToOptionPos(indexInnerList - 1);
            }
            sethighlightedOptionID(eInnerList.id);
            scrollToPositionIncluding(0);
          }}
          title="Delete"
        >
          <FiTrash2 size={14} color="#ef4444" />
        </button>
      </div>
      {showVisibility && otherOptions.length > 0 && (
        <div style={styles.visibilitySection}>
          <span style={styles.visibilityLabel}>Only show this choice when:</span>
          {(eInnerList.selectedCaseList ?? []).map(
            (rule: SelectedCaseListItem, ruleIdx: number) => {
              const targetOption = otherOptions.find(
                (op) => op.label === rule.selectedCaseKey
              );
              return (
                <div key={rule.id ?? ruleIdx} style={styles.visibilityRow}>
                  <select
                    style={styles.visibilitySelect}
                    value={rule.selectedCaseKey ?? ""}
                    onChange={(ev) => {
                      updateChoiceField((choice) => {
                        if (!choice.selectedCaseList) choice.selectedCaseList = [];
                        choice.selectedCaseList[ruleIdx] = {
                          ...choice.selectedCaseList[ruleIdx],
                          selectedCaseKey: ev.target.value || null,
                          selectedCaseValue: null,
                        };
                      });
                    }}
                  >
                    <option value="">Select option...</option>
                    {otherOptions.map((op) => (
                      <option key={op.id ?? op.label} value={op.label ?? ""}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  <span style={styles.visibilityEquals}>=</span>
                  <select
                    style={styles.visibilitySelect}
                    value={rule.selectedCaseValue ?? ""}
                    onChange={(ev) => {
                      updateChoiceField((choice) => {
                        if (!choice.selectedCaseList) choice.selectedCaseList = [];
                        choice.selectedCaseList[ruleIdx] = {
                          ...choice.selectedCaseList[ruleIdx],
                          selectedCaseValue: ev.target.value || null,
                        };
                      });
                    }}
                  >
                    <option value="">Select value...</option>
                    {(targetOption?.optionsList ?? []).map((opL) => (
                      <option key={opL.id} value={opL.label ?? ""}>
                        {opL.label}
                      </option>
                    ))}
                  </select>
                  <button
                    style={styles.visibilityDeleteBtn}
                    onClick={() => {
                      updateChoiceField((choice) => {
                        if (!choice.selectedCaseList) return;
                        choice.selectedCaseList.splice(ruleIdx, 1);
                      });
                    }}
                  >
                    <FiTrash2 size={12} color="#ef4444" />
                  </button>
                </div>
              );
            }
          )}
          <button
            style={styles.addRuleBtn}
            onClick={() => {
              updateChoiceField((choice) => {
                if (!choice.selectedCaseList) choice.selectedCaseList = [];
                choice.selectedCaseList.push({
                  selectedCaseKey: null,
                  selectedCaseValue: null,
                  id: Math.random().toString(36).substr(2, 9),
                });
              });
            }}
          >
            <span style={styles.addRuleTxt}>+ Add condition</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    borderLeft: "2px solid transparent",
    paddingLeft: 2,
  },
  fieldsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  nameGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 140px",
    minWidth: 100,
  },
  priceGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "0 1 160px",
    minWidth: 100,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  input: {
    height: 38,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 13,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  sizePriceRow: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap" as const,
    flex: "1 1 100%",
  },
  sizePriceGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: "1 1 60px",
    minWidth: 55,
    maxWidth: 90,
  },
  defaultQtyRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 8,
  },
  defaultQtyLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  defaultQtyInput: {
    width: 34,
    height: 26,
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "0 4px",
    fontSize: 12,
    color: "#0f172a",
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
    outline: "none",
  },
  btnsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-end",
  },
  iconBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  visibilitySection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "8px 0 4px",
    borderTop: "1px dashed #e2e8f0",
    marginTop: 4,
  },
  visibilityLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  visibilityRow: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 6,
  },
  visibilitySelect: {
    height: 32,
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "0 8px",
    fontSize: 12,
    color: "#0f172a",
    flex: 1,
    minWidth: 80,
    boxSizing: "border-box" as const,
  },
  visibilityEquals: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  visibilityDeleteBtn: {
    width: 24,
    height: 24,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  },
  addRuleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 0",
    alignSelf: "flex-start",
  },
  addRuleTxt: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D294E",
  },
};

export default OptionSelectionItem;
