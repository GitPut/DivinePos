import React from "react";
import { IoPerson } from "react-icons/io5";
import { FiChevronRight } from "react-icons/fi";

interface SavedCustomerItemProps {
  style?: React.CSSProperties;
  customerName: string;
}

function SavedCustomerItem({ style, customerName }: SavedCustomerItemProps) {
  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.leftSide1}>
        <IoPerson style={styles.savedCustomerIcon1} />
        <span style={styles.savedCustomerName1}>{customerName}</span>
      </div>
      <FiChevronRight style={styles.onpressCustomerDetailsIcon2} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  leftSide1: {
    width: 377,
    height: 44,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 12,
    display: "flex",
  },
  savedCustomerIcon1: {
    color: "#1c294e",
    fontSize: 40,
    paddingRight: 15,
  },
  savedCustomerName1: {
    fontWeight: "700",
    color: "#000000",
    fontSize: 20,
  },
  onpressCustomerDetailsIcon2: {
    color: "#0f0f0f",
    fontSize: 40,
  },
};

export default SavedCustomerItem;
