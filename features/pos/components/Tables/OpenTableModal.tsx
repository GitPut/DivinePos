import React, { useState } from "react";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { employeesState, setCartState } from "store/appState";
import { auth, db } from "services/firebase/config";
import firebase from "firebase/compat/app";
import { useAlert } from "react-alert";
import { FiX } from "react-icons/fi";

const OpenTableModal = () => {
  const { openTableModal, openTableTarget } = posState.use();
  const employees = employeesState.use();
  const [guests, setGuests] = useState("2");
  const [server, setServer] = useState("");
  const [loading, setLoading] = useState(false);
  const alertP = useAlert();

  const clockedInEmployees = employees.filter((e) => e.clockedIn);

  const close = () => {
    updatePosState({ openTableModal: false, openTableTarget: null });
    setGuests("2");
    setServer("");
  };

  const handleOpen = async () => {
    if (!openTableTarget || !auth.currentUser) return;
    const guestCount = parseInt(guests);
    if (!guestCount || guestCount < 1) {
      alertP.error("Please enter a valid number of guests");
      return;
    }

    setLoading(true);
    try {
      const now = firebase.firestore.Timestamp.now();
      const transNum = Math.random().toString(36).substr(2, 9);

      const docRef = await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .add({
          date: now,
          transNum,
          method: "tableOrder",
          cart: [],
          cartNote: "",
          total: "0.00",
          customer: { name: "", phone: "" },
          online: false,
          tableId: openTableTarget.id,
          tableName: openTableTarget.name,
          tableNumber: openTableTarget.number,
          guests: guestCount,
          server: server || "",
          seatedAt: now,
        });

      setCartState([]);
      updatePosState({
        openTableModal: false,
        openTableTarget: null,
        tableViewActive: false,
        activeTableId: openTableTarget.id,
        activeTableSessionId: docRef.id,
        cartNote: "",
        discountAmount: null,
      });
      setGuests("2");
      setServer("");
    } catch {
      alertP.error("Failed to open table");
    }
    setLoading(false);
  };

  if (!openTableTarget) return null;

  return (
    <Modal isVisible={openTableModal} onBackdropPress={close}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.topRow}>
          <span style={styles.title}>
            Open {openTableTarget.name}
          </span>
          <button style={styles.closeBtn} onClick={close}>
            <FiX size={20} color="#333" />
          </button>
        </div>

        <div style={styles.tableInfo}>
          <span style={styles.tableNum}>Table #{openTableTarget.number}</span>
          {openTableTarget.section && (
            <span style={styles.tableSection}>{openTableTarget.section}</span>
          )}
          <span style={styles.tableSeats}>{openTableTarget.seats} seats max</span>
        </div>

        <div style={styles.fieldGroup}>
          <span style={styles.label}>Number of Guests *</span>
          <input
            style={styles.input}
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            autoFocus
          />
        </div>

        <div style={styles.fieldGroup}>
          <span style={styles.label}>Server (Optional)</span>
          {clockedInEmployees.length > 0 ? (
            <select
              style={styles.input}
              value={server}
              onChange={(e) => setServer(e.target.value)}
            >
              <option value="">Select a server...</option>
              {clockedInEmployees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              style={styles.input}
              placeholder="Enter server name"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            />
          )}
        </div>

        <button
          style={{ ...styles.openBtn, opacity: loading ? 0.6 : 1 }}
          onClick={handleOpen}
          disabled={loading}
        >
          <span style={styles.openBtnTxt}>
            {loading ? "Opening..." : "Open Table"}
          </span>
        </button>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 380,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  tableInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 16,
  },
  tableNum: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  tableSection: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  tableSeats: {
    fontSize: 12,
    color: "#94a3b8",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    height: 44,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 15,
    outline: "none",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    width: "100%",
  },
  openBtn: {
    height: 48,
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  openBtnTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
};

export default OpenTableModal;
