import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import EmployeeItem from "./components/EmployeeItem";
import { employeesState } from "store/appState";
import Modal from "shared/components/ui/Modal";
import AddEmployeeModal from "./modals/AddEmployeeModal";

const EmployeesReport = () => {
  const employees = employeesState.use();
  const [addEmployeeModal, setaddEmployeeModal] = useState(false);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Employees</span>
          <span style={styles.subtitle}>
            {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button style={styles.addBtn} onClick={() => setaddEmployeeModal(true)}>
          <FiPlus size={18} color="#fff" />
          <span style={styles.addBtnText}>Add Employee</span>
        </button>
      </div>

      {/* Employee list */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <span style={styles.headerCell}>Employee</span>
          <span style={{ ...styles.headerCell, textAlign: "right" }}>Status</span>
        </div>
        <div style={styles.tableBody}>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <EmployeeItem key={employee.id} employee={employee} />
            ))
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyText}>No employees added yet.</span>
            </div>
          )}
        </div>
      </div>

      <Modal
        isVisible={addEmployeeModal}
        onBackdropPress={() => setaddEmployeeModal(false)}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            width: "100%",
            position: "absolute",
            left: 0,
            top: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AddEmployeeModal
            setaddEmployeeModal={setaddEmployeeModal}
            addEmployeeModal={addEmployeeModal}
          />
        </div>
      </Modal>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  addBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: "#1470ef",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tableWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    minHeight: 0,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableBody: {
    flex: 1,
    overflow: "auto",
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
};

export default EmployeesReport;
