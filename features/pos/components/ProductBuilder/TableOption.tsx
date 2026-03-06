import React, { useEffect, useState } from "react";
import { FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import { Option, OptionsList, ProductProp } from "types";

interface TableOptionProps {
  label: string;
  isRequired: boolean;
  myObjProfile: ProductProp;
  setMyObjProfile: (
    val: ((prev: ProductProp) => ProductProp) | ProductProp
  ) => void;
  index: number;
  e: Option;
  optionsSelectedLabel: string;
}

function TableOption({
  label,
  isRequired,
  myObjProfile,
  setMyObjProfile,
  index,
  e,
  optionsSelectedLabel,
}: TableOptionProps) {
  const options = e.optionsList;

  const getTotalSelected = () => {
    let total = 0;
    myObjProfile.options[index].optionsList.forEach((op) => {
      const countsAs = parseFloat(op.countsAs ?? "1");
      total += parseFloat(op.selectedTimes ?? "0") * countsAs;
    });
    return total;
  };

  const toggleItem = (listIndex: number, option: OptionsList) => {
    const currentTimes = parseFloat(
      myObjProfile.options[index].optionsList[listIndex].selectedTimes ?? "0"
    );
    const countsAs = parseFloat(option.countsAs ?? "1");

    if (currentTimes > 0) {
      // Deselect
      const newProfile = structuredClone(myObjProfile);
      newProfile.options[index].optionsList[listIndex].selectedTimes = "0";
      setMyObjProfile(newProfile);
    } else {
      // Check limit
      const totalSelected = getTotalSelected();
      const numOfSelectable = parseFloat(e.numOfSelectable ?? "0");

      if (
        numOfSelectable > 0 &&
        totalSelected + countsAs > numOfSelectable
      ) {
        return;
      }

      const newProfile = structuredClone(myObjProfile);
      newProfile.options[index].optionsList[listIndex].selectedTimes = "1";
      setMyObjProfile(newProfile);
    }
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
      setMyObjProfile(newProfile);
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
    setMyObjProfile(newProfile);
  };

  const clearAll = () => {
    const newProfile = structuredClone(myObjProfile);
    newProfile.options[index].optionsList.forEach((op) => {
      op.selectedTimes = "0";
    });
    setMyObjProfile(newProfile);
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
            <button
              key={option.id ?? listIndex}
              style={{
                ...styles.gridItem,
                ...(isSelected
                  ? {
                      backgroundColor: "#eef2ff",
                      borderColor: "#1e293b",
                    }
                  : {}),
              }}
              onClick={() => toggleItem(listIndex, option)}
            >
              <div style={styles.gridItemLeft}>
                <div
                  style={{
                    ...styles.checkbox,
                    ...(isSelected
                      ? { backgroundColor: "#1e293b", borderColor: "#1e293b" }
                      : {}),
                  }}
                >
                  {isSelected && <FiCheck size={12} color="#ffffff" />}
                </div>
                <span
                  style={{
                    ...styles.gridItemLabel,
                    ...(isSelected ? { fontWeight: "600" } : {}),
                  }}
                >
                  {option.label}
                </span>
              </div>
              <div style={styles.gridItemRight}>
                {parseFloat(option.priceIncrease ?? "0") > 0 && (
                  <span style={styles.priceTag}>+${option.priceIncrease}</span>
                )}
                {selectedTimes > 1 && (
                  <span style={styles.qtyBadge}>x{selectedTimes}</span>
                )}
              </div>
            </button>
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
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    minHeight: 40,
  },
  gridItemLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: "1.5px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  gridItemLabel: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "400",
  },
  gridItemRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceTag: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "500",
    backgroundColor: "#eef2ff",
    padding: "2px 8px",
    borderRadius: 10,
  },
  qtyBadge: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
    backgroundColor: "#1e293b",
    padding: "2px 6px",
    borderRadius: 8,
    minWidth: 20,
    textAlign: "center",
  },
};

export default TableOption;
