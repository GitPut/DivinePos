import React, { useMemo } from "react";
import { FiCalendar, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiClock, FiUsers, FiStar, FiZap } from "react-icons/fi";
import { customersState, storeProductsState } from "store/appState";
import { filterDays, getDateRange } from "utils/exportAnalytics";
import { AnalyticsInsight } from "types";

interface Props { stats: any; period: string; loading: boolean; }

const ICONS: Record<string, any> = {
  FiCalendar, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiClock, FiUsers, FiStar, FiZap,
};

const TYPE_COLORS: Record<string, { bg: string; border: string; icon: string; iconBg: string; accent: string }> = {
  info: { bg: "#fff", border: "#e0e7ff", icon: "#6366f1", iconBg: "rgba(99,102,241,0.1)", accent: "#6366f1" },
  positive: { bg: "#fff", border: "#bbf7d0", icon: "#16a34a", iconBg: "rgba(22,163,106,0.1)", accent: "#16a34a" },
  warning: { bg: "#fff", border: "#fed7aa", icon: "#f59e0b", iconBg: "rgba(245,158,11,0.1)", accent: "#f59e0b" },
  action: { bg: "#fff", border: "#fecaca", icon: "#ef4444", iconBg: "rgba(239,68,68,0.1)", accent: "#ef4444" },
};

function InsightsTab({ stats, period, loading }: Props) {
  const customers = customersState.use();
  const catalog = storeProductsState.use();
  const { start, end } = getDateRange(period);
  const days = useMemo(() => stats?.days ? filterDays(stats.days, start, end) : {}, [stats, start, end]);
  const dayEntries = Object.entries(days);

  const insights = useMemo(() => {
    const results: AnalyticsInsight[] = [];
    if (dayEntries.length === 0) return results;

    const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // 1. Busiest day
    const dowTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
    dayEntries.forEach(([date, d]) => {
      dowTotals[new Date(date).getDay()] += (d as any).orders || 0;
    });
    const busiestDow = dowTotals.indexOf(Math.max(...dowTotals));
    const avgOrders = Math.round(dowTotals[busiestDow] / Math.max(1, dayEntries.length / 7));
    if (avgOrders > 0) {
      results.push({
        type: "info",
        title: `Your busiest day is ${DOW_NAMES[busiestDow]}`,
        description: `You average ${avgOrders} orders on ${DOW_NAMES[busiestDow]}s. Consider scheduling extra staff.`,
        icon: "FiCalendar",
      });
    }

    // 2. Busiest hour
    const hourTotals: Record<string, number> = {};
    dayEntries.forEach(([, d]) => {
      if ((d as any).ordersByHour) {
        Object.entries((d as any).ordersByHour).forEach(([h, c]) => {
          hourTotals[h] = (hourTotals[h] || 0) + (c as number);
        });
      }
    });
    const peakHour = Object.entries(hourTotals).sort(([, a], [, b]) => b - a)[0];
    if (peakHour) {
      const totalOrd = Object.values(hourTotals).reduce((s, v) => s + v, 0);
      const pct = totalOrd > 0 ? ((peakHour[1] / totalOrd) * 100).toFixed(0) : "0";
      results.push({
        type: "info",
        title: `Peak hour is ${peakHour[0].padStart(2, "0")}:00`,
        description: `${pct}% of your orders come during this hour. Plan prep and staffing accordingly.`,
        icon: "FiClock",
      });
    }

    // 3. Revenue trend (compare halves)
    const sorted = dayEntries.sort(([a], [b]) => a.localeCompare(b));
    const half = Math.floor(sorted.length / 2);
    if (half > 0) {
      const firstHalf = sorted.slice(0, half).reduce((s, [, d]) => s + ((d as any).revenue || 0), 0);
      const secondHalf = sorted.slice(half).reduce((s, [, d]) => s + ((d as any).revenue || 0), 0);
      const change = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100).toFixed(1) : "0";
      if (parseFloat(change) > 5) {
        results.push({
          type: "positive",
          title: `Revenue is trending up ${change}%`,
          description: "Your recent revenue is higher than the earlier part of this period. Keep it up!",
          icon: "FiTrendingUp",
        });
      } else if (parseFloat(change) < -5) {
        results.push({
          type: "warning",
          title: `Revenue is down ${Math.abs(parseFloat(change))}%`,
          description: "Your recent revenue is lower than earlier. Consider promotions or outreach.",
          icon: "FiTrendingDown",
        });
      }
    }

    // 4. Top product growth
    const productCounts: Record<string, number> = {};
    dayEntries.forEach(([, d]) => {
      if ((d as any).productCounts) {
        Object.entries((d as any).productCounts).forEach(([name, count]) => {
          productCounts[name] = (productCounts[name] || 0) + (count as number);
        });
      }
    });
    const topProduct = Object.entries(productCounts).sort(([, a], [, b]) => b - a)[0];
    if (topProduct && topProduct[1] > 2) {
      results.push({
        type: "positive",
        title: `"${topProduct[0]}" is your best seller`,
        description: `Ordered ${topProduct[1]} times this period. Consider featuring it prominently or creating combos.`,
        icon: "FiStar",
      });
    }

    // 5. Churning customers
    const now = Date.now();
    const churning = customers.filter((c) =>
      c.lastOrderDate?.seconds && (now - c.lastOrderDate.seconds * 1000) > 30 * 86400000
    );
    if (churning.length > 0) {
      results.push({
        type: "action",
        title: `${churning.length} customer${churning.length === 1 ? "" : "s"} haven't ordered in 30+ days`,
        description: "Consider sending them a promotion or loyalty bonus to bring them back.",
        icon: "FiAlertTriangle",
      });
    }

    // 6. New customers
    const newCustomers = customers.filter((c) => {
      if (!c.createdAt?.seconds) return false;
      const created = new Date(c.createdAt.seconds * 1000).toISOString().split("T")[0];
      return created >= start && created <= end;
    });
    if (newCustomers.length > 0) {
      results.push({
        type: "positive",
        title: `${newCustomers.length} new customer${newCustomers.length === 1 ? "" : "s"} this period`,
        description: "Your customer base is growing. Focus on retention to maximize lifetime value.",
        icon: "FiUsers",
      });
    }

    // 7. Average order value
    const totalRev = dayEntries.reduce((s, [, d]) => s + ((d as any).revenue || 0), 0);
    const totalOrd = dayEntries.reduce((s, [, d]) => s + ((d as any).orders || 0), 0);
    const aov = totalOrd > 0 ? totalRev / totalOrd : 0;
    if (aov > 0) {
      results.push({
        type: "info",
        title: `Average order value: $${aov.toFixed(2)}`,
        description: aov < 15
          ? "Consider upselling combos or add-ons to increase this."
          : "Good average order value. Continue promoting premium items.",
        icon: "FiZap",
      });
    }

    return results;
  }, [dayEntries, customers, start, end]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={headerCard}>
        <div style={headerIconWrap}>
          <FiZap size={22} color="#6366f1" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 18, fontWeight: "700", color: "#0f172a", display: "block", letterSpacing: "-0.3px" }}>AI-Powered Insights</span>
          <span style={{ fontSize: 13, color: "#94a3b8", marginTop: 2, display: "block" }}>
            Automated recommendations based on your business data
          </span>
        </div>
        {insights.length > 0 && (
          <div style={insightCountBadge}>
            <span style={{ fontSize: 13, fontWeight: "700", color: "#6366f1" }}>{insights.length}</span>
          </div>
        )}
      </div>

      {insights.length === 0 ? (
        <div style={emptyState}>
          <div style={emptyIconWrap}>
            <FiZap size={32} color="#cbd5e1" />
          </div>
          <span style={{ fontSize: 16, fontWeight: "600", color: "#475569", marginTop: 4 }}>
            No insights yet
          </span>
          <span style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" as const, maxWidth: 340, lineHeight: "1.5" }}>
            Insights will appear as you process more orders. Keep using Divine POS and check back soon.
          </span>
        </div>
      ) : (
        insights.map((insight, i) => {
          const colors = TYPE_COLORS[insight.type] || TYPE_COLORS.info;
          const IconComp = ICONS[insight.icon] || FiZap;
          return (
            <div key={i} style={{
              display: "flex",
              flexDirection: "row",
              gap: 18,
              padding: "20px 24px",
              backgroundColor: colors.bg,
              borderRadius: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
              borderLeft: `4px solid ${colors.accent}`,
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: colors.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <IconComp size={22} color={colors.icon} />
              </div>
              <div style={{ flex: 1, justifyContent: "center" }}>
                <span style={{ fontSize: 15, fontWeight: "700", color: "#0f172a", display: "block", marginBottom: 4, letterSpacing: "-0.2px" }}>
                  {insight.title}
                </span>
                <span style={{ fontSize: 13, color: "#64748b", lineHeight: "1.6" }}>
                  {insight.description}
                </span>
              </div>
              <div style={{
                alignSelf: "flex-start",
                padding: "4px 10px",
                borderRadius: 20,
                backgroundColor: colors.iconBg,
                flexShrink: 0,
                marginTop: 2,
              }}>
                <span style={{ fontSize: 10, fontWeight: "700", color: colors.icon, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                  {insight.type}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const headerCard: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
  padding: "18px 22px",
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
};
const headerIconWrap: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const insightCountBadge: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: "rgba(99,102,241,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const emptyState: React.CSSProperties = {
  padding: 60,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
};
const emptyIconWrap: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 20,
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 4,
};

export default InsightsTab;
