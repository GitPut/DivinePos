import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { auth, db } from "services/firebase/config";
import { Employee, HourItem } from "types";

interface HoursItemProps {
  style?: React.CSSProperties;
  date: Date;
  hour: HourItem;
  employee: Employee;
  allHours: HourItem[];
  setallHours: (val: HourItem[]) => void;
  index: number;
  isPaid: boolean;
}

function HoursItem({
  style,
  date,
  hour,
  employee,
  allHours,
  setallHours,
  index,
  isPaid,
}: HoursItemProps) {
  return (
    <div style={{ ...styles.row, ...style }}>
      <span style={{ ...styles.cell, flex: 1.5 }}>{date.toDateString()}</span>
      <span style={{ ...styles.cell, flex: 1 }}>{hour.startTime}</span>
      <span style={{ ...styles.cell, flex: 1 }}>{hour.endTime}</span>
      <div style={styles.actions}>
        <button
          style={{
            ...styles.paidBtn,
            backgroundColor: isPaid ? "#f1f5f9" : "#1D294E",
            color: isPaid ? "#475569" : "#fff",
            border: isPaid ? "1px solid #e2e8f0" : "none",
          }}
          onClick={() => {
            const newPaid = !isPaid;
            db.collection("users")
              .doc(auth.currentUser?.uid)
              .collection("employees")
              .doc(employee.id.toString())
              .collection("hours")
              .doc(hour.id.toString())
              .update({ paid: newPaid });
            const newHours = [...allHours];
            newHours[index].paid = newPaid;
            setallHours(newHours);
          }}
        >
          {isPaid ? "Mark Unpaid" : "Mark Paid"}
        </button>
        <button
          style={styles.deleteBtn}
          onClick={() => {
            db.collection("users")
              .doc(auth.currentUser?.uid)
              .collection("employees")
              .doc(employee.id.toString())
              .collection("hours")
              .doc(hour.id.toString())
              .delete();
            const newHours = [...allHours];
            newHours.splice(index, 1);
            setallHours(newHours);
          }}
        >
          <FiTrash2 size={15} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  cell: {
    fontSize: 14,
    color: "#334155",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  paidBtn: {
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
    cursor: "pointer",
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

export default HoursItem;
