import React from "react";
import { tablesState, tableSectionsState, cartState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import { TransListStateItem, Table, CartItemProp } from "types";
import TableCard from "./TableCard";
import { setCartState } from "store/appState";
import { auth, db } from "services/firebase/config";

const TableFloorView = () => {
  const tables = tablesState.use();
  const sections = tableSectionsState.use();
  const { ongoingListState, activeTableId } = posState.use(
    (s) => ({ ongoingListState: s.ongoingListState, activeTableId: s.activeTableId }),
    shallowEqual
  );

  const activeTables = tables.filter((t) => t.isActive);

  const getSession = (tableId: string): TransListStateItem | null => {
    return ongoingListState.find(
      (order) => order.tableId === tableId && order.method === "tableOrder"
    ) || null;
  };

  const saveCurrentCart = () => {
    if (!activeTableId) return;
    const currentSession = ongoingListState.find(
      (o) => o.tableId === activeTableId && o.method === "tableOrder"
    );
    if (!currentSession) return;
    const cart = cartState.get();
    if (!cart || cart.length === 0) return;

    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("pendingOrders")
      .doc(currentSession.id)
      .update({
        cart,
        total: cart.reduce((sum: number, item: CartItemProp) => {
          return sum + parseFloat(item.price || "0") * parseFloat(item.quantity || "1");
        }, 0).toFixed(2),
      })
      .catch(() => {});
  };

  const handleTablePress = (table: Table) => {
    const session = getSession(table.id);
    if (session) {
      // Save current table cart before switching
      saveCurrentCart();
      // Load this table's cart
      setCartState(session.cart || []);
      updatePosState({
        tableViewActive: false,
        activeTableId: table.id,
        activeTableSessionId: session.id,
        cartNote: session.cartNote || "",
      });
    } else {
      // Open the table
      updatePosState({
        openTableModal: true,
        openTableTarget: table,
      });
    }
  };

  // Group tables by section
  const sectionOrder = [...sections, ""];
  const groupedTables: Record<string, Table[]> = {};
  for (const section of sectionOrder) {
    const inSection = activeTables.filter((t) => (t.section || "") === section);
    if (inSection.length > 0) {
      groupedTables[section] = inSection;
    }
  }
  // Any tables with sections not in the sections list
  for (const table of activeTables) {
    const sec = table.section || "";
    if (!groupedTables[sec]) {
      groupedTables[sec] = activeTables.filter((t) => (t.section || "") === sec);
    }
  }

  const occupiedCount = activeTables.filter((t) => getSession(t.id)).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Tables</span>
        <div style={styles.statsRow}>
          <div style={styles.statBadge}>
            <div style={{ ...styles.dot, backgroundColor: "#16a34a" }} />
            <span style={styles.statTxt}>
              {activeTables.length - occupiedCount} Available
            </span>
          </div>
          <div style={styles.statBadge}>
            <div style={{ ...styles.dot, backgroundColor: "#2563eb" }} />
            <span style={styles.statTxt}>{occupiedCount} Occupied</span>
          </div>
        </div>
      </div>
      <div style={styles.scrollArea}>
        {Object.entries(groupedTables).map(([section, sectionTables]) => (
          <div key={section} style={styles.sectionGroup}>
            {section && <span style={styles.sectionLabel}>{section}</span>}
            <div style={styles.grid}>
              {sectionTables
                .sort((a, b) => a.number - b.number)
                .map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    session={getSession(table.id)}
                    onPress={() => handleTablePress(table)}
                  />
                ))}
            </div>
          </div>
        ))}
        {activeTables.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyTxt}>No tables configured</span>
            <span style={styles.emptySubTxt}>
              Go to Settings &rarr; Table Settings to add tables
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "95%",
    flex: 1,
    paddingTop: 8,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  statsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: "6px 14px",
    border: "1px solid #e2e8f0",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 20,
  },
  sectionGroup: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 10,
    display: "block",
    letterSpacing: 0.5,
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 8,
  },
  emptyTxt: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptySubTxt: {
    fontSize: 14,
    color: "#94a3b8",
  },
};

export default TableFloorView;
