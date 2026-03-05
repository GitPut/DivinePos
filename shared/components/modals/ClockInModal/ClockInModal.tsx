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
          <div style={styles.closeIconContainer}>
            <button
              onClick={() => updatePosState({ clockinModal: false })}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <IoClose style={styles.closeIcon} />
            </button>
          </div>
          <div style={styles.secondAreaContainer}>
            <span style={styles.employeesClockIn}>
              Employee&#39;s Clock-In
            </span>
            <div style={styles.employeesScrollView}>
              <div
                style={{
                  overflow: "auto",
                  height: "100%",
                  width: 421,
                  alignItems: "center",
                  paddingTop: 3,
                  paddingRight: 25,
                  marginLeft: 25,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
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
        </div>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    width: 540,
    height: 609,
    display: "flex",
    flexDirection: "column",
  },
  closeIconContainer: {
    width: 540,
    height: 58,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    display: "flex",
  },
  closeIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
    margin: 20,
  },
  secondAreaContainer: {
    width: 421,
    height: 523,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  employeesClockIn: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    display: "block",
  },
  employeesScrollView: {
    height: 460,
    margin: 0,
  },
};

export default ClockInModal;
