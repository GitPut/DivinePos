import React from "react";
import { MdPersonOutline } from "react-icons/md";
import { FiChevronRight } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import { Employee } from "types";

interface EmployeeItemProps {
  employee: Employee;
  style?: React.CSSProperties;
}

function EmployeeItem({ employee, style }: EmployeeItemProps) {
  const history = useHistory();

  return (
    <button
      style={{ ...styles.row, ...style }}
      onClick={() => history.push(`/authed/report/editemployee/${employee.id}`)}
      className="admin-card"
    >
      <div style={styles.left}>
        <div style={styles.avatar}>
          <MdPersonOutline size={18} color="#4f46e5" />
        </div>
        <div style={styles.info}>
          <span style={styles.name}>{employee.name}</span>
          {employee.role && (
            <span style={styles.role}>{employee.role}</span>
          )}
        </div>
      </div>
      <div style={styles.right}>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: employee.clockedIn ? "#d1fae5" : "#f1f5f9",
            color: employee.clockedIn ? "#065f46" : "#64748b",
          }}
        >
          {employee.clockedIn ? "Clocked In" : "Off"}
        </span>
        <FiChevronRight size={18} color="#cbd5e1" />
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    background: "none",
    border: "none",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background-color 0.15s",
  },
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#eef2ff",
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  role: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  right: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: 6,
  },
};

export default EmployeeItem;
