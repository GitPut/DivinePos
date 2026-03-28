import React, { useEffect, useState } from "react";
import { FiPieChart, FiTrendingUp, FiShoppingBag, FiUsers, FiActivity, FiZap, FiChevronDown } from "react-icons/fi";
import { activePlanState, franchiseState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { useHistory } from "react-router-dom";
import RevenueTab from "./tabs/RevenueTab";
import ProductsTab from "./tabs/ProductsTab";
import CustomersTab from "./tabs/CustomersTab";
import OperationsTab from "./tabs/OperationsTab";
import InsightsTab from "./tabs/InsightsTab";

const TABS = [
  { key: "revenue", label: "Revenue", Icon: FiTrendingUp },
  { key: "products", label: "Products", Icon: FiShoppingBag },
  { key: "customers", label: "Customers", Icon: FiUsers },
  { key: "operations", label: "Operations", Icon: FiActivity },
  { key: "insights", label: "AI Insights", Icon: FiZap },
];

const PERIODS = ["Today", "This Week", "This Month", "This Year", "All Time"];

function AnalyticsPage() {
  const activePlan = activePlanState.use();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("revenue");
  const [period, setPeriod] = useState("This Month");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    db.collection("users")
      .doc(auth.currentUser.uid)
      .collection("stats")
      .doc("monthly")
      .get()
      .then((doc) => {
        if (doc.exists) setStats(doc.data());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const franchise = franchiseState.use();
  const hasPro = activePlan === "professional" || !!franchise.franchiseRole;

  if (!hasPro) {
    return (
      <div style={styles.container}>
        <div style={styles.upgradeCard}>
          <div style={styles.upgradeIconWrap}>
            <FiPieChart size={28} color="#6366f1" />
          </div>
          <span style={styles.upgradeTitle}>Advanced Analytics is a Pro Feature</span>
          <span style={styles.upgradeText}>Upgrade to Professional for revenue analytics, product insights, customer metrics, and AI-powered recommendations.</span>
          <button style={styles.upgradeBtn} onClick={() => history.push("/authed/settings/billingsettings")}>Upgrade to Professional</button>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    const props = { stats, period, loading };
    switch (activeTab) {
      case "revenue": return <RevenueTab {...props} />;
      case "products": return <ProductsTab {...props} />;
      case "customers": return <CustomersTab {...props} />;
      case "operations": return <OperationsTab {...props} />;
      case "insights": return <InsightsTab {...props} />;
      default: return <RevenueTab {...props} />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconWrap}>
            <FiPieChart size={20} color="#6366f1" />
          </div>
          <div>
            <span style={styles.title}>Advanced Analytics</span>
            <span style={styles.subtitle}>Deep insights into your business performance</span>
          </div>
        </div>
        <div style={styles.periodWrap}>
          <select
            style={styles.periodSelect}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <FiChevronDown size={14} color="#64748b" style={styles.periodChevron} />
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {}),
              }}
            >
              <tab.Icon size={15} color={isActive ? "#fff" : "#64748b"} />
              <span style={{ ...styles.tabLabel, ...(isActive ? styles.tabLabelActive : {}) }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={styles.tabContent}>
        {renderTab()}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 28,
    overflow: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8fafc",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
    display: "block",
  },
  periodWrap: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  periodSelect: {
    height: 40,
    paddingLeft: 14,
    paddingRight: 34,
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#1D294E",
    backgroundColor: "#fff",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
  },
  periodChevron: {
    position: "absolute" as const,
    right: 12,
    pointerEvents: "none" as const,
  },
  tabBar: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
    flexShrink: 0,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)",
  },
  tabBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: "9px 16px",
    borderRadius: 9,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabBtnActive: {
    backgroundColor: "#1D294E",
    boxShadow: "0 2px 8px rgba(29,41,78,0.25)",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  tabLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
  },
  upgradeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  },
  upgradeIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  upgradeText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center" as const,
    maxWidth: 440,
    lineHeight: "1.6",
  },
  upgradeBtn: {
    height: 46,
    paddingLeft: 32,
    paddingRight: 32,
    background: "linear-gradient(135deg, #1D294E 0%, #2d3a5e 100%)",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    cursor: "pointer",
    marginTop: 8,
    boxShadow: "0 2px 8px rgba(29,41,78,0.3)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
};

export default AnalyticsPage;
