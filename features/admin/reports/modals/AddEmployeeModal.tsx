import React, { useEffect, useState } from "react";
import { FiUser, FiShield, FiLock, FiX } from "react-icons/fi";
import { auth, db } from "services/firebase/config";
import { employeesState, setEmployeesState } from "store/appState";
import { useAlert } from "react-alert";
import Switch from "shared/components/ui/Switch";
import { EmployeePermissions } from "types";

interface AddEmployeeModalProps {
  setaddEmployeeModal: (val: boolean) => void;
  addEmployeeModal: boolean;
}

function AddEmployeeModal({
  setaddEmployeeModal,
  addEmployeeModal,
}: AddEmployeeModalProps) {
  const employees = employeesState.use();
  const [name, setname] = useState("");
  const [role, setrole] = useState("");
  const [pin, setpin] = useState("");
  const [permissions, setPermissions] = useState<EmployeePermissions>({});
  const alertP = useAlert();

  useEffect(() => {
    if (!addEmployeeModal) {
      setname("");
      setrole("");
      setpin("");
      setPermissions({});
    }
  }, [addEmployeeModal]);

  const AddEmployee = () => {
    const employee = {
      name: name,
      role: role,
      pin: pin,
      id: Math.random().toString(36).substr(2, 9),
      permissions: permissions,
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

  const permissionItems: { key: keyof EmployeePermissions; label: string; description: string }[] = [
    { key: "accessBackend", label: "Access Backend", description: "View admin panel and settings" },
    { key: "discount", label: "Apply Discounts", description: "Apply discounts to orders" },
    { key: "customPayment", label: "Custom Payment", description: "Process custom cash payments" },
    { key: "manageOrders", label: "Manage Orders", description: "Complete, cancel, or modify orders" },
  ];

  return (
    <div
      style={styles.backdrop}
      onClick={() => setaddEmployeeModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={styles.container}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.title}>Add Employee</span>
            <span style={styles.subtitle}>Add a new team member to your store</span>
          </div>
          <button style={styles.closeBtn} onClick={() => setaddEmployeeModal(false)}>
            <FiX size={16} color="#64748b" />
          </button>
        </div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Name</span>
            <div style={styles.inputRow}>
              <FiUser size={16} color="#94a3b8" />
              <input
                style={styles.input}
                placeholder="Employee name"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.fieldRowGroup}>
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <span style={styles.fieldLabel}>Role</span>
              <div style={styles.inputRow}>
                <FiShield size={16} color="#94a3b8" />
                <input
                  style={styles.input}
                  placeholder="e.g. Manager, Cashier"
                  value={role}
                  onChange={(e) => setrole(e.target.value)}
                />
              </div>
            </div>
            <div style={{ ...styles.fieldGroup, width: 140 }}>
              <span style={styles.fieldLabel}>PIN</span>
              <div style={styles.inputRow}>
                <FiLock size={16} color="#94a3b8" />
                <input
                  style={styles.input}
                  placeholder="4-digit PIN"
                  value={pin}
                  onChange={(e) => setpin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div style={styles.divider} />
          <div style={styles.permissionsSection}>
            <span style={styles.sectionTitle}>Permissions</span>
            <div style={styles.permissionsGrid}>
              {permissionItems.map((item) => (
                <div key={item.key} style={styles.permissionCard}>
                  <div style={styles.permissionInfo}>
                    <span style={styles.permissionLabel}>{item.label}</span>
                    <span style={styles.permissionDesc}>{item.description}</span>
                  </div>
                  <Switch
                    isActive={!!permissions[item.key]}
                    toggleSwitch={() =>
                      setPermissions((p) => ({ ...p, [item.key]: !p[item.key] }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.cancelBtn}
            onClick={() => setaddEmployeeModal(false)}
          >
            <span style={styles.cancelBtnTxt}>Cancel</span>
          </button>
          <button style={styles.saveBtn} onClick={AddEmployee}>
            <span style={styles.saveBtnTxt}>Add Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    cursor: "default",
  },
  container: {
    width: 500,
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    cursor: "default",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "22px 24px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
    display: "block",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  form: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldRowGroup: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  inputRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
  },
  input: {
    flex: 1,
    height: 42,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "transparent",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    margin: "4px 0",
  },
  permissionsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  permissionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  permissionCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #f1f5f9",
  },
  permissionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  permissionDesc: {
    fontSize: 12,
    color: "#94a3b8",
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    padding: "16px 24px 20px",
    borderTop: "1px solid #e2e8f0",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  cancelBtnTxt: {
    fontWeight: "600",
    color: "#475569",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1D294E",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  saveBtnTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 14,
  },
};

export default AddEmployeeModal;
