import React from "react";

interface AddToCartButtonProps {
  style?: React.CSSProperties;
  onPress: () => void;
  title: string;
  total?: number;
}

function AddToCartButton({ style, onPress, title, total }: AddToCartButtonProps) {
  return (
    <button style={{ ...styles.container, ...style }} onClick={onPress}>
      <span style={styles.lbl}>
        {total !== undefined ? `${title} — $${total.toFixed(2)}` : title}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: 50,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  lbl: {
    fontWeight: "700",
    color: "#ffffff",
    fontSize: 16,
    letterSpacing: 0.3,
  },
};

export default AddToCartButton;
