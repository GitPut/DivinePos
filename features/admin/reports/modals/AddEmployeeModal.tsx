import React, { useEffect, useState } from "react";
import useWindowSize from "shared/hooks/useWindowSize";
import InputField from "../components/InputField";
import { auth, db } from "services/firebase/config";
import { employeesState, setEmployeesState } from "store/appState";
import { useAlert } from "react-alert";

interface AddEmployeeModalProps {
  setaddEmployeeModal: (val: boolean) => void;
  addEmployeeModal: boolean;
}

function AddEmployeeModal({
  setaddEmployeeModal,
  addEmployeeModal,
}: AddEmployeeModalProps) {
  const { height, width } = useWindowSize();
  const employees = employeesState.use();
  const [name, setname] = useState("");
  const [role, setrole] = useState("");
  const [pin, setpin] = useState("");
  const alertP = useAlert();

  useEffect(() => {
    if (!addEmployeeModal) {
      setname("");
      setrole("");
      setpin("");
    }
  }, [addEmployeeModal]);

  const AddEmployee = () => {
    const employee = {
      name: name,
      role: role,
      pin: pin,
      id: Math.random().toString(36).substr(2, 9),
    };

    if (!employee.name) {
      alertP.error("Please enter a employee name");
      return;
    }
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("employees")
      .doc(employee.id.toString())
      .set(employee);
    setEmployeesState([...employees, employee]);
    setaddEmployeeModal(false);
  };

  return (
    <button
      onClick={() => setaddEmployeeModal(false)}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: height,
        width: width,
        border: "none",
        background: "none",
        cursor: "default",
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: "default" }}
      >
        <div style={styles.container}>
          <div style={styles.innerContainer}>
            <span style={styles.addEmployeeHeaderLbl}>Add Employee</span>
            <div style={styles.inputsGroup}>
              <InputField
                lbl="Name"
                placeholder="Enter name"
                style={styles.nameInput}
                value={name}
                setValue={setname}
              />
              <InputField
                lbl="Role"
                placeholder="Enter role"
                style={styles.roleInput}
                value={role}
                setValue={setrole}
              />
              <InputField
                lbl="Pin"
                placeholder="Enter pin"
                style={styles.pinInput}
                value={pin}
                setValue={setpin}
              />
            </div>
            <div style={styles.bottomBtnsRow}>
              <button
                style={styles.cancelBtn}
                onClick={() => setaddEmployeeModal(false)}
              >
                <span style={styles.cancelBtnTxt}>Cancel</span>
              </button>
              <button
                style={styles.saveBtn}
                onClick={AddEmployee}
              >
                <span style={styles.saveBtnTxt}>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 609,
    height: 399,
    backgroundColor: "white",
  },
  innerContainer: {
    width: 352,
    height: 358,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addEmployeeHeaderLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  inputsGroup: {
    width: 279,
    height: 258,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameInput: {
    height: 77,
    width: 278,
  },
  roleInput: {
    height: 77,
    width: 278,
  },
  pinInput: {
    height: 77,
    width: 278,
  },
  bottomBtnsRow: {
    width: 352,
    height: 47,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelBtn: {
    width: 170,
    height: 47,
    borderRadius: 20,
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  cancelBtnTxt: {
    fontWeight: "700",
    color: "rgba(0,0,0,1)",
    fontSize: 16,
  },
  saveBtn: {
    width: 170,
    height: 47,
    borderRadius: 20,
    backgroundColor: "#1c294e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  saveBtnTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 16,
  },
};

export default AddEmployeeModal;
