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
          ? { backgroundColor: "#0f172a", color: "#fff", border: "1px solid #0f172a" }
          : { backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0" }),
      }}
      onClick={onPress}
    >
      <span
        style={{
          ...styles.percentageAmount,
          ...(isSelected ? { color: "#fff" } : { color: "#0f172a" }),
        }}
      >
        {percentageAmount}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    cursor: "pointer",
    height: 44,
    width: 44,
    boxSizing: "border-box" as const,
  },
  percentageAmount: {
    fontWeight: "600",
    fontSize: 13,
  },
};

export default PercentageButton;
