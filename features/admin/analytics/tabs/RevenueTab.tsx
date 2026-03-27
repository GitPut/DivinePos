import React, { useMemo } from "react";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { filterDays, getDateRange, exportToCSV } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

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

  if (loading) return <span style={{ color: "#94a3b8" }}>Loading...</span>;

  const COLORS = ["#1D294E", "#6366f1", "#10b981", "#f59e0b"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={kpiCard}>
          <span style={kpiLabel}>Total Revenue</span>
          <span style={kpiValue}>${totalRevenue.toFixed(2)}</span>
          {revenueChange !== 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              {revenueChange > 0 ? <FiTrendingUp size={14} color="#16a34a" /> : <FiTrendingDown size={14} color="#ef4444" />}
              <span style={{ fontSize: 12, fontWeight: "600", color: revenueChange > 0 ? "#16a34a" : "#ef4444" }}>
                {Math.abs(revenueChange).toFixed(1)}% vs previous period
              </span>
            </div>
          )}
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>Total Orders</span>
          <span style={kpiValue}>{totalOrders}</span>
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>Avg Order Value</span>
          <span style={kpiValue}>${avgOrderValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Revenue by Hour */}
      <div style={chartCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={chartTitle}>Revenue by Hour of Day</span>
          <button style={exportBtn} onClick={() => exportToCSV(["Hour", "Revenue"], hourlyData.map((d) => [d.name, d.revenue.toFixed(2)]), "revenue-by-hour")}>
            <FiDownload size={14} color="#64748b" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Day of Week + Payment Method */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...chartCard, flex: "1 1 400px" }}>
          <span style={chartTitle}>Revenue by Day of Week</span>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dowData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#1D294E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {paymentData.length > 0 && (
          <div style={{ ...chartCard, flex: "0 0 280px" }}>
            <span style={chartTitle}>Payment Method</span>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AOV Trend */}
      {aovTrend.length > 1 && (
        <div style={chartCard}>
          <span style={chartTitle}>Average Order Value Trend</span>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={aovTrend}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "AOV"]} />
              <Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const kpiCard: React.CSSProperties = { flex: "1 1 180px", padding: "18px 20px", backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 4 };
const kpiLabel: React.CSSProperties = { fontSize: 13, fontWeight: "500", color: "#94a3b8" };
const kpiValue: React.CSSProperties = { fontSize: 24, fontWeight: "700", color: "#0f172a" };
const chartCard: React.CSSProperties = { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20 };
const chartTitle: React.CSSProperties = { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12, display: "block" };
const exportBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

export default RevenueTab;
