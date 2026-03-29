import React, { useEffect, useState } from "react";
import { auth, db } from "services/firebase/config";
import { parseDate } from "utils/dateFormatting";
import { isDemoState } from "store/appState";

interface ActivityEntry {
  employeeId: string;
  employeeName: string;
  action: string;
  timestamp: { seconds: number; toDate: () => Date } | null;
  id: string;
}

function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoState.get()) {
      // Show mock activity log entries in demo mode
      setEntries([
        { employeeId: "emp_demo_1", employeeName: "Johnny", action: "Applied 10% discount to order", timestamp: { seconds: Math.floor(Date.now() / 1000) - 3600, toDate: () => new Date(Date.now() - 3600000) }, id: "act_1" },
        { employeeId: "emp_demo_3", employeeName: "Peter", action: "Voided order #DM001", timestamp: { seconds: Math.floor(Date.now() / 1000) - 7200, toDate: () => new Date(Date.now() - 7200000) }, id: "act_2" },
        { employeeId: "emp_demo_1", employeeName: "Johnny", action: "Processed custom cash payment of $50.00", timestamp: { seconds: Math.floor(Date.now() / 1000) - 14400, toDate: () => new Date(Date.now() - 14400000) }, id: "act_3" },
      ]);
      setLoading(false);
      return;
    }
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    db.collection("users")
      .doc(userId)
      .collection("activityLog")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get()
      .then((snapshot) => {
        const items: ActivityEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            employeeId: data.employeeId,
            employeeName: data.employeeName,
            action: data.action,
            timestamp: data.timestamp,
            id: doc.id,
          });
        });
        setEntries(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Activity Log</span>
        <span style={styles.subtitle}>
          Recent employee actions requiring authorization
        </span>
      </div>
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={{ ...styles.headerCell, width: 200 }}>Employee</span>
          <span style={{ ...styles.headerCell, flex: 1 }}>Action</span>
          <span style={{ ...styles.headerCell, width: 200 }}>Date & Time</span>
        </div>
        {loading && (
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>Loading...</span>
          </div>
        )}
        {!loading && entries.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>No activity recorded yet</span>
          </div>
        )}
        {entries.map((entry) => {
          const date = entry.timestamp ? parseDate(entry.timestamp) : null;
          return (
            <div key={entry.id} style={styles.row}>
              <span style={{ ...styles.cell, width: 200, fontWeight: "600" }}>
                {entry.employeeName}
              </span>
              <span style={{ ...styles.cell, flex: 1 }}>{entry.action}</span>
              <span style={{ ...styles.cell, width: 200, color: "#64748b" }}>
                {date
                  ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 30,
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 24,
  },
  title: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  tableContainer: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 16px",
  },
  headerCell: {
    fontWeight: "700",
    fontSize: 13,
    color: "#475569",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  cell: {
    fontSize: 14,
    color: "#1e293b",
  },
  emptyState: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
};

export default ActivityLog;
