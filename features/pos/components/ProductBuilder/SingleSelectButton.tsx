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
          ? { backgroundColor: "#1a2a51" }
          : { backgroundColor: "#EEF2FF" }),
      }}
      onClick={onPress}
    >
      <span
        style={{
          ...styles.lbl,
          ...(isSelected ? { color: "white" } : { color: "#28292c" }),
        }}
      >
        {label}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  lbl: {
    fontSize: 13,
  },
};

export default SingleSelectButton;
