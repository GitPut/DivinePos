import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { IoCheckmark } from "react-icons/io5";
import { TransListStateItem } from "types";

interface InvoiceItemProps {
  style?: React.CSSProperties;
  item: TransListStateItem;
  setbaseSelectedRows: (val: ((prev: string[]) => string[]) | string[]) => void;
  baseSelectedRows: string[];
  deleteTransaction: () => void;
}

const InvoiceItem = React.memo(
  ({
    style,
    item,
    setbaseSelectedRows,
    baseSelectedRows,
    deleteTransaction,
  }: InvoiceItemProps) => {
    const date = item.date.toDate().toLocaleString("en-US", { hour12: true });
    const isSelected = baseSelectedRows?.includes(item.id);

    const typeColors: Record<string, { bg: string; text: string }> = {
      Delivery: { bg: "#fef3c7", text: "#92400e" },
      Pickup: { bg: "#dbeafe", text: "#1e40af" },
      "In Store": { bg: "#d1fae5", text: "#065f46" },
      Other: { bg: "#f1f5f9", text: "#475569" },
    };
    const typeStyle = typeColors[item.type ?? "Other"] || typeColors["Other"];

    return (
      <div style={{ ...styles.row, ...style, backgroundColor: isSelected ? "#f0f7ff" : "#fff" }}>
        <div style={styles.checkboxCell}>
          <button
            style={{
              ...styles.checkbox,
              backgroundColor: isSelected ? "#1470ef" : "#fff",
              borderColor: isSelected ? "#1470ef" : "#d1d5db",
            }}
            onClick={() => {
              setbaseSelectedRows((prev) => {
                if (prev.includes(item.id!)) {
                  return prev.filter((id) => id !== item.id);
                } else {
                  return [...prev, item.id];
                }
              });
            }}
          >
            {isSelected && <IoCheckmark size={14} color="#fff" />}
          </button>
        </div>
        <span style={{ ...styles.cell, flex: 1.2, fontWeight: "600", color: "#0f172a" }}>
          {item.id}
        </span>
        <span style={{ ...styles.cell, flex: 1.5 }}>
          {item.name || "N/A"}
        </span>
        <span style={{ ...styles.cell, flex: 1.8, color: "#64748b", fontSize: 13 }}>
          {date}
        </span>
        <span style={{ ...styles.cell, flex: 0.8, fontWeight: "600", color: "#0f172a" }}>
          ${item.amount}
        </span>
        <span style={{ ...styles.cell, flex: 0.7, color: "#64748b" }}>
          {item.system}
        </span>
        <div style={{ flex: 0.8, display: "flex", flexDirection: "row", alignItems: "center" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: typeStyle.text,
              backgroundColor: typeStyle.bg,
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            {item.type}
          </span>
        </div>
        <div style={styles.deleteCell}>
          <button style={styles.deleteBtn} onClick={deleteTransaction}>
            <FiTrash2 size={15} color="#94a3b8" />
          </button>
        </div>
      </div>
    );
  }
);

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "0 16px",
    height: 48,
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.1s",
  },
  checkboxCell: {
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    border: "2px solid #d1d5db",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.15s",
  },
  cell: {
    fontSize: 14,
    color: "#334155",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteCell: {
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

InvoiceItem.displayName = "InvoiceItem";

export default InvoiceItem;
