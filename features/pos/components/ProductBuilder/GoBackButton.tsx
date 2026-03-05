import React from "react";
import { FiChevronLeft } from "react-icons/fi";

interface GoBackButtonProps {
  onPress: () => void;
}

function GoBackButton({ onPress }: GoBackButtonProps) {
  return (
    <button style={styles.container} onClick={onPress}>
      <FiChevronLeft size={40} color="#070707" />
      <span style={styles.lbl}>Go Back</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 32,
    width: 120,
    display: "flex",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  lbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 18,
  },
};

export default GoBackButton;
