import React from "react";
import { IoClose } from "react-icons/io5";
import { employeesState } from "store/appState";
import EmployeeClockInItem from "./EmployeeClockInItem";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";

const ClockInModal = () => {
  const employees = employeesState.use();
  const { clockinModal } = posState.use();

  return (
    <Modal
      isVisible={clockinModal}
      onBackdropPress={() => updatePosState({ clockinModal: false })}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.title}>Employee Clock-In</span>
            <button
              onClick={() => updatePosState({ clockinModal: false })}
              style={styles.closeBtn}
            >
              <IoClose style={styles.closeIcon} />
            </button>
          </div>

          {/* Employee list */}
          <div style={styles.listContainer}>
            {employees.map((employee) => {
              const isClockedIn = employee.clockedIn?.startTime;

              return (
                <EmployeeClockInItem
                  key={employee.id}
                  employee={employee}
                  employees={employees}
                  isClockedIn={isClockedIn ? true : false}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    width: 480,
    maxHeight: 600,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px 24px",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    width: 34,
    height: 34,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  closeIcon: {
    fontSize: 18,
    color: "#64748b",
  },
  listContainer: {
    overflow: "auto",
    padding: "16px 24px 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
};

export default ClockInModal;
