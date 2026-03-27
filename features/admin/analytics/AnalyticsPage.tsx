import React, { useEffect, useState } from "react";
import { FiPieChart, FiTrendingUp, FiShoppingBag, FiUsers, FiActivity, FiZap, FiDownload } from "react-icons/fi";
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
          <FiPieChart size={32} color="#1D294E" />
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
        <div>
          <span style={styles.title}>Advanced Analytics</span>
          <span style={styles.subtitle}>Deep insights into your business performance</span>
        </div>
        <select
          style={styles.periodSelect}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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
              <tab.Icon size={16} color={isActive ? "#1D294E" : "#94a3b8"} />
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
  container: { padding: 28, overflow: "auto", flex: 1, display: "flex", flexDirection: "column" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", display: "block" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4, display: "block" },
  periodSelect: { height: 40, paddingLeft: 14, paddingRight: 14, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#0f172a", backgroundColor: "#fff", cursor: "pointer", outline: "none" },
  tabBar: { display: "flex", flexDirection: "row", gap: 4, borderBottom: "1px solid #e2e8f0", paddingBottom: 0, marginBottom: 20, flexShrink: 0 },
  tabBtn: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: "8px 8px 0 0", border: "none", backgroundColor: "transparent", cursor: "pointer", borderBottom: "2px solid transparent", transition: "all 0.15s" },
  tabBtnActive: { backgroundColor: "#f8fafc", borderBottomColor: "#1D294E" },
  tabLabel: { fontSize: 13, fontWeight: "500", color: "#94a3b8" },
  tabLabelActive: { color: "#1D294E", fontWeight: "600" },
  tabContent: { flex: 1, minHeight: 0, overflow: "auto" },
  upgradeCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12, backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" },
  upgradeTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  upgradeText: { fontSize: 14, color: "#94a3b8", textAlign: "center" as const, maxWidth: 420 },
  upgradeBtn: { height: 44, paddingLeft: 28, paddingRight: 28, backgroundColor: "#1D294E", borderRadius: 10, border: "none", color: "#fff", fontSize: 15, fontWeight: "600", cursor: "pointer", marginTop: 8 },
};

export default AnalyticsPage;
