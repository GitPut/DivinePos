import React from "react";

interface SingleSelectButtonProps {
  style?: React.CSSProperties;
  label: string | null;
  isSelected: boolean;
  onPress: () => void;
}

function SingleSelectButton({
  style,
  label,
  isSelected,
  onPress,
}: SingleSelectButtonProps) {
  return (
    <button
      style={{
        ...styles.container,
        ...style,
        ...(isSelected
          ? { backgroundColor: "#1e293b", border: "1.5px solid #1e293b" }
          : { backgroundColor: "#ffffff", border: "1.5px solid #e2e8f0" }),
      }}
      onClick={onPress}
    >
      <span
        style={{
          ...styles.lbl,
          ...(isSelected ? { color: "#ffffff" } : { color: "#1a1a1a" }),
        }}
      >
        {label}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    display: "flex",
    padding: "8px 16px",
    whiteSpace: "nowrap",
  },
  lbl: {
    fontSize: 13,
    fontWeight: "500",
  },
};

export default SingleSelectButton;
