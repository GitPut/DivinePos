import React from "react";
import { FiTrash } from "react-icons/fi";
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
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.checkboxGroup}>
        <div style={styles.checkbox}></div>
      </div>
      <span style={styles.enteredDateTxt}>{date.toDateString()}</span>
      <span style={styles.enteredInTimeTxt}>{hour.startTime}</span>
      <span style={styles.enteredOutTimeTxt1}>{hour.endTime}</span>
      <div style={styles.optionsRow}>
        <button
          style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
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
          <FiTrash style={styles.trashIcon} />
        </button>
        {isPaid ? (
          <button
            style={styles.markedAsPaidBtn}
            onClick={() => {
              db.collection("users")
                .doc(auth.currentUser?.uid)
                .collection("employees")
                .doc(employee.id.toString())
                .collection("hours")
                .doc(hour.id.toString())
                .update({
                  paid: false,
                });
              const newHours = [...allHours];
              newHours[index].paid = false;
              setallHours(newHours);
            }}
          >
            <span style={styles.markAsPaidTxt}>Mark Unpaid</span>
          </button>
        ) : (
          <button
            style={styles.markedAsPaidBtn}
            onClick={() => {
              db.collection("users")
                .doc(auth.currentUser?.uid)
                .collection("employees")
                .doc(employee.id.toString())
                .collection("hours")
                .doc(hour.id.toString())
                .update({
                  paid: true,
                });
              const newHours = [...allHours];
              newHours[index].paid = true;
              setallHours(newHours);
            }}
          >
            <span style={styles.markAsPaidTxt}>Mark as Paid</span>
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxGroup: {
    width: 233,
    height: 11,
    display: "flex",
    justifyContent: "center",
  },
  checkbox: {
    width: 12,
    height: 12,
    backgroundColor: "#E6E6E6",
    marginLeft: 20,
  },
  enteredDateTxt: {
    color: "#121212",
    width: 210,
    height: 17,
    display: "inline-block",
  },
  enteredInTimeTxt: {
    color: "#121212",
    width: 210,
    height: 17,
    display: "inline-block",
  },
  enteredOutTimeTxt1: {
    color: "#121212",
    width: 170,
    height: 17,
    display: "inline-block",
  },
  optionsRow: {
    width: 165,
    height: 41,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trashIcon: {
    color: "#eb1f1e",
    fontSize: 30,
  },
  markedAsPaidBtn: {
    width: 112,
    height: 41,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  markAsPaidTxt: {
    fontWeight: "700",
    color: "#ffffff",
  },
};

export default HoursItem;
