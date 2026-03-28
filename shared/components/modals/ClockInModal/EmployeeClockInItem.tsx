import React, { useState } from "react";
import { MdPerson } from "react-icons/md";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import { Employee } from "types";
import { setEmployeesState } from "store/appState";

interface EmployeeClockInItemProps {
  employee: Employee;
  employees: Employee[];
  isClockedIn: boolean;
}

function EmployeeClockInItem({
  employee,
  employees,
  isClockedIn,
}: EmployeeClockInItemProps) {
  const [enteredPin, setenteredPin] = useState("");
  const alertP = useAlert();

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div style={styles.iconCircle}>
          <MdPerson style={styles.personIcon} />
        </div>
        <span style={styles.employeeName}>{employee.name}</span>
      </div>
      <div style={styles.rightSide}>
        <input
          style={styles.pinInput}
          placeholder="PIN"
          onChange={(e) => setenteredPin(e.target.value)}
          value={enteredPin}
        />
        <button
          style={{
            ...styles.clockBtn,
            ...(isClockedIn
              ? { backgroundColor: "#ef4444" }
              : { backgroundColor: "#10b981" }),
          }}
          onClick={() => {
            if (enteredPin !== employee.pin && employee.pin)
              return alertP.error("Wrong PIN");
            const date = new Date();
            if (isClockedIn) {
              const endTime = `${date.getHours()}:${
                date.getMinutes() < 10
                  ? "0" + date.getMinutes()
                  : date.getMinutes()
              }`;
              db.collection("users")
                .doc(auth?.currentUser?.uid)
                .collection("employees")
                .doc(employee.id)
                .collection("hours")
                .add({
                  date: employee.clockedIn?.date,
                  startTime: employee.clockedIn?.startTime,
                  endTime: endTime,
                })
                .then(() => {
                  db.collection("users")
                    .doc(auth?.currentUser?.uid)
                    .collection("employees")
                    .doc(employee.id)
                    .update({
                      clockedIn: false,
                    });

                  const prev = [...employees];
                  prev[employees.indexOf(employee)].clockedIn = undefined;
                  setEmployeesState(prev);
                });
              setenteredPin("");
            } else {
              const startTime = `${date.getHours()}:${
                date.getMinutes() < 10
                  ? "0" + date.getMinutes()
                  : date.getMinutes()
              }`;
              db.collection("users")
                .doc(auth?.currentUser?.uid)
                .collection("employees")
                .doc(employee.id)
                .update({
                  clockedIn: {
                    startTime: startTime,
                    date: date,
                  },
                });

              const prev = [...employees];
              prev[employees.indexOf(employee)].clockedIn = {
                startTime: startTime,
                date: date,
              };
              setEmployeesState(prev);
              setenteredPin("");
            }
          }}
        >
          <span style={styles.clockBtnLabel}>
            {isClockedIn ? "Clock Out" : "Clock In"}
          </span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    display: "flex",
  },
  leftSide: {
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  personIcon: {
    color: "#64748b",
    fontSize: 22,
  },
  employeeName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 15,
  },
  rightSide: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pinInput: {
    width: 80,
    height: 36,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    textAlign: "center" as const,
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  clockBtn: {
    height: 36,
    borderRadius: 8,
    paddingLeft: 14,
    paddingRight: 14,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  clockBtnLabel: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 13,
    whiteSpace: "nowrap" as const,
  },
};

export default EmployeeClockInItem;
