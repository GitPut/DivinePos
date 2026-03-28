import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import { db } from "services/firebase/config";

interface Stats {
  totalAccounts: number;
  errorsToday: number;
  loginsToday: number;
  signupsToday: number;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalAccounts: 0,
    errorsToday: 0,
    loginsToday: 0,
    signupsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startOfToday = firebase.firestore.Timestamp.fromDate(now);

    const unsubs: (() => void)[] = [];

    // Total accounts — real-time
    unsubs.push(
      db.collection("users").onSnapshot(
        (snap) => {
          setStats((prev) => ({ ...prev, totalAccounts: snap.size }));
          setLoading(false);
        },
        () => setLoading(false)
      )
    );

    // Errors today — real-time
    unsubs.push(
      db.collection("systemErrors")
        .where("timestamp", ">=", startOfToday)
        .onSnapshot(
          (snap) => setStats((prev) => ({ ...prev, errorsToday: snap.size })),
          () => {}
        )
    );

    // Logins today — real-time
    unsubs.push(
      db.collection("systemLogs")
        .where("type", "==", "login")
        .where("timestamp", ">=", startOfToday)
        .onSnapshot(
          (snap) => setStats((prev) => ({ ...prev, loginsToday: snap.size })),
          () => {}
        )
    );

    // Signups today — real-time
    unsubs.push(
      db.collection("systemLogs")
        .where("type", "==", "signup")
        .where("timestamp", ">=", startOfToday)
        .onSnapshot(
          (snap) => setStats((prev) => ({ ...prev, signupsToday: snap.size })),
          () => {}
        )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Loading dashboard...</span>
      </div>
    );
  }

  const cards: { label: string; value: number; color: string }[] = [
    { label: "Total Accounts", value: stats.totalAccounts, color: "#4f8cff" },
    { label: "Signups Today", value: stats.signupsToday, color: "#34c759" },
    { label: "Logins Today", value: stats.loginsToday, color: "#5856d6" },
    { label: "Errors Today", value: stats.errorsToday, color: "#ff3b30" },
  ];

  return (
    <div>
      <span style={styles.pageTitle}>Dashboard Overview</span>
      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={styles.card}>
            <div
              style={{
                ...styles.cardIndicator,
                backgroundColor: card.color,
              }}
            />
            <span style={styles.cardValue}>{card.value}</span>
            <span style={styles.cardLabel}>{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c294e",
    marginBottom: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 20,
  } as any,
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "24px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "relative",
    overflow: "hidden",
  },
  cardIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 4,
    borderRadius: "12px 12px 0 0",
  },
  cardValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1c294e",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
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

export default DashboardOverview;
