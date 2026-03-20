import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiTrash2 } from "react-icons/fi";
import HoursItem from "./components/HoursItem";
import { employeesState, setEmployeesState } from "store/appState";
import { useHistory, useParams } from "react-router-dom";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import { Employee, HourItem } from "types";
import { parseDate } from "utils/dateFormatting";
import firebase from "firebase/compat/app";
import Switch from "shared/components/ui/Switch";

function EditEmployee() {
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
        permissions: employee?.permissions ?? {},
      });
    const newEmployeesList = [...employees];
    const index = newEmployeesList.findIndex((e) => e.id === employee.id);
    newEmployeesList[index] = employee;
    setEmployeesState(newEmployeesList);
  }

  function togglePermission(key: keyof NonNullable<Employee["permissions"]>) {
    const updatedPermissions = {
      ...employee.permissions,
      [key]: !employee.permissions?.[key],
    };
    const updatedEmployee = { ...employee, permissions: updatedPermissions };
    setemployee(updatedEmployee);
    db.collection("users")
      .doc(auth?.currentUser?.uid)
      .collection("employees")
      .doc(employeeId)
      .update({ permissions: updatedPermissions });
    const newEmployeesList = [...employees];
    const idx = newEmployeesList.findIndex((e) => e.id === employee.id);
    newEmployeesList[idx] = updatedEmployee;
    setEmployeesState(newEmployeesList);
  }

  const unpaidHours = allHours.filter((h) => !h.paid);
  const paidHours = allHours.filter((h) => h.paid);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <button
          style={styles.backBtn}
          onClick={() => history.push("/authed/report/employeesreport")}
        >
          <FiChevronLeft size={20} color="#64748b" />
          <span style={styles.backText}>Employees</span>
        </button>
        <span style={styles.title}>{employee?.name}</span>
      </div>

      {employee && (
        <div style={styles.scrollArea}>
          {/* Details card */}
          <div style={styles.card}>
            <span style={styles.cardTitle}>Employee Details</span>
            <div style={styles.fieldsRow}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Name</span>
                <input
                  style={styles.fieldInput}
                  placeholder="Enter Name"
                  value={employee?.name}
                  onChange={(e) =>
                    setemployee((prev) => ({ ...prev, name: e.target.value }))
                  }
                  onBlur={handleDataUpdate}
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>PIN</span>
                <input
                  style={styles.fieldInput}
                  placeholder="Enter PIN"
                  value={employee?.pin}
                  onChange={(e) =>
                    setemployee((prev) => ({ ...prev, pin: e.target.value }))
                  }
                  onBlur={handleDataUpdate}
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Role</span>
                <input
                  style={styles.fieldInput}
                  placeholder="Enter Role"
                  value={employee?.role}
                  onChange={(e) =>
                    setemployee((prev) => ({ ...prev, role: e.target.value }))
                  }
                  onBlur={handleDataUpdate}
                />
              </div>
            </div>
          </div>

          {/* Permissions card */}
          <div style={styles.card}>
            <span style={styles.cardTitle}>Permissions</span>
            <div style={styles.permissionsGrid}>
              {([
                { key: "accessBackend" as const, label: "Access Backend" },
                { key: "discount" as const, label: "Apply Discounts" },
                { key: "customPayment" as const, label: "Custom Payment" },
                { key: "manageOrders" as const, label: "Manage Orders" },
              ]).map((perm) => (
                <div key={perm.key} style={styles.permissionRow}>
                  <Switch
                    isActive={!!employee?.permissions?.[perm.key]}
                    toggleSwitch={() => togglePermission(perm.key)}
                  />
                  <span style={styles.permissionLabel}>{perm.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Hours card */}
          <div style={styles.card}>
            <span style={styles.cardTitle}>Add Hours</span>
            <div style={styles.addHoursRow}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Date</span>
                <input
                  id="dateSelected"
                  type="date"
                  style={styles.fieldInput}
                  onChange={(event) => {
                    const date = new Date(event.target.value);
                    date.setHours(0, 0, 0, 0);
                    date.setMinutes(0, 0);
                    date.setTime(date.getTime() + 60000 * 60 * 24);
                    setdateSelected(date);
                  }}
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Start Time</span>
                <input
                  id="startTime"
                  type="time"
                  style={styles.fieldInput}
                  onChange={(event) => setstartTime(event.target.value)}
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>End Time</span>
                <input
                  id="endTime"
                  type="time"
                  style={styles.fieldInput}
                  onChange={(event) => setendTime(event.target.value)}
                />
              </div>
              <button
                style={styles.addHoursBtn}
                onClick={() => {
                  if (!dateSelected || !startTime || !endTime)
                    return alertP.error("Please fill out all fields");
                  db.collection("users")
                    .doc(auth?.currentUser?.uid)
                    .collection("employees")
                    .doc(employee.id.toString())
                    .collection("hours")
                    .add({
                      date: firebase.firestore.Timestamp.fromDate(dateSelected),
                      startTime: startTime,
                      endTime: endTime,
                      paid: false,
                    })
                    .then((docRef) => {
                      setallHours([
                        ...allHours,
                        {
                          date: firebase.firestore.Timestamp.fromDate(dateSelected),
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
                  const dateEl = document.getElementById("dateSelected") as HTMLInputElement;
                  const startEl = document.getElementById("startTime") as HTMLInputElement;
                  const endEl = document.getElementById("endTime") as HTMLInputElement;
                  if (dateEl) dateEl.value = "";
                  if (startEl) startEl.value = "";
                  if (endEl) endEl.value = "";
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Unpaid hours */}
          <div style={styles.card}>
            <span style={styles.cardTitle}>
              Unpaid Hours
              {unpaidHours.length > 0 && (
                <span style={styles.countBadge}>{unpaidHours.length}</span>
              )}
            </span>
            {unpaidHours.length > 0 ? (
              <div style={styles.hoursTable}>
                <div style={styles.hoursHeader}>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1.5 }}>Date</span>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1 }}>Clock In</span>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1 }}>Clock Out</span>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1, textAlign: "right" }}>Actions</span>
                </div>
                {unpaidHours.map((hour) => {
                  const date = parseDate(hour.date);
                  if (!date) return null;
                  const idx = allHours.indexOf(hour);
                  return (
                    <HoursItem
                      key={hour.id}
                      date={date}
                      hour={hour}
                      employee={employee}
                      allHours={allHours}
                      setallHours={setallHours}
                      index={idx}
                      isPaid={false}
                    />
                  );
                })}
              </div>
            ) : (
              <span style={styles.emptyText}>No unpaid hours.</span>
            )}
          </div>

          {/* Paid hours */}
          <div style={styles.card}>
            <span style={styles.cardTitle}>
              Paid Hours
              {paidHours.length > 0 && (
                <span style={{ ...styles.countBadge, backgroundColor: "#d1fae5", color: "#065f46" }}>
                  {paidHours.length}
                </span>
              )}
            </span>
            {paidHours.length > 0 ? (
              <div style={styles.hoursTable}>
                <div style={styles.hoursHeader}>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1.5 }}>Date</span>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1 }}>Clock In</span>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1 }}>Clock Out</span>
                  <span style={{ ...styles.hoursHeaderCell, flex: 1, textAlign: "right" }}>Actions</span>
                </div>
                {paidHours.map((hour) => {
                  const date = parseDate(hour.date);
                  if (!date) return null;
                  const idx = allHours.indexOf(hour);
                  return (
                    <HoursItem
                      key={hour.id}
                      date={date}
                      hour={hour}
                      employee={employee}
                      allHours={allHours}
                      setallHours={setallHours}
                      index={idx}
                      isPaid={true}
                    />
                  );
                })}
              </div>
            ) : (
              <span style={styles.emptyText}>No paid hours.</span>
            )}
          </div>

          {/* Danger zone */}
          <div style={{ ...styles.card, borderTop: "2px solid #fca5a5" }}>
            <span style={{ ...styles.cardTitle, color: "#dc2626" }}>Danger Zone</span>
            <button
              style={styles.removeBtn}
              onClick={() => {
                db.collection("users")
                  .doc(auth?.currentUser?.uid)
                  .collection("employees")
                  .doc(employee.id.toString())
                  .delete();
                const filteredList = employees.filter((e) => e.id !== employee.id);
                setEmployeesState(filteredList);
                history.push("/authed/report/employeesreport");
              }}
            >
              <FiTrash2 size={16} color="#fff" />
              <span style={styles.removeBtnText}>Remove Employee</span>
            </button>
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
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    marginBottom: 20,
  },
  backBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0f172a",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: 10,
  },
  fieldsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    maxWidth: 220,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  fieldInput: {
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },
  permissionsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  permissionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 180,
  },
  permissionLabel: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  addHoursRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  addHoursBtn: {
    padding: "10px 20px",
    backgroundColor: "#1D294E",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    height: 40,
  },
  hoursTable: {
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  hoursHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  hoursHeaderCell: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  removeBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    width: "fit-content",
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
};

export default EditEmployee;
