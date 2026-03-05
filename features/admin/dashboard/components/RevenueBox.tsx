import React from "react";
import moneyIcon from "assets/images/image_UiWn..png";

function RevenueBox({
  style,
  revenueValue,
}: {
  style: React.CSSProperties;
  revenueValue: string;
}) {
  return (
    <div style={{ ...styles.container, ...style }}>
      <img
        src={moneyIcon}
        alt=""
        style={styles.moneyIcon}
      />
      <div style={styles.rightSide}>
        <span
          style={{
            ...styles.revenueValue,
            ...(revenueValue.length > 6 ? { fontSize: 15 } : {}),
          }}
        >
          ${revenueValue}
        </span>
        <span style={styles.revenue}>Revenue</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#e8ffe6",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moneyIcon: {
    height: 48,
    width: 51,
    marginLeft: 15,
    objectFit: "contain",
  },
  rightSide: {
    width: 86,
    height: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginRight: 13,
  },
  revenueValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  revenue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
};

export default RevenueBox;
