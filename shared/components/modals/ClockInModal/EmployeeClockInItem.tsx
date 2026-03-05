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
      <div style={styles.leftSideGroup}>
        <MdPerson style={styles.personIcon} />
        <span style={styles.employeeName}>{employee.name}</span>
      </div>
      <div style={styles.rightSideGroup}>
        <div style={styles.textInputRow}>
          <input
            style={styles.textInput}
            placeholder="PIN"
            onChange={(e) => setenteredPin(e.target.value)}
            value={enteredPin}
          />
          <button
            style={{
              ...styles.button,
              ...(isClockedIn && { backgroundColor: "#FF0000" }),
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
            <span style={styles.clockInLabel}>
              {isClockedIn ? "Clock Out" : "Clock In"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    flexDirection: "row",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "space-between",
    height: 84,
    width: 415,
    marginBottom: 30,
    display: "flex",
  },
  leftSideGroup: {
    width: 114,
    height: 55,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 15,
    display: "flex",
  },
  personIcon: {
    color: "#1c294e",
    fontSize: 55,
  },
  employeeName: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  rightSideGroup: {
    width: 183,
    height: 49,
    margin: 15,
    flexDirection: "row",
    display: "flex",
  },
  textInput: {
    width: 85,
    height: 35,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b4b5b8",
    borderStyle: "solid" as const,
    marginTop: 7,
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
  },
  button: {
    width: 92,
    height: 49,
    backgroundColor: "#03c551",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 7,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  clockInLabel: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
  textInputRow: {
    height: 49,
    flexDirection: "row",
    flex: 1,
    marginRight: -1,
    display: "flex",
  },
};

export default EmployeeClockInItem;
