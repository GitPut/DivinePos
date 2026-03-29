import React from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import { Option, OptionsList, ProductProp } from "types";
import { resolveOptionPrice } from "utils/resolveOptionPrice";

interface IncludedSelectionsGroupProps {
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

function IncludedSelectionsGroup({
  label,
  isRequired,
  myObjProfile,
  setmyObjProfile,
  index,
  e,
}: IncludedSelectionsGroupProps) {
  const options = e.optionsList;

  const getTotalSelected = () => {
    let total = 0;
    myObjProfile.options[index].optionsList.forEach((item) => {
      total += parseFloat(item.selectedTimes ?? "0");
    });
    return total;
  };

  const onMinusPress = (listIndex: number) => {
    const currentTimes = parseFloat(
      myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );
    if (currentTimes > 0) {
      const newProfile = structuredClone(myObjProfile);
      newProfile.options[index].optionsList[listIndex].selectedTimes = (
        currentTimes - 1
      ).toString();
      setmyObjProfile(newProfile);
    }
  };

  const onPlusPress = (listIndex: number) => {
    const totalSelected = getTotalSelected();
    const numOfSelectable = parseFloat(e.numOfSelectable ?? "0");

    if (numOfSelectable > 0 && totalSelected + 1 > numOfSelectable) {
      return;
    }

    const currentTimes = parseFloat(
      myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList[listIndex].selectedTimes = (
      currentTimes + 1
    ).toString();
    setmyObjProfile(newProfile);
  };

  const clearAll = () => {
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList.forEach((op) => {
      op.selectedTimes = "0";
    });
    setmyObjProfile(newProfile);
  };

  const hasAnySelected = options.some(
    (op) => parseFloat(op.selectedTimes ?? "0") > 0
  );

  const totalSelected = getTotalSelected();
  const includedCount = parseFloat(e.includedSelections ?? "0");
  const hasExceededIncluded = totalSelected > includedCount;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.lbl}>
          {label} {isRequired ? "*" : ""}
        </span>
        {hasAnySelected && (
          <button style={styles.clearBtn} onClick={clearAll}>
            <MdClear size={16} color="#94a3b8" />
            <span style={styles.clearText}>Clear</span>
          </button>
        )}
      </div>
      <div style={styles.grid}>
        {options.map((option, listIndex) => {
          const selectedTimes = parseFloat(
            myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
          );
          const isSelected = selectedTimes > 0;

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
                  // Only show price tag when selections have exceeded the included count
                  if (!hasExceededIncluded) return null;
                  const resolved = e.sizeLinkedOptionLabel
                    ? parseFloat(resolveOptionPrice(option, e, myObjProfile.options))
                    : 0;
                  const itemPrice = parseFloat(option.priceIncrease ?? "0");
                  const displayPrice = resolved > 0 ? resolved : itemPrice > 0 ? itemPrice : parseFloat(e.extraSelectionPrice ?? "0");
                  return displayPrice > 0 ? (
                    <span style={styles.priceTag}>+${displayPrice.toFixed(2)}</span>
                  ) : null;
                })()}
              </div>
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
                  onClick={() => onPlusPress(listIndex)}
                >
                  <FiPlus size={14} color="#1e293b" />
                </button>
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
};

export default IncludedSelectionsGroup;
