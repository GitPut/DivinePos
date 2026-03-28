import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import { db } from "services/firebase/config";
import { SystemLog } from "store/superAdminState";
import { parseDate } from "utils/dateFormatting";

const TYPE_COLORS: Record<string, string> = {
  signup: "#34c759",
  login: "#4f8cff",
  logout: "#8e8e93",
  subscription_change: "#af52de",
};

const TYPE_LABELS: Record<string, string> = {
  signup: "Signup",
  login: "Login",
  logout: "Logout",
  subscription_change: "Plan Change",
};

const FILTER_OPTIONS = ["all", "signup", "login", "logout", "subscription_change"];

const ActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query: firebase.firestore.Query<firebase.firestore.DocumentData> = db
      .collection("systemLogs")
      .orderBy("timestamp", "desc")
      .limit(200);

    if (typeFilter !== "all") {
      query = db
        .collection("systemLogs")
        .where("type", "==", typeFilter)
        .orderBy("timestamp", "desc")
        .limit(200);
    }

    const unsub = query.onSnapshot(
      (snap: firebase.firestore.QuerySnapshot) => {
        const items: SystemLog[] = [];
        snap.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          items.push({ id: doc.id, ...doc.data() } as SystemLog);
        });
        setLogs(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [typeFilter]);

  const formatTime = (log: SystemLog) => {
    if (!log.timestamp) return "Just now";
    const d = parseDate(log.timestamp as any);
    if (!d) return "N/A";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  return (
    <div>
      <span style={styles.pageTitle}>Activity Feed</span>
      <div style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setTypeFilter(opt)}
            style={{
              ...styles.filterBtn,
              ...(typeFilter === opt ? styles.filterBtnActive : {}),
            }}
          >
            <span
              style={{
                ...styles.filterLabel,
                ...(typeFilter === opt ? styles.filterLabelActive : {}),
              }}
            >
              {opt === "all"
                ? "All"
                : TYPE_LABELS[opt] || opt}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <span style={styles.loadingText}>Loading activity...</span>
        </div>
      ) : (
        <div style={styles.feedContainer}>
          {logs.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyText}>No activity logs yet.</span>
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} style={styles.logItem}>
              <div
                style={{
                  ...styles.badge,
                  backgroundColor: TYPE_COLORS[log.type] || "#8e8e93",
                }}
              >
                <span style={styles.badgeText}>
                  {TYPE_LABELS[log.type] || log.type}
                </span>
              </div>
              <div style={styles.logContent}>
                <div style={styles.logTopRow}>
                  <span style={styles.logEmail}>{log.email}</span>
                  <span style={styles.logTime}>{formatTime(log)}</span>
                </div>
                {log.displayName && (
                  <span style={styles.logDetail}>{log.displayName}</span>
                )}
                {log.metadata &&
                  Object.keys(log.metadata).length > 0 && (
                    <span style={styles.logMeta}>
                      {JSON.stringify(log.metadata)}
                    </span>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c294e",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: 20,
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  filterBtnActive: {
    backgroundColor: "#1c294e",
    borderColor: "#1c294e",
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  filterLabelActive: {
    color: "#fff",
  },
  feedContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  logItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    gap: 12,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 12,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  logContent: {
    flex: 1,
    gap: 2,
  },
  logTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  logTime: {
    fontSize: 12,
    color: "#8e8e93",
  },
  logDetail: {
    fontSize: 13,
    color: "#666",
  },
  logMeta: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#8e8e93",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  loadingText: {
    fontSize: 16,
    color: "#8e8e93",
  },
};

export default ActivityFeed;
