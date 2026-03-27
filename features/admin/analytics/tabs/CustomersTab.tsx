import React, { useMemo } from "react";
import { FiUsers, FiDownload } from "react-icons/fi";
import { customersState } from "store/appState";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { exportToCSV } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

function CustomersTab({ stats, period, loading }: Props) {
  const customers = customersState.use();

  // Customer LTV (top 20 by totalSpent)
  const topCustomers = useMemo(() => {
    return [...customers]
      .filter((c) => (c.totalSpent || 0) > 0 || (c.orderCount || 0) > 0)
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, 20);
  }, [customers]);

  // Retention analysis
  const now = Date.now();
  const retentionData = useMemo(() => {
    let active30 = 0, active60 = 0, active90 = 0, atRisk = 0, noOrders = 0;
    customers.forEach((c) => {
      if (!c.lastOrderDate?.seconds) { noOrders++; return; }
      const daysSince = (now - c.lastOrderDate.seconds * 1000) / 86400000;
      if (daysSince <= 30) active30++;
      else if (daysSince <= 60) active60++;
      else if (daysSince <= 90) active90++;
      else atRisk++;
    });
    return [
      { name: "Last 30 days", value: active30, color: "#16a34a" },
      { name: "31-60 days", value: active60, color: "#f59e0b" },
      { name: "61-90 days", value: active90, color: "#f97316" },
      { name: "90+ days (at risk)", value: atRisk, color: "#ef4444" },
      { name: "No orders", value: noOrders, color: "#94a3b8" },
    ].filter((d) => d.value > 0);
  }, [customers, now]);

  // Visit frequency distribution
  const frequencyData = useMemo(() => {
    const buckets = { "1 order": 0, "2-3 orders": 0, "4-6 orders": 0, "7-10 orders": 0, "11+ orders": 0 };
    customers.forEach((c) => {
      const count = c.orderCount || c.orders?.length || 0;
      if (count === 0) return;
      if (count === 1) buckets["1 order"]++;
      else if (count <= 3) buckets["2-3 orders"]++;
      else if (count <= 6) buckets["4-6 orders"]++;
      else if (count <= 10) buckets["7-10 orders"]++;
      else buckets["11+ orders"]++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [customers]);

  // Tier distribution (if loyalty data exists)
  const tierData = useMemo(() => {
    const tiers: Record<string, number> = {};
    customers.forEach((c) => {
      const tier = c.tier || "None";
      tiers[tier] = (tiers[tier] || 0) + 1;
    });
    return Object.entries(tiers).map(([name, value]) => ({ name, value }));
  }, [customers]);

  if (loading) return <span style={{ color: "#94a3b8" }}>Loading...</span>;

  const COLORS = ["#16a34a", "#f59e0b", "#f97316", "#ef4444", "#94a3b8", "#6366f1"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={kpiCard}>
          <span style={kpiLabel}>Total Customers</span>
          <span style={kpiValue}>{customers.length}</span>
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>With Orders</span>
          <span style={kpiValue}>{customers.filter((c) => (c.orderCount || c.orders?.length || 0) > 0).length}</span>
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>Avg Lifetime Value</span>
          <span style={kpiValue}>
            ${customers.length > 0 ? (customers.reduce((s, c) => s + (c.totalSpent || 0), 0) / customers.length).toFixed(2) : "0.00"}
          </span>
        </div>
      </div>

      {/* Retention + Frequency */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...card, flex: "1 1 300px" }}>
          <span style={title}>Customer Retention</span>
          {retentionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={retentionData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {retentionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>No customer order data available</span>
          )}
        </div>
        <div style={{ ...card, flex: "1 1 300px" }}>
          <span style={title}>Visit Frequency</span>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={frequencyData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={title}>Top Customers by Lifetime Value</span>
          <button style={exportBtn} onClick={() => {
            exportToCSV(
              ["Name", "Phone", "Total Spent", "Orders", "Avg Order", "Tier"],
              topCustomers.map((c) => [c.name, c.phone, `$${(c.totalSpent || 0).toFixed(2)}`, String(c.orderCount || 0), c.orderCount ? `$${((c.totalSpent || 0) / c.orderCount).toFixed(2)}` : "$0", c.tier || "—"]),
              "top-customers"
            );
          }}>
            <FiDownload size={14} color="#64748b" />
          </button>
        </div>
        {topCustomers.length === 0 ? (
          <span style={{ color: "#94a3b8", fontSize: 13, padding: 20, display: "block", textAlign: "center" }}>
            No customer spending data yet. Loyalty tracking builds this automatically.
          </span>
        ) : (
          <div>
            <div style={tableHeader}>
              <span style={{ ...headerCell, flex: 2 }}>Customer</span>
              <span style={{ ...headerCell, flex: 1 }}>Phone</span>
              <span style={{ ...headerCell, flex: 1, textAlign: "right" }}>Total Spent</span>
              <span style={{ ...headerCell, flex: 0.7, textAlign: "right" }}>Orders</span>
              <span style={{ ...headerCell, flex: 1, textAlign: "right" }}>Avg Order</span>
              <span style={{ ...headerCell, flex: 0.7, textAlign: "center" }}>Tier</span>
            </div>
            {topCustomers.map((c) => (
              <div key={c.id} style={tableRow}>
                <span style={{ ...cellStyle, flex: 2, fontWeight: "600" }}>{c.name}</span>
                <span style={{ ...cellStyle, flex: 1, color: "#64748b" }}>{c.phone}</span>
                <span style={{ ...cellStyle, flex: 1, textAlign: "right" }}>${(c.totalSpent || 0).toFixed(2)}</span>
                <span style={{ ...cellStyle, flex: 0.7, textAlign: "right" }}>{c.orderCount || 0}</span>
                <span style={{ ...cellStyle, flex: 1, textAlign: "right" }}>
                  ${c.orderCount ? ((c.totalSpent || 0) / c.orderCount).toFixed(2) : "0.00"}
                </span>
                <span style={{ ...cellStyle, flex: 0.7, textAlign: "center", fontWeight: "600", color: c.tier === "Gold" ? "#FFD700" : c.tier === "Silver" ? "#94a3b8" : "#CD7F32" }}>
                  {c.tier || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const kpiCard: React.CSSProperties = { flex: "1 1 180px", padding: "18px 20px", backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 4 };
const kpiLabel: React.CSSProperties = { fontSize: 13, fontWeight: "500", color: "#94a3b8" };
const kpiValue: React.CSSProperties = { fontSize: 24, fontWeight: "700", color: "#0f172a" };
const card: React.CSSProperties = { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20 };
const title: React.CSSProperties = { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12, display: "block" };
const exportBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const tableHeader: React.CSSProperties = { display: "flex", flexDirection: "row", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" };
const headerCell: React.CSSProperties = { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 0.5 };
const tableRow: React.CSSProperties = { display: "flex", flexDirection: "row", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" };
const cellStyle: React.CSSProperties = { fontSize: 13, color: "#0f172a" };

export default CustomersTab;
