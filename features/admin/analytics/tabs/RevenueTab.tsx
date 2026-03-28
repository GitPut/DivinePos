import React, { useMemo } from "react";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload, FiShoppingCart, FiTarget } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { filterDays, getDateRange, exportToCSV } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

const CustomTooltip = ({ active, payload, label, prefix }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipContainer}>
      <span style={tooltipLabel}>{label}</span>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={tooltipValue}>
            {prefix || ""}{typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function RevenueTab({ stats, period, loading }: Props) {
  const { start, end } = getDateRange(period);
  const days = useMemo(() => stats?.days ? filterDays(stats.days, start, end) : {}, [stats, start, end]);
  const dayEntries = Object.entries(days);

  // Previous period for comparison
  const periodDays = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
  const prevStart = new Date(new Date(start).getTime() - periodDays * 86400000).toISOString().split("T")[0];
  const prevEnd = start;
  const prevDays = useMemo(() => stats?.days ? filterDays(stats.days, prevStart, prevEnd) : {}, [stats, prevStart, prevEnd]);

  const totalRevenue = dayEntries.reduce((s, [, d]) => s + (d.revenue || 0), 0);
  const totalOrders = dayEntries.reduce((s, [, d]) => s + (d.orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const prevRevenue = Object.values(prevDays).reduce((s: number, d: any) => s + (d.revenue || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;

  // Revenue by hour
  const hourlyData = useMemo(() => {
    const hours: Record<string, number> = {};
    for (let i = 0; i < 24; i++) hours[String(i)] = 0;
    dayEntries.forEach(([, d]) => {
      if (d.revenueByHour) {
        Object.entries(d.revenueByHour).forEach(([h, v]) => { hours[h] = (hours[h] || 0) + (v as number); });
      }
    });
    return Object.entries(hours).map(([h, v]) => ({
      name: `${h.padStart(2, "0")}:00`,
      revenue: Math.round(v * 100) / 100,
    }));
  }, [dayEntries]);

  // Revenue by day of week
  const dowData = useMemo(() => {
    const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    dayEntries.forEach(([date]) => {
      const dow = new Date(date).getDay();
      totals[dow] += (days[date].revenue || 0);
    });
    return dows.map((name, i) => ({ name, revenue: Math.round(totals[i] * 100) / 100 }));
  }, [dayEntries, days]);

  // Payment method split
  const paymentData = useMemo(() => {
    let cash = 0, card = 0;
    dayEntries.forEach(([, d]) => {
      if (d.revenueByPaymentMethod) {
        cash += d.revenueByPaymentMethod.cash || 0;
        card += d.revenueByPaymentMethod.card || 0;
      }
    });
    return [
      { name: "Cash", value: Math.round(cash * 100) / 100 },
      { name: "Card", value: Math.round(card * 100) / 100 },
    ].filter((d) => d.value > 0);
  }, [dayEntries]);

  // AOV trend (daily)
  const aovTrend = useMemo(() => {
    return dayEntries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        name: date.slice(5),
        aov: d.orders > 0 ? Math.round(d.revenue / d.orders * 100) / 100 : 0,
      }));
  }, [dayEntries]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>Loading analytics...</span>
      </div>
    );
  }

  const COLORS = ["#1D294E", "#6366f1", "#10b981", "#f59e0b"];
  const PIE_COLORS = ["#1D294E", "#6366f1"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...kpiCard, borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={kpiLabel}>Total Revenue</span>
            <div style={{ ...kpiIconWrap, backgroundColor: "rgba(16,185,129,0.1)" }}>
              <FiDollarSign size={16} color="#10b981" />
            </div>
          </div>
          <span style={kpiValue}>${totalRevenue.toFixed(2)}</span>
          {revenueChange !== 0 && (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                padding: "2px 8px",
                borderRadius: 20,
                backgroundColor: revenueChange > 0 ? "rgba(22,163,106,0.1)" : "rgba(239,68,68,0.1)",
              }}>
                {revenueChange > 0 ? <FiTrendingUp size={12} color="#16a34a" /> : <FiTrendingDown size={12} color="#ef4444" />}
                <span style={{ fontSize: 12, fontWeight: "600", color: revenueChange > 0 ? "#16a34a" : "#ef4444" }}>
                  {Math.abs(revenueChange).toFixed(1)}%
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>vs previous period</span>
            </div>
          )}
        </div>
        <div style={{ ...kpiCard, borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={kpiLabel}>Total Orders</span>
            <div style={{ ...kpiIconWrap, backgroundColor: "rgba(59,130,246,0.1)" }}>
              <FiShoppingCart size={16} color="#3b82f6" />
            </div>
          </div>
          <span style={kpiValue}>{totalOrders}</span>
        </div>
        <div style={{ ...kpiCard, borderLeft: "4px solid #6366f1" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={kpiLabel}>Avg Order Value</span>
            <div style={{ ...kpiIconWrap, backgroundColor: "rgba(99,102,241,0.1)" }}>
              <FiTarget size={16} color="#6366f1" />
            </div>
          </div>
          <span style={kpiValue}>${avgOrderValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Revenue by Hour */}
      <div style={chartCard}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <span style={chartTitle}>Revenue by Hour of Day</span>
            <span style={chartSubtitle}>When your revenue peaks throughout the day</span>
          </div>
          <button style={exportBtn} onClick={() => exportToCSV(["Hour", "Revenue"], hourlyData.map((d) => [d.name, d.revenue.toFixed(2)]), "revenue-by-hour")}>
            <FiDownload size={14} color="#64748b" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={2} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Day of Week + Payment Method */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...chartCard, flex: "1 1 400px" }}>
          <span style={chartTitle}>Revenue by Day of Week</span>
          <span style={chartSubtitle}>Weekly revenue distribution</span>
          <div style={{ marginTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip prefix="$" />} cursor={{ fill: "rgba(29,41,78,0.06)" }} />
                <Bar dataKey="revenue" fill="#1D294E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {paymentData.length > 0 && (
          <div style={{ ...chartCard, flex: "0 0 300px" }}>
            <span style={chartTitle}>Payment Method</span>
            <span style={chartSubtitle}>Cash vs card breakdown</span>
            <div style={{ marginTop: 8 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip prefix="$" />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 4 }}>
                {paymentData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: "500" }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: "#0f172a", fontWeight: "700" }}>${d.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AOV Trend */}
      {aovTrend.length > 1 && (
        <div style={chartCard}>
          <span style={chartTitle}>Average Order Value Trend</span>
          <span style={chartSubtitle}>Daily average order value over time</span>
          <div style={{ marginTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={aovTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
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
const exportBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "none",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};
const tooltipContainer: React.CSSProperties = {
  backgroundColor: "#1e293b",
  borderRadius: 10,
  padding: "10px 14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  border: "none",
};
const tooltipLabel: React.CSSProperties = { fontSize: 11, color: "#94a3b8", fontWeight: "500", display: "block" };
const tooltipValue: React.CSSProperties = { fontSize: 13, color: "#fff", fontWeight: "700" };

export default RevenueTab;
