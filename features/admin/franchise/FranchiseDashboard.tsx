import React, { useEffect, useState } from "react";
import { FiGlobe, FiMapPin, FiDollarSign, FiShoppingBag } from "react-icons/fi";
import { franchiseState } from "store/appState";
import { db } from "services/firebase/config";

interface LocationStats {
  uid: string;
  name: string;
  revenue: number;
  orders: number;
}

function FranchiseDashboard() {
  const franchise = franchiseState.use();
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!franchise.config || franchise.config.locations.length === 0) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      const stats: LocationStats[] = [];
      for (const loc of franchise.config!.locations) {
        try {
          const statsDoc = await db.collection("users").doc(loc.uid).collection("stats").doc("monthly").get();
          const data = statsDoc.data();
          let revenue = 0;
          let orders = 0;
          if (data?.days) {
            Object.values(data.days).forEach((day: any) => {
              revenue += parseFloat(day.revenue || "0");
              orders += parseInt(day.orders || "0");
            });
          }
          stats.push({ uid: loc.uid, name: loc.name, revenue, orders });
        } catch {
          stats.push({ uid: loc.uid, name: loc.name, revenue: 0, orders: 0 });
        }
      }
      setLocationStats(stats);
      setLoading(false);
    };

    fetchStats();
  }, [franchise.config]);

  const totalRevenue = locationStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = locationStats.reduce((sum, s) => sum + s.orders, 0);
  const totalLocations = franchise.config?.locations.length ?? 0;

  if (!franchise.config) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <span style={styles.emptyTitle}>No franchise configured</span>
          <span style={styles.emptySubtitle}>Contact support to set up your franchise account</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <span style={styles.title}>{franchise.config.name}</span>
          <span style={styles.subtitle}>Franchise Overview</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: "#eef2ff" }}>
            <FiMapPin size={20} color="#6366f1" />
          </div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiValue}>{totalLocations}</span>
            <span style={styles.kpiLabel}>Locations</span>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: "#f0fdf4" }}>
            <FiDollarSign size={20} color="#16a34a" />
          </div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiValue}>${totalRevenue.toFixed(2)}</span>
            <span style={styles.kpiLabel}>Total Revenue</span>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: "#fff7ed" }}>
            <FiShoppingBag size={20} color="#f59e0b" />
          </div>
          <div style={styles.kpiContent}>
            <span style={styles.kpiValue}>{totalOrders}</span>
            <span style={styles.kpiLabel}>Total Orders</span>
          </div>
        </div>
      </div>

      {/* Location Performance Table */}
      <div style={styles.tableCard}>
        <span style={styles.tableTitle}>Location Performance</span>
        {loading ? (
          <span style={styles.loadingText}>Loading stats...</span>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={{ ...styles.tableHeaderCell, flex: 2 }}>Location</span>
              <span style={styles.tableHeaderCell}>Revenue</span>
              <span style={styles.tableHeaderCell}>Orders</span>
              <span style={styles.tableHeaderCell}>Avg Order</span>
            </div>
            {locationStats.map((stat) => (
              <div key={stat.uid} style={styles.tableRow}>
                <span style={{ ...styles.tableCell, flex: 2, fontWeight: "600" }}>{stat.name}</span>
                <span style={styles.tableCell}>${stat.revenue.toFixed(2)}</span>
                <span style={styles.tableCell}>{stat.orders}</span>
                <span style={styles.tableCell}>
                  ${stat.orders > 0 ? (stat.revenue / stat.orders).toFixed(2) : "0.00"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 28,
    overflow: "auto",
    flex: 1,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    display: "block",
  },
  kpiRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  kpiCard: {
    flex: "1 1 200px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiContent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  kpiLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    padding: 24,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    display: "block",
  },
  loadingText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    padding: "10px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
};

export default FranchiseDashboard;
