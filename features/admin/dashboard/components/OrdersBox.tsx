import React from "react";
import ordersIcon from "assets/images/image_Y7Ho..png";

function OrdersBox({ ordersValue, style }: { ordersValue: string; style: React.CSSProperties }) {
  return (
    <div style={{ ...styles.container, ...style }}>
      <img
        src={ordersIcon}
        alt=""
        style={styles.ordersIcon}
      />
      <div style={styles.rightSide}>
        <span style={styles.ordersValue}>{ordersValue}</span>
        <span style={styles.ordersTxt}>Orders</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#e6f7ff",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ordersIcon: {
    height: 48,
    width: 51,
    marginLeft: 12,
    objectFit: "contain",
  },
  rightSide: {
    width: 86,
    height: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginRight: 12,
  },
  ordersValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  ordersTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
};

export default OrdersBox;
