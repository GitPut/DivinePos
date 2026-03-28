import React from "react";
import { FiArrowLeft } from "react-icons/fi";

interface GoBackButtonProps {
  onPress: () => void;
}

function GoBackButton({ onPress }: GoBackButtonProps) {
  return (
    <button style={styles.container} onClick={onPress}>
      <FiArrowLeft size={18} color="#1e293b" />
      <span style={styles.lbl}>Back to Menu</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    display: "flex",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  lbl: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: 15,
  },
};

export default GoBackButton;
