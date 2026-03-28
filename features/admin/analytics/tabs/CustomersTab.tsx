import React, { useMemo } from "react";
import { FiUsers, FiDownload, FiUserCheck, FiDollarSign, FiHeart } from "react-icons/fi";
import { customersState } from "store/appState";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { exportToCSV } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipContainer}>
      <span style={tooltipLabel}>{label || payload[0]?.name}</span>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: entry.color || entry.payload?.color, flexShrink: 0 }} />
          <span style={tooltipValue}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>Loading analytics...</span>
      </div>
    );
  }

  const customersWithOrders = customers.filter((c) => (c.orderCount || c.orders?.length || 0) > 0).length;
  const avgLTV = customers.length > 0 ? (customers.reduce((s, c) => s + (c.totalSpent || 0), 0) / customers.length) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary KPIs */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...kpiCard, borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={kpiLabel}>Total Customers</span>
            <div style={{ ...kpiIconWrap, backgroundColor: "rgba(59,130,246,0.1)" }}>
              <FiUsers size={16} color="#3b82f6" />
            </div>
          </div>
          <span style={kpiValue}>{customers.length}</span>
        </div>
        <div style={{ ...kpiCard, borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={kpiLabel}>With Orders</span>
            <div style={{ ...kpiIconWrap, backgroundColor: "rgba(16,185,129,0.1)" }}>
              <FiUserCheck size={16} color="#10b981" />
            </div>
          </div>
          <span style={kpiValue}>{customersWithOrders}</span>
        </div>
        <div style={{ ...kpiCard, borderLeft: "4px solid #6366f1" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={kpiLabel}>Avg Lifetime Value</span>
            <div style={{ ...kpiIconWrap, backgroundColor: "rgba(99,102,241,0.1)" }}>
              <FiHeart size={16} color="#6366f1" />
            </div>
          </div>
          <span style={kpiValue}>${avgLTV.toFixed(2)}</span>
        </div>
      </div>

      {/* Retention + Frequency */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...chartCard, flex: "1 1 340px" }}>
          <span style={chartTitle}>Customer Retention</span>
          <span style={chartSubtitle}>Activity breakdown by last order date</span>
          {retentionData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={retentionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {retentionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {retentionData.map((d) => (
                  <div key={d.name} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: "500" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#0f172a", fontWeight: "700" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <FiUsers size={24} color="#cbd5e1" />
              <span style={{ color: "#94a3b8", fontSize: 13 }}>No customer order data available</span>
            </div>
          )}
        </div>
        <div style={{ ...chartCard, flex: "1 1 340px" }}>
          <span style={chartTitle}>Visit Frequency</span>
          <span style={chartSubtitle}>Distribution of order counts per customer</span>
          <div style={{ marginTop: 8 }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={frequencyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div style={chartCard}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <span style={chartTitle}>Top Customers by Lifetime Value</span>
            <span style={chartSubtitle}>Your highest-value customers</span>
          </div>
          <button style={exportBtnStyle} onClick={() => {
            exportToCSV(
              ["Name", "Phone", "Total Spent", "Orders", "Avg Order", "Tier"],
              topCustomers.map((c) => [c.name, c.phone, `$${(c.totalSpent || 0).toFixed(2)}`, String(c.orderCount || 0), c.orderCount ? `$${((c.totalSpent || 0) / c.orderCount).toFixed(2)}` : "$0", c.tier || "\u2014"]),
              "top-customers"
            );
          }}>
            <FiDownload size={14} color="#64748b" />
            <span style={{ fontSize: 12, fontWeight: "600", color: "#64748b" }}>Export</span>
          </button>
        </div>
        {topCustomers.length === 0 ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiUsers size={24} color="#cbd5e1" />
            </div>
            <span style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
              No customer spending data yet. Loyalty tracking builds this automatically.
            </span>
          </div>
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
            {topCustomers.map((c, i) => (
              <div key={c.id} style={{
                ...tableRow,
                backgroundColor: "#fff",
              }}>
                <div style={{ flex: 2, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : i === 2 ? "#fde8d8" : "#f8fafc"} 0%, ${i === 0 ? "#fde68a" : i === 1 ? "#e2e8f0" : i === 2 ? "#fed7aa" : "#f1f5f9"} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: "700",
                    color: i === 0 ? "#92400e" : i === 1 ? "#475569" : i === 2 ? "#9a3412" : "#94a3b8",
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: "600", color: "#1e293b" }}>{c.name}</span>
                </div>
                <span style={{ ...cellStyle, flex: 1, color: "#64748b" }}>{c.phone}</span>
                <span style={{ ...cellStyle, flex: 1, textAlign: "right", fontWeight: "600", color: "#10b981" }}>${(c.totalSpent || 0).toFixed(2)}</span>
                <span style={{ ...cellStyle, flex: 0.7, textAlign: "right" }}>{c.orderCount || 0}</span>
                <span style={{ ...cellStyle, flex: 1, textAlign: "right" }}>
                  ${c.orderCount ? ((c.totalSpent || 0) / c.orderCount).toFixed(2) : "0.00"}
                </span>
                <div style={{ flex: 0.7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.tier ? (
                    <span style={{
                      fontSize: 11,
                      fontWeight: "700",
                      padding: "3px 10px",
                      borderRadius: 20,
                      backgroundColor: c.tier === "Gold" ? "rgba(245,158,11,0.12)" : c.tier === "Silver" ? "rgba(148,163,184,0.12)" : "rgba(205,127,50,0.12)",
                      color: c.tier === "Gold" ? "#92400e" : c.tier === "Silver" ? "#475569" : "#9a3412",
                    }}>
                      {c.tier}
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, color: "#cbd5e1" }}>{"\u2014"}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const kpiCard: React.CSSProperties = {
  flex: "1 1 200px",
  padding: "20px 22px",
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const kpiIconWrap: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const kpiLabel: React.CSSProperties = { fontSize: 12, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 0.5 };
const kpiValue: React.CSSProperties = { fontSize: 26, fontWeight: "700", color: "#0f172a", letterSpacing: "-0.5px" };
const chartCard: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  padding: "22px 24px",
};
const chartTitle: React.CSSProperties = { fontSize: 15, fontWeight: "700", color: "#0f172a", display: "block" };
const chartSubtitle: React.CSSProperties = { fontSize: 12, color: "#94a3b8", marginTop: 2, display: "block" };
const exportBtnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  height: 36,
  paddingLeft: 14,
  paddingRight: 14,
  borderRadius: 10,
  border: "none",
  backgroundColor: "#f8fafc",
  cursor: "pointer",
};
const tableHeader: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  padding: "12px 16px",
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  borderRadius: "12px 12px 0 0",
  alignItems: "center",
};
const headerCell: React.CSSProperties = {
  fontSize: 11,
  fontWeight: "700",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
};
const tableRow: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  padding: "14px 16px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
};
const cellStyle: React.CSSProperties = { fontSize: 13, color: "#0f172a" };
const tooltipContainer: React.CSSProperties = {
  backgroundColor: "#1e293b",
  borderRadius: 10,
  padding: "10px 14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  border: "none",
};
const tooltipLabel: React.CSSProperties = { fontSize: 11, color: "#94a3b8", fontWeight: "500", display: "block" };
const tooltipValue: React.CSSProperties = { fontSize: 13, color: "#fff", fontWeight: "700" };

export default CustomersTab;
