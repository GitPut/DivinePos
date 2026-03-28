import { Employee } from "types";
import { employeesState } from "store/appState";
import { auth, db } from "services/firebase/config";
import firebase from "firebase/compat/app";

export type PermissionKey =
  | "accessBackend"
  | "discount"
  | "customPayment"
  | "manageOrders";

export function verifyEmployeePin(
  pin: string,
  permission: PermissionKey
): Employee | null {
  const employees = employeesState.get();
  const employee = employees.find((e) => e.pin === pin);
  if (!employee) return null;
  if (!employee.permissions?.[permission]) return null;
  return employee;
}

export function logEmployeeActivity(
  employeeId: string,
  employeeName: string,
  action: string
): void {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error("logEmployeeActivity: no authenticated user");
    return;
  }
  db.collection("users")
    .doc(userId)
    .collection("activityLog")
    .add({
      employeeId,
      employeeName,
      action,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((err) => {
      console.error("Failed to log employee activity:", err);
    });
}
