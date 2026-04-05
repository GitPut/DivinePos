import React from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { OptionsList } from "types";

interface OptionSelectorContainerProps {
  style?: React.CSSProperties;
  option: OptionsList;
  onMinusPress: () => void;
  onPlusPress: () => void;
}

function OptionSelectorContainer({
  style,
  option,
  onMinusPress,
  onPlusPress,
}: OptionSelectorContainerProps) {
  return (
    <button
      style={{
        ...styles.container,
        ...style,
        ...(parseFloat(option.selectedTimes ?? '0') > 0
          ? { backgroundColor: "#314ab0" }
          : undefined),
      }}
      onClick={onPlusPress}
    >
      <button style={styles.minusBtn} onClick={(e) => { e.stopPropagation(); onMinusPress(); }}>
        <FiMinus size={25} color="rgba(128,128,128,1)" />
      </button>
      <div style={styles.itemNameRow}>
        <span
          style={{
            ...styles.amountSelected,
            ...(parseFloat(option.selectedTimes ?? '0') > 0 ? { color: "white" } : undefined),
          }}
        >
          {option.selectedTimes ? option.selectedTimes : 0} x
        </span>
        <span
          style={{
            ...styles.itemNameAndPriceIncrease,
            ...(parseFloat(option.selectedTimes ?? '0') > 0 ? { color: "white" } : undefined),
          }}
        >{`${option.label} ${
          option.priceIncrease ? `(+$${parseFloat(option.priceIncrease).toFixed(2)})` : ""
        }`}</span>
      </div>
      <button style={styles.plusBtn} onClick={(e) => { e.stopPropagation(); onPlusPress(); }}>
        <FiPlus size={25} color="rgba(128,128,128,1)" />
      </button>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    border: "1px solid rgba(184,178,178,1)",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 300,
    minHeight: 40,
    display: "flex",
    cursor: "pointer",
    background: "none",
    padding: 0,
  },
  minusBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#E6E6E6",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  itemNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  amountSelected: {
    color: "#121212",
    marginRight: 5,
  },
  itemNameAndPriceIncrease: {
    color: "#121212",
  },
  plusBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#E6E6E6",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
};

export default OptionSelectorContainer;
