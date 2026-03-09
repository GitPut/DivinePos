import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import { db } from "services/firebase/config";
import { SystemError } from "store/superAdminState";
import { parseDate } from "utils/dateFormatting";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const SOURCE_COLORS: Record<string, string> = {
  "window.onerror": "#ff3b30",
  unhandledrejection: "#ff9500",
  ErrorBoundary: "#af52de",
  manual: "#8e8e93",
};

const SOURCE_LABELS: Record<string, string> = {
  "window.onerror": "Runtime",
  unhandledrejection: "Promise",
  ErrorBoundary: "Component",
  manual: "Manual",
};

const FILTER_OPTIONS = [
  "all",
  "window.onerror",
  "unhandledrejection",
  "ErrorBoundary",
];

const ErrorFeed: React.FC = () => {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query: firebase.firestore.Query<firebase.firestore.DocumentData> = db
      .collection("systemErrors")
      .orderBy("timestamp", "desc")
      .limit(200);

    if (sourceFilter !== "all") {
      query = db
        .collection("systemErrors")
        .where("source", "==", sourceFilter)
        .orderBy("timestamp", "desc")
        .limit(200);
    }

    const unsub = query.onSnapshot(
      (snap: firebase.firestore.QuerySnapshot) => {
        const items: SystemError[] = [];
        snap.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          items.push({ id: doc.id, ...doc.data() } as SystemError);
        });
        setErrors(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [sourceFilter]);

  const formatTime = (err: SystemError) => {
    if (!err.timestamp) return "Just now";
    const d = parseDate(err.timestamp as any);
    if (!d) return "N/A";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  return (
    <div>
      <span style={styles.pageTitle}>Error Feed</span>
      <div style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSourceFilter(opt)}
            style={{
              ...styles.filterBtn,
              ...(sourceFilter === opt ? styles.filterBtnActive : {}),
            }}
          >
            <span
              style={{
                ...styles.filterLabel,
                ...(sourceFilter === opt ? styles.filterLabelActive : {}),
              }}
            >
              {opt === "all" ? "All" : SOURCE_LABELS[opt] || opt}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <span style={styles.loadingText}>Loading errors...</span>
        </div>
      ) : (
        <div style={styles.feedContainer}>
          {errors.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyText}>No errors logged.</span>
            </div>
          )}
          {errors.map((err) => {
            const isExpanded = expandedId === err.id;
            return (
              <button
                key={err.id}
                style={styles.errorItem}
                onClick={() => setExpandedId(isExpanded ? null : err.id)}
              >
                <div style={styles.errorTopRow}>
                  <div
                    style={{
                      ...styles.badge,
                      backgroundColor:
                        SOURCE_COLORS[err.source] || "#8e8e93",
                    }}
                  >
                    <span style={styles.badgeText}>
                      {SOURCE_LABELS[err.source] || err.source}
                    </span>
                  </div>
                  <div style={styles.errorContent}>
                    <span style={styles.errorMessage}>
                      {err.message.length > 120
                        ? err.message.slice(0, 120) + "..."
                        : err.message}
                    </span>
                    <div style={styles.errorMeta}>
                      <span style={styles.errorEmail}>
                        {err.email || "Anonymous"}
                      </span>
                      <span style={styles.errorDot}>-</span>
                      <span style={styles.errorRoute}>{err.route}</span>
                      <span style={styles.errorDot}>-</span>
                      <span style={styles.errorTime}>{formatTime(err)}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <FiChevronDown size={16} color="#8e8e93" />
                  ) : (
                    <FiChevronRight size={16} color="#8e8e93" />
                  )}
                </div>

                {isExpanded && (
                  <div style={styles.expandedSection}>
                    {err.stack && (
                      <div style={styles.stackSection}>
                        <span style={styles.stackLabel}>Stack Trace</span>
                        <pre style={styles.stackTrace}>{err.stack}</pre>
                      </div>
                    )}
                    {err.componentStack && (
                      <div style={styles.stackSection}>
                        <span style={styles.stackLabel}>
                          Component Stack
                        </span>
                        <pre style={styles.stackTrace}>
                          {err.componentStack}
                        </pre>
                      </div>
                    )}
                    <div style={styles.detailGrid}>
                      <DetailItem label="User ID" value={err.uid || "N/A"} />
                      <DetailItem label="URL" value={err.url} />
                      <DetailItem
                        label="User Agent"
                        value={err.userAgent?.slice(0, 100) || "N/A"}
                      />
                      {err.extra &&
                        Object.keys(err.extra).length > 0 && (
                          <DetailItem
                            label="Extra"
                            value={JSON.stringify(err.extra)}
                          />
                        )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div style={detailStyles.row}>
    <span style={detailStyles.label}>{label}:</span>
    <span style={detailStyles.value}>{value}</span>
  </div>
);

const detailStyles: Record<string, React.CSSProperties> = {
  row: {
    flexDirection: "row",
    gap: 8,
    padding: "4px 0",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8e8e93",
    minWidth: 80,
    flexShrink: 0,
  },
  value: {
    fontSize: 12,
    color: "#555",
    wordBreak: "break-all",
  },
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
  errorItem: {
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "background-color 0.15s",
  },
  errorTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  errorContent: {
    flex: 1,
    gap: 4,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    lineHeight: "1.4",
  },
  errorMeta: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  errorEmail: {
    fontSize: 12,
    color: "#4f8cff",
    fontWeight: "500",
  },
  errorDot: {
    fontSize: 12,
    color: "#ccc",
  },
  errorRoute: {
    fontSize: 12,
    color: "#888",
    fontFamily: "monospace",
  },
  errorTime: {
    fontSize: 12,
    color: "#8e8e93",
  },
  expandedSection: {
    marginTop: 12,
    padding: "12px 0 0",
    borderTop: "1px solid #f0f0f0",
    gap: 12,
  },
  stackSection: {
    gap: 4,
  },
  stackLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8e8e93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stackTrace: {
    fontSize: 11,
    fontFamily: "monospace",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    overflow: "auto",
    maxHeight: 200,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    color: "#c0392b",
    margin: 0,
    display: "block",
  },
  detailGrid: {
    gap: 2,
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

export default ErrorFeed;
