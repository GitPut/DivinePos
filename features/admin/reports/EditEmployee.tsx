import React, { useEffect, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import HoursItem from "./components/HoursItem";
import { employeesState, setEmployeesState } from "store/appState";
import { useHistory, useParams } from "react-router-dom";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import { Employee, HourItem } from "types";
import { parseDate } from "utils/dateFormatting";
import firebase from "firebase/compat/app";
import useWindowSize from "shared/hooks/useWindowSize";

function EditEmployee() {
  const { height } = useWindowSize();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employees = employeesState.use();
  const [employee, setemployee] = useState<Employee>(
    employees[employees.findIndex((e) => e.id === employeeId)]
  );
  const [dateSelected, setdateSelected] = useState<Date | null>(null);
  const [startTime, setstartTime] = useState<string | null>(null);
  const [endTime, setendTime] = useState<string | null>(null);
  const [allHours, setallHours] = useState<HourItem[]>([]);
  const alertP = useAlert();
  const history = useHistory();

  useEffect(() => {
    if (!employee) {
      history.push("/authed/report/employeesreport");
      return;
    }

    setemployee(employee);
    db.collection("users")
      .doc(auth?.currentUser?.uid)
      .collection("employees")
      .doc(employee.id.toString())
      .collection("hours")
      .get()
      .then((snapshot) => {
        if (snapshot.empty) return;
        const hours: HourItem[] = [];
        snapshot.forEach((doc) => {
          hours.push({
            date: doc.data().date,
            startTime: doc.data().startTime,
            endTime: doc.data().endTime,
            id: doc.id,
            paid: doc.data().paid,
          });
        });
        setallHours(hours);
      });
  }, []);

  function handleDataUpdate() {
    if (!employee.name) {
      alertP.error("Please enter a employee name");
      return;
    }
    db.collection("users")
      .doc(auth?.currentUser?.uid)
      .collection("employees")
      .doc(employeeId)
      .update({
        name: employee ? employee.name : null,
        pin: employee ? employee.pin : null,
        role: employee ? employee.role : null,
      });
    const newEmployeesList = [...employees];
    const index = newEmployeesList.findIndex((e) => e.id === employee.id);
    newEmployeesList[index] = employee;
    setEmployeesState(newEmployeesList);
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.headerContainer, height: height * 0.12 }}>
        <button
          style={{ display: "flex", flexDirection: "row", border: "none", background: "none", cursor: "pointer", padding: 0, alignItems: "flex-start" }}
          onClick={() => history.push("/authed/report/employeesreport")}
        >
          <FiChevronLeft style={styles.chevronLeftIcon} />
          <div style={styles.topHeaderGroup}>
            <span style={styles.employeeReportHeaderTxt}>Employee Report</span>
            <span style={styles.employeeName}>{employee?.name}</span>
          </div>
        </button>
      </div>
      {employee && (
        <div style={{ height: height * 0.709 }}>
          <div
            style={styles.userEmployeeReport}
          >
            <div style={{ overflow: "auto", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 50 }}>
              <div style={styles.topInputDetailsRow}>
                <div style={styles.inputGroup}>
                  <div style={styles.employeeNameInputGroup}>
                    <span style={styles.employeeNameTxt}>Employee Name</span>
                    <input
                      style={styles.employeeNameInput}
                      placeholder="Enter Name"
                      value={employee?.name}
                      onChange={(e) =>
                        setemployee((prevState) => ({
                          ...prevState,
                          name: e.target.value,
                        }))
                      }
                      onBlur={handleDataUpdate}
                    />
                  </div>
                  <div style={styles.employeePinInputGroup}>
                    <span style={styles.employeePinTxt}>Employee PIN</span>
                    <input
                      style={styles.employeePinInput}
                      placeholder="Enter PIN"
                      value={employee?.pin}
                      onChange={(e) =>
                        setemployee((prevState) => ({
                          ...prevState,
                          pin: e.target.value,
                        }))
                      }
                      onBlur={handleDataUpdate}
                    />
                  </div>
                  <div style={styles.employeeRoleInputGroup}>
                    <span style={styles.employeeRole}>Employee Role</span>
                    <input
                      style={styles.employeeRoleInput}
                      placeholder="Enter Role"
                      value={employee?.role}
                      onChange={(e) =>
                        setemployee((prevState) => ({
                          ...prevState,
                          role: e.target.value,
                        }))
                      }
                      onBlur={handleDataUpdate}
                    />
                  </div>
                </div>
                <button
                  style={styles.removeEmployeeBtn}
                  onClick={() => {
                    db.collection("users")
                      .doc(auth?.currentUser?.uid)
                      .collection("employees")
                      .doc(employee.id.toString())
                      .delete();
                    const newEmployeesList = [...employees];
                    const filteredEmployeesList = newEmployeesList.filter(
                      (e) => e.id !== employee.id
                    );
                    setEmployeesState(filteredEmployeesList);
                    history.push("/authed/report/employeesreport");
                  }}
                >
                  <span style={styles.removeEmployeeTxt}>Remove Employee</span>
                </button>
              </div>
              <div style={styles.addHoursContainer}>
                <span style={styles.addHoursSectionHeader}>Add hours</span>
                <div style={styles.addHoursRow}>
                  <div style={styles.addHoursLeftGroup}>
                    <div style={styles.dateInputGroup}>
                      <span style={styles.dateTxt}>Date:</span>
                      <div>
                        <input
                          id="dateSelected"
                          aria-label="Date"
                          type="date"
                          onChange={(event) => {
                            const date = new Date(event.target.value);
                            date.setHours(0, 0, 0, 0);
                            date.setMinutes(0, 0);
                            date.setTime(date.getTime() + 60000 * 60 * 24);
                            setdateSelected(date);
                          }}
                        />
                      </div>
                    </div>
                    <div style={styles.startTimeInputGroup}>
                      <span style={styles.startTimeTxt}>Start Time:</span>
                      <div>
                        <input
                          id="startTime"
                          aria-label="Time"
                          type="time"
                          onChange={(event) => {
                            setstartTime(event.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div style={styles.endTimeInputGroup}>
                      <span style={styles.endTimeTxt}>End Time:</span>
                      <div>
                        <input
                          id="endTime"
                          aria-label="Time"
                          type="time"
                          onChange={(event) => setendTime(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    style={styles.addBtn}
                    onClick={() => {
                      if (!dateSelected || !startTime || !endTime)
                        return alertP.error("Please fill out all fields");
                      db.collection("users")
                        .doc(auth?.currentUser?.uid)
                        .collection("employees")
                        .doc(employee.id.toString())
                        .collection("hours")
                        .add({
                          date: firebase.firestore.Timestamp.fromDate(
                            dateSelected
                          ),
                          startTime: startTime,
                          endTime: endTime,
                          paid: false,
                        })
                        .then((docRef) => {
                          setallHours([
                            ...allHours,
                            {
                              date: firebase.firestore.Timestamp.fromDate(
                                dateSelected
                              ),
                              startTime: startTime,
                              endTime: endTime,
                              id: docRef.id,
                              paid: false,
                            },
                          ]);
                        });
                      setdateSelected(null);
                      setstartTime(null);
                      setendTime(null);
                      const dateSelectedElement: HTMLInputElement | null =
                        document.getElementById(
                          "dateSelected"
                        ) as HTMLInputElement;
                      const endTimeElement: HTMLInputElement | null =
                        document.getElementById("endTime") as HTMLInputElement;
                      const startTimeElement: HTMLInputElement | null =
                        document.getElementById("startTime") as HTMLInputElement;
                      if (dateSelectedElement) dateSelectedElement.value = "";
                      if (startTimeElement) startTimeElement.value = "";
                      if (endTimeElement) endTimeElement.value = "";
                    }}
                  >
                    <span style={styles.addBtnTxt}>Add</span>
                  </button>
                </div>
              </div>
              <div style={styles.unpaidAndPaidDetails}>
                <div style={styles.unpaidGroup}>
                  <div style={styles.unpaidHeader}>
                    <div style={styles.labelsRowInner}>
                      <span style={styles.unpaidLbl}>Unpaid</span>
                      <span style={styles.unpaidDateLbl}>Date</span>
                      <span style={styles.unpaidClockInLbl}>Clock In</span>
                      <span style={styles.unpaidClockOutLbl}>Clock Out</span>
                    </div>
                  </div>
                  {allHours.length > 0 &&
                    allHours.map((hour, index) => {
                      if (hour.paid) return;

                      const date = parseDate(hour.date);
                      if (!date) return;

                      const ref = document.getElementById(
                        `unpaidSelected${index}`
                      );

                      if (ref) {
                      }

                      return (
                        <HoursItem
                          key={index}
                          style={styles.hoursItem}
                          date={date}
                          hour={hour}
                          employee={employee}
                          allHours={allHours}
                          setallHours={setallHours}
                          index={index}
                          isPaid={false}
                        />
                      );
                    })}
                </div>
                <div style={styles.paidGroup}>
                  <div style={styles.paidHeader}>
                    <div style={styles.paidLabelsRowInner}>
                      <span style={styles.paidLbl}>Paid</span>
                      <span style={styles.paidDateLbl}>Date</span>
                      <span style={styles.paidClockInLbl}>Clock In</span>
                      <span style={styles.paidClockOutLbl}>Clock Out</span>
                    </div>
                  </div>
                  {allHours.length > 0 &&
                    allHours.map((hour, index) => {
                      if (!hour.paid) return;

                      const date = parseDate(hour.date);
                      if (!date) return;

                      const ref = document.getElementById(`paidSelected${index}`);

                      if (ref) {
                      }

                      return (
                        <HoursItem
                          key={index}
                          style={styles.hoursItem}
                          date={date}
                          hour={hour}
                          employee={employee}
                          allHours={allHours}
                          setallHours={setallHours}
                          index={index}
                          isPaid={true}
                        />
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 1049,
    flex: 1,
  },
  headerContainer: {
    width: 1049,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  chevronLeftIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 27,
    marginLeft: 12,
    marginRight: 15,
  },
  topHeaderGroup: {
    width: 437,
    height: 48,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 8,
  },
  employeeReportHeaderTxt: {
    fontSize: 14,
  },
  employeeName: {
    fontSize: 18,
  },
  userEmployeeReport: {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #bdc1cb",
    boxShadow: "3px 3px 30px rgba(198, 200, 211, 0.53)",
    height: "100%",
  },
  topInputDetailsRow: {
    width: 985,
    height: 87,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "row",
    width: 709,
    height: 87,
    alignItems: "center",
    justifyContent: "space-between",
  },
  employeeNameInputGroup: {
    width: 195,
    height: 84,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  employeeNameTxt: {
    fontWeight: "700",
    color: "#61656f",
  },
  employeeNameInput: {
    width: 195,
    height: 50,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
    boxSizing: "border-box",
  },
  employeePinInputGroup: {
    width: 195,
    height: 87,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  employeePinTxt: {
    fontWeight: "700",
    color: "#61656f",
  },
  employeePinInput: {
    width: 195,
    height: 50,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
    boxSizing: "border-box",
  },
  employeeRoleInputGroup: {
    width: 195,
    height: 87,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  employeeRole: {
    fontWeight: "700",
    color: "#61656f",
  },
  employeeRoleInput: {
    width: 195,
    height: 50,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
    boxSizing: "border-box",
  },
  removeEmployeeBtn: {
    width: 162,
    height: 39,
    backgroundColor: "#eb1f1e",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
    border: "none",
    cursor: "pointer",
  },
  removeEmployeeTxt: {
    fontWeight: "700",
    color: "#ffffff",
    fontSize: 14,
    margin: 0,
    padding: 0,
  },
  addHoursContainer: {
    width: 985,
    height: 87,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 40,
  },
  addHoursSectionHeader: {
    fontWeight: "700",
    color: "#121212",
  },
  addHoursRow: {
    width: 985,
    height: 58,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  addHoursLeftGroup: {
    width: 581,
    height: 55,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputGroup: {
    width: 195,
    height: 55,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  dateTxt: {
    fontWeight: "700",
    color: "#61656f",
  },
  dateInput: {
    width: 195,
    height: 34,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
    padding: 10,
  },
  startTimeInputGroup: {
    width: 138,
    height: 55,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  startTimeTxt: {
    fontWeight: "700",
    color: "#61656f",
  },
  startTimeInput: {
    width: 138,
    height: 34,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
  },
  endTimeInputGroup: {
    width: 138,
    height: 55,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  endTimeTxt: {
    fontWeight: "700",
    color: "#61656f",
  },
  endTimeInput: {
    width: 138,
    height: 34,
    backgroundColor: "#ffffff",
    border: "1px solid #9b9b9b",
    borderRadius: 5,
  },
  addBtn: {
    width: 80,
    height: 41,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
  },
  addBtnTxt: {
    color: "#ffffff",
    fontSize: 14,
  },
  unpaidAndPaidDetails: {
    width: 992,
    marginTop: 60,
  },
  unpaidAndPaidDetails_contentContainerStyle: {
    height: "100%",
    width: 992,
  },
  unpaidGroup: {
    width: 986,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    marginBottom: 55,
  },
  unpaidHeader: {
    width: 986,
    height: 39,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderBottom: "1px solid #e6e7ee",
    marginBottom: 15,
  },
  labelsRowInner: {
    width: 750,
    height: 17,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  unpaidLbl: {
    fontWeight: "700",
    color: "#121212",
    width: 230,
    height: 17,
    display: "inline-block",
  },
  unpaidDateLbl: {
    fontWeight: "700",
    color: "#121212",
    width: 210,
    height: 17,
    display: "inline-block",
  },
  unpaidClockInLbl: {
    fontWeight: "700",
    color: "#121212",
    width: 210,
    display: "inline-block",
  },
  unpaidClockOutLbl: {
    fontWeight: "700",
    color: "#121212",
  },
  hoursItem: {
    height: 41,
    width: 986,
    marginTop: 0,
    marginBottom: 30,
  },
  hoursItem1: {
    height: 41,
    width: 986,
    marginBottom: 30,
  },
  paidGroup: {
    width: 986,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  paidHeader: {
    width: 986,
    height: 39,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderBottom: "1px solid #e6e7ee",
    marginBottom: 15,
  },
  paidLabelsRowInner: {
    width: 750,
    height: 17,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  paidLbl: {
    fontWeight: "700",
    color: "#121212",
    width: 230,
    height: 17,
    display: "inline-block",
  },
  paidDateLbl: {
    fontWeight: "700",
    color: "#121212",
    width: 210,
    height: 17,
    display: "inline-block",
  },
  paidClockInLbl: {
    fontWeight: "700",
    color: "#121212",
    width: 210,
    display: "inline-block",
  },
  paidClockOutLbl: {
    fontWeight: "700",
    color: "#121212",
  },
  hoursItem2: {
    height: 41,
    width: 986,
    marginTop: 0,
    marginBottom: 30,
  },
  hoursItem3: {
    height: 41,
    width: 986,
    marginBottom: 30,
  },
};

export default EditEmployee;
