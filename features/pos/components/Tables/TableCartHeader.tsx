import React, { useEffect, useState } from "react";
import { posState, updatePosState } from "store/posState";
import { tablesState } from "store/appState";
import { FiArrowLeft, FiUsers, FiClock } from "react-icons/fi";
import { parseDate } from "utils/dateFormatting";
import { setCartState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { cartState } from "store/appState";

const TableCartHeader = () => {
  const { activeTableId, activeTableSessionId, ongoingListState } = posState.use();
  const tables = tablesState.use();
  const cart = cartState.use();
  const [elapsed, setElapsed] = useState("");

  const table = tables.find((t) => t.id === activeTableId);
  const session = ongoingListState.find(
    (o) => o.tableId === activeTableId && o.method === "tableOrder"
  );

  useEffect(() => {
    if (!session?.seatedAt) return;
    const update = () => {
      const seatedDate = session.seatedAt ? parseDate(session.seatedAt) : null;
      if (!seatedDate) return;
      const diff = Math.floor((Date.now() - seatedDate.getTime()) / 60000);
      if (diff < 60) {
        setElapsed(`${diff}m`);
      } else {
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setElapsed(`${h}h ${m}m`);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [session?.seatedAt]);

  // Auto-save cart to pending order when cart changes
  useEffect(() => {
    if (!activeTableSessionId || !auth.currentUser) return;
    // Store on window for TableFloorView to access when switching
    (window as any).__currentCart = cart;

    const timeout = setTimeout(() => {
      const total = cart.reduce((sum, item) => {
        return sum + parseFloat(item.price || "0") * parseFloat(item.quantity || "1");
      }, 0);

      db.collection("users")
        .doc(auth.currentUser!.uid)
        .collection("pendingOrders")
        .doc(activeTableSessionId)
        .update({
          cart,
          total: total.toFixed(2),
        })
        .catch(() => {});
    }, 500);

    return () => clearTimeout(timeout);
  }, [cart, activeTableSessionId]);

  const handleBack = () => {
    setCartState([]);
    updatePosState({
      tableViewActive: true,
      activeTableId: null,
      activeTableSessionId: null,
    });
  };

  if (!table || !session) return null;

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={handleBack}>
          <FiArrowLeft size={16} color="#1e293b" />
        </button>
        <div style={styles.tableNameGroup}>
          <span style={styles.tableName}>{table.name}</span>
          <span style={styles.tableNum}>#{table.number}</span>
        </div>
      </div>
      <div style={styles.infoRow}>
        <div style={styles.infoBadge}>
          <FiUsers size={12} color="#475569" />
          <span style={styles.infoTxt}>{session.guests || "?"}</span>
        </div>
        <div style={styles.infoBadge}>
          <FiClock size={12} color="#475569" />
          <span style={styles.infoTxt}>{elapsed || "0m"}</span>
        </div>
        {session.server && (
          <span style={styles.serverTxt}>{session.server}</span>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "10px 16px",
    backgroundColor: "#eef2ff",
    borderBottom: "1px solid #c7d2fe",
    flexShrink: 0,
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#fff",
    border: "1px solid #c7d2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  tableNameGroup: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tableName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  tableNum: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 40,
  },
  infoBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  serverTxt: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "500",
  },
};

export default TableCartHeader;
