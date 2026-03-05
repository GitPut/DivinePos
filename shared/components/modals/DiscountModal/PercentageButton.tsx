import React from "react";

interface PercentageButtonProps {
  percentageAmount: string;
  style?: React.CSSProperties;
  isSelected: boolean;
  onPress: () => void;
}

function PercentageButton({
  percentageAmount,
  style,
  isSelected,
  onPress,
}: PercentageButtonProps) {
  return (
    <button
      style={{
        ...styles.container,
        ...style,
        ...(isSelected
          ? { backgroundColor: "#1c294e" }
          : { backgroundColor: "#edf1fe" }),
      }}
      onClick={onPress}
    >
      <span
        style={{
          ...styles.percentageAmount,
          ...(isSelected ? { color: "white" } : { color: "black" }),
        }}
      >
        {percentageAmount}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  percentageAmount: {
    fontWeight: "700",
    fontSize: 12,
  },
};

export default PercentageButton;
