import React from "react";
import { FiUser, FiChevronRight } from "react-icons/fi";

interface SavedCustomerItemProps {
  style?: React.CSSProperties;
  customerName: string;
}

function SavedCustomerItem({ style, customerName }: SavedCustomerItemProps) {
  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.left}>
        <div style={styles.avatar}>
          <FiUser size={16} color="#64748b" />
        </div>
        <span style={styles.name}>{customerName}</span>
      </div>
      <FiChevronRight size={18} color="#94a3b8" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    display: "flex",
  },
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  name: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
};

export default SavedCustomerItem;
