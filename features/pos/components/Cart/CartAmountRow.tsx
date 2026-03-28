import React from "react";

interface CartAmountRowProps {
  style?: React.CSSProperties;
  amountLbl: string;
  amountValue: string;
}

function CartAmountRow({style, amountLbl, amountValue} : CartAmountRowProps) {
  return (
    <div style={{ ...styles.container, ...style }}>
      <span style={styles.amountLbl}>{amountLbl}</span>
      <span style={styles.amountValue}>{amountValue}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  amountLbl: {
    color: "#666",
    fontSize: 13,
  },
  amountValue: {
    color: "#1a1a1a",
    fontSize: 13,
  },
};

export default CartAmountRow;
