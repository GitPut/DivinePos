import React from "react";

interface AddToCartButtonProps {
  style?: React.CSSProperties;
  onPress: () => void;
  title: string;
}

function AddToCartButton({ style, onPress, title }: AddToCartButtonProps) {
  return (
    <button style={{ ...styles.container, ...style }} onClick={onPress}>
      <span style={styles.lbl}>{title}</span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#1a2a51",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  lbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 17,
  },
};

export default AddToCartButton;
