import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import { Option, OptionsList, ProductProp } from "types";
import { resolveOptionPrice } from "utils/resolveOptionPrice";

interface MultiSelectOptionGroupProps {
  setopenDropdown: (val: string | null) => void;
  openDropdown: string | null;
  id: string;
  label: string;
  isRequired: boolean;
  scrollY: number;
  e: Option;
  index: number;
  myObjProfile: ProductProp;
  setmyObjProfile: (val: ProductProp) => void;
  optionsSelectedLabel: string;
}

function MultiSelectOptionGroup({
  label,
  isRequired,
  myObjProfile,
  setmyObjProfile,
  index,
  e,
}: MultiSelectOptionGroupProps) {
  const options = e.optionsList;

  const [isHalfActive, setIsHalfActive] = useState(
    !!e.allowHalfAndHalf ||
    options.some((op) => op.halfSide !== undefined && parseFloat(op.selectedTimes ?? "0") > 0)
  );

  const getTotalSelected = () => {
    let total = 0;
    myObjProfile.options[index].optionsList.forEach((op) => {
      const countsAs = parseFloat(op.countsAs ?? "1");
      total += parseFloat(op.selectedTimes ?? "0") * countsAs;
    });
    return total;
  };

  const onMinusPress = (listIndex: number) => {
    const currentTimes = parseFloat(
      myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );
    if (currentTimes > 0) {
      const newProfile = structuredClone(myObjProfile);
      const newTimes = currentTimes - 1;
      newProfile.options[index].optionsList[listIndex].selectedTimes = newTimes.toString();
      if (newTimes === 0 && isHalfActive) {
        delete newProfile.options[index].optionsList[listIndex].halfSide;
      }
      setmyObjProfile(newProfile);
    }
  };

  const onPlusPress = (listIndex: number, option: OptionsList) => {
    const countsAs = parseFloat(option.countsAs ?? "1");
    const totalSelected = getTotalSelected();
    const numOfSelectable = parseFloat(e.numOfSelectable ?? "0");

    if (numOfSelectable > 0 && totalSelected + countsAs > numOfSelectable) {
      return;
    }

    const currentTimes = parseFloat(
      myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList[listIndex].selectedTimes = (
      currentTimes + 1
    ).toString();
    if (isHalfActive && !newProfile.options[index].optionsList[listIndex].halfSide) {
      newProfile.options[index].optionsList[listIndex].halfSide = "whole";
    }
    setmyObjProfile(newProfile);
  };

  const clearAll = () => {
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList.forEach((op) => {
      op.selectedTimes = "0";
      delete op.halfSide;
    });
    setmyObjProfile(newProfile);
  };

  const toggleHalfAndHalf = () => {
    const newActive = !isHalfActive;
    setIsHalfActive(newActive);
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList.forEach((op) => {
      if (newActive) {
        if (parseFloat(op.selectedTimes ?? "0") > 0) {
          op.halfSide = "whole";
        }
      } else {
        delete op.halfSide;
      }
    });
    setmyObjProfile(newProfile);
  };

  const setSide = (listIndex: number, side: "left" | "right" | "whole") => {
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList[listIndex].halfSide = side;
    setmyObjProfile(newProfile);
  };

  const hasAnySelected = options.some(
    (op) => parseFloat(op.selectedTimes ?? "0") > 0
  );

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.lbl}>
          {label} {isRequired ? "*" : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {e.allowHalfAndHalf && !isHalfActive && (
            <button
              style={styles.halfToggle}
              onClick={(ev) => {
                ev.stopPropagation();
                toggleHalfAndHalf();
              }}
            >
              Half & Half
            </button>
          )}
          {hasAnySelected && (
            <button style={styles.clearBtn} onClick={clearAll}>
              <MdClear size={16} color="#94a3b8" />
              <span style={styles.clearText}>Clear</span>
            </button>
          )}
        </div>
      </div>
      <div style={styles.grid}>
        {options.map((option, listIndex) => {
          const selectedTimes = parseFloat(
            myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
          );
          const isSelected = selectedTimes > 0;

          const currentSide = myObjProfile.options[index].optionsList[listIndex].halfSide;

          return (
            <div
              key={option.id ?? listIndex}
              style={{
                ...styles.gridItem,
                backgroundColor: isSelected ? "#eef2ff" : "#ffffff",
                borderColor: isSelected ? "#1e293b" : "#e2e8f0",
              }}
            >
              <div style={styles.gridItemLeft}>
                <span
                  style={{
                    ...styles.gridItemLabel,
                    ...(isSelected ? { fontWeight: "600" } : {}),
                  }}
                >
                  {option.label}
                </span>
                {(() => {
                  const displayPrice = resolveOptionPrice(option, e, myObjProfile.options);
                  return parseFloat(displayPrice) > 0 ? (
                    <span style={styles.priceTag}>+${displayPrice}</span>
                  ) : null;
                })()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isHalfActive && isSelected && (
                  <div style={styles.sideSelector}>
                    <button
                      style={{
                        ...styles.sideBtn,
                        ...(currentSide === "left" ? styles.sideBtnActive : {}),
                      }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSide(listIndex, "left");
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="9" stroke={currentSide === "left" ? "#fff" : "#94a3b8"} strokeWidth="1.5" fill="none" />
                        <path d="M10 1 A9 9 0 0 0 10 19 Z" fill={currentSide === "left" ? "#fff" : "#94a3b8"} />
                      </svg>
                    </button>
                    <button
                      style={{
                        ...styles.sideBtn,
                        ...(currentSide === "whole" ? styles.sideBtnWhole : {}),
                      }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSide(listIndex, "whole");
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="9" fill={currentSide === "whole" ? "#fff" : "#94a3b8"} />
                      </svg>
                    </button>
                    <button
                      style={{
                        ...styles.sideBtn,
                        ...(currentSide === "right" ? styles.sideBtnActive : {}),
                      }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSide(listIndex, "right");
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="9" stroke={currentSide === "right" ? "#fff" : "#94a3b8"} strokeWidth="1.5" fill="none" />
                        <path d="M10 1 A9 9 0 0 1 10 19 Z" fill={currentSide === "right" ? "#fff" : "#94a3b8"} />
                      </svg>
                    </button>
                  </div>
                )}
                <div style={styles.qtyControls}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => onMinusPress(listIndex)}
                  >
                    <FiMinus size={14} color={isSelected ? "#1e293b" : "#cbd5e1"} />
                  </button>
                  <span
                    style={{
                      ...styles.qtyText,
                      ...(isSelected ? { color: "#1e293b", fontWeight: "600" } : {}),
                    }}
                  >
                    {selectedTimes}
                  </span>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => onPlusPress(listIndex, option)}
                  >
                    <FiPlus size={14} color="#1e293b" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: 20,
    alignSelf: "stretch",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  lbl: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 14,
  },
  clearBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  clearText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  gridItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    minHeight: 40,
  },
  gridItemLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  gridItemLabel: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "400",
  },
  priceTag: {
    fontSize: 11,
    color: "#6366f1",
    fontWeight: "500",
    backgroundColor: "#eef2ff",
    padding: "2px 6px",
    borderRadius: 10,
    whiteSpace: "nowrap",
  },
  qtyControls: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  qtyText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    minWidth: 16,
    textAlign: "center",
  },
  halfToggle: {
    fontSize: 11,
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
  },
  sideSelector: {
    display: "flex",
    flexDirection: "row",
    gap: 2,
  },
  sideBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  sideBtnActive: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
  },
  sideBtnWhole: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
  },
};

export default MultiSelectOptionGroup;
