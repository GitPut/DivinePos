import React, { useMemo } from "react";
import { FiClock, FiTruck, FiShoppingBag, FiHome, FiGlobe } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { filterDays, getDateRange } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipContainer}>
      <span style={tooltipLabel}>{label}</span>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{entry.name}:</span>
          <span style={tooltipValue}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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
  const avgWait = waitCount > 0 ? (totalWait / waitCount).toFixed(1) : "\u2014";

  // Order type totals
  const pickup = dayEntries.reduce((s, [, d]) => s + (d.pickup || 0), 0);
  const delivery = dayEntries.reduce((s, [, d]) => s + (d.delivery || 0), 0);
  const inStore = dayEntries.reduce((s, [, d]) => s + (d.inStore || 0), 0);
  const online = dayEntries.reduce((s, [, d]) => s + (d.onlineOrders || 0), 0);
  const total = pickup + delivery + inStore + online || 1;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>Loading analytics...</span>
      </div>
    );
  }

  const orderTypeCards = [
    { label: "Avg Prep Time", value: `${avgWait} min`, pct: "", icon: FiClock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Pickup", value: String(pickup), pct: `${(pickup / total * 100).toFixed(0)}%`, icon: FiShoppingBag, color: "#1D294E", bg: "rgba(29,41,78,0.08)" },
    { label: "Delivery", value: String(delivery), pct: `${(delivery / total * 100).toFixed(0)}%`, icon: FiTruck, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "In-Store", value: String(inStore), pct: `${(inStore / total * 100).toFixed(0)}%`, icon: FiHome, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  // Add online if there are online orders
  if (online > 0) {
    orderTypeCards.push({ label: "Online", value: String(online), pct: `${(online / total * 100).toFixed(0)}%`, icon: FiGlobe, color: "#6366f1", bg: "rgba(99,102,241,0.1)" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        {orderTypeCards.map((item) => (
          <div key={item.label} style={{ ...kpiCard, borderLeft: `4px solid ${item.color}` }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <span style={kpiLabel}>{item.label}</span>
              <div style={{ ...kpiIconWrap, backgroundColor: item.bg }}>
                <item.icon size={16} color={item.color} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <span style={kpiValue}>{item.value}</span>
              {item.pct && <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: "500" }}>{item.pct}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Busiest Hours Heatmap */}
      <div style={chartCard}>
        <div style={{ marginBottom: 16 }}>
          <span style={chartTitle}>Busiest Hours</span>
          <span style={chartSubtitle}>Order volume by day and hour -- darker cells indicate more orders</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "56px repeat(24, 1fr)", gap: 3, minWidth: 640 }}>
            {/* Header row */}
            <div />
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#94a3b8", padding: "2px 0", fontWeight: "600" }}>
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
                      title={`${day} ${hour}:00 \u2014 ${val} orders`}
                      style={{
                        height: 28,
                        borderRadius: 5,
                        backgroundColor: val === 0
                          ? "#f8fafc"
                          : intensity < 0.25
                            ? "rgba(99, 102, 241, 0.12)"
                            : intensity < 0.5
                              ? "rgba(99, 102, 241, 0.3)"
                              : intensity < 0.75
                                ? "rgba(99, 102, 241, 0.55)"
                                : "rgba(99, 102, 241, 0.85)",
                        transition: "background-color 0.2s ease",
                        cursor: "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: "700",
                        color: intensity > 0.5 ? "#fff" : "transparent",
                      }}
                    >
                      {val > 0 ? val : ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Heatmap legend */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>Less</span>
          {[0, 0.12, 0.3, 0.55, 0.85].map((opacity, i) => (
            <div key={i} style={{
              width: 16,
              height: 12,
              borderRadius: 3,
              backgroundColor: i === 0 ? "#f8fafc" : `rgba(99, 102, 241, ${opacity})`,
            }} />
          ))}
          <span style={{ fontSize: 10, color: "#94a3b8" }}>More</span>
        </div>
      </div>

      {/* Order Type Trend */}
      {orderTypeTrend.length > 1 && (
        <div style={chartCard}>
          <span style={chartTitle}>Order Types Over Time</span>
          <span style={chartSubtitle}>Daily breakdown by fulfillment method</span>
          <div style={{ marginTop: 8 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={orderTypeTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="pickup" fill="#1D294E" stackId="a" name="Pickup" />
                <Bar dataKey="delivery" fill="#f59e0b" stackId="a" name="Delivery" />
                <Bar dataKey="inStore" fill="#10b981" stackId="a" name="In-Store" />
                <Bar dataKey="online" fill="#6366f1" stackId="a" name="Online" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

const kpiCard: React.CSSProperties = {
  flex: "1 1 160px",
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
const kpiValue: React.CSSProperties = { fontSize: 24, fontWeight: "700", color: "#0f172a", letterSpacing: "-0.5px" };
const chartCard: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  padding: "22px 24px",
};
const chartTitle: React.CSSProperties = { fontSize: 15, fontWeight: "700", color: "#0f172a", display: "block" };
const chartSubtitle: React.CSSProperties = { fontSize: 12, color: "#94a3b8", marginTop: 2, display: "block" };
const tooltipContainer: React.CSSProperties = {
  backgroundColor: "#1e293b",
  borderRadius: 10,
  padding: "10px 14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  border: "none",
};
const tooltipLabel: React.CSSProperties = { fontSize: 11, color: "#94a3b8", fontWeight: "500", display: "block" };
const tooltipValue: React.CSSProperties = { fontSize: 13, color: "#fff", fontWeight: "700" };

export default OperationsTab;
