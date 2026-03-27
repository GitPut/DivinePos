import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { filterDays, getDateRange } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

function OperationsTab({ stats, period, loading }: Props) {
  const { start, end } = getDateRange(period);
  const days = useMemo(() => stats?.days ? filterDays(stats.days, start, end) : {}, [stats, start, end]);
  const dayEntries = Object.entries(days);

  // Busiest hours heatmap data (7 days x 24 hours)
  const heatmapData = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    dayEntries.forEach(([date, d]) => {
      const dow = new Date(date).getDay();
      if (d.ordersByHour) {
        Object.entries(d.ordersByHour).forEach(([h, count]) => {
          grid[dow][parseInt(h)] += count as number;
        });
      }
    });
    return grid;
  }, [dayEntries]);

  const maxHeatVal = Math.max(1, ...heatmapData.flat());
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Order type trend (daily)
  const orderTypeTrend = useMemo(() => {
    return dayEntries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        name: date.slice(5),
        pickup: d.pickup || 0,
        delivery: d.delivery || 0,
        inStore: d.inStore || 0,
        online: d.onlineOrders || 0,
      }));
  }, [dayEntries]);

  // Average wait time
  const totalWait = dayEntries.reduce((s, [, d]) => s + (d.totalWaitTime || 0), 0);
  const waitCount = dayEntries.reduce((s, [, d]) => s + (d.waitCount || 0), 0);
  const avgWait = waitCount > 0 ? (totalWait / waitCount).toFixed(1) : "—";

  // Order type totals
  const pickup = dayEntries.reduce((s, [, d]) => s + (d.pickup || 0), 0);
  const delivery = dayEntries.reduce((s, [, d]) => s + (d.delivery || 0), 0);
  const inStore = dayEntries.reduce((s, [, d]) => s + (d.inStore || 0), 0);
  const online = dayEntries.reduce((s, [, d]) => s + (d.onlineOrders || 0), 0);
  const total = pickup + delivery + inStore + online || 1;

  if (loading) return <span style={{ color: "#94a3b8" }}>Loading...</span>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={kpiCard}>
          <span style={kpiLabel}>Avg Prep Time</span>
          <span style={kpiValue}>{avgWait} min</span>
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>Pickup</span>
          <span style={kpiValue}>{pickup} <span style={{ fontSize: 13, color: "#94a3b8" }}>({(pickup / total * 100).toFixed(0)}%)</span></span>
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>Delivery</span>
          <span style={kpiValue}>{delivery} <span style={{ fontSize: 13, color: "#94a3b8" }}>({(delivery / total * 100).toFixed(0)}%)</span></span>
        </div>
        <div style={kpiCard}>
          <span style={kpiLabel}>In-Store</span>
          <span style={kpiValue}>{inStore} <span style={{ fontSize: 13, color: "#94a3b8" }}>({(inStore / total * 100).toFixed(0)}%)</span></span>
        </div>
      </div>

      {/* Busiest Hours Heatmap */}
      <div style={card}>
        <span style={title}>Busiest Hours</span>
        <span style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, display: "block" }}>Darker = more orders</span>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px repeat(24, 1fr)", gap: 2, minWidth: 600 }}>
            {/* Header row */}
            <div />
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#94a3b8", padding: "2px 0" }}>
                {i}
              </div>
            ))}
            {/* Data rows */}
            {DOW.map((day, dowIdx) => (
              <React.Fragment key={day}>
                <div style={{ fontSize: 11, fontWeight: "600", color: "#64748b", display: "flex", alignItems: "center" }}>{day}</div>
                {heatmapData[dowIdx].map((val, hour) => {
                  const intensity = val / maxHeatVal;
                  return (
                    <div
                      key={hour}
                      title={`${day} ${hour}:00 — ${val} orders`}
                      style={{
                        height: 24,
                        borderRadius: 3,
                        backgroundColor: val === 0
                          ? "#f1f5f9"
                          : `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`,
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Order Type Trend */}
      {orderTypeTrend.length > 1 && (
        <div style={card}>
          <span style={title}>Order Types Over Time</span>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={orderTypeTrend}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="pickup" fill="#1D294E" stackId="a" name="Pickup" />
              <Bar dataKey="delivery" fill="#f59e0b" stackId="a" name="Delivery" />
              <Bar dataKey="inStore" fill="#10b981" stackId="a" name="In-Store" />
              <Bar dataKey="online" fill="#6366f1" stackId="a" name="Online" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const kpiCard: React.CSSProperties = { flex: "1 1 140px", padding: "18px 20px", backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 4 };
const kpiLabel: React.CSSProperties = { fontSize: 13, fontWeight: "500", color: "#94a3b8" };
const kpiValue: React.CSSProperties = { fontSize: 22, fontWeight: "700", color: "#0f172a" };
const card: React.CSSProperties = { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20 };
const title: React.CSSProperties = { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12, display: "block" };

export default OperationsTab;
