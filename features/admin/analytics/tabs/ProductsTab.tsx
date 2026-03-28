import React, { useMemo, useState } from "react";
import { FiArrowUp, FiArrowDown, FiDownload, FiShoppingBag, FiAward } from "react-icons/fi";
import { storeProductsState } from "store/appState";
import { filterDays, getDateRange, exportToCSV } from "utils/exportAnalytics";

interface Props { stats: any; period: string; loading: boolean; }

function ProductsTab({ stats, period, loading }: Props) {
  const { start, end } = getDateRange(period);
  const days = useMemo(() => stats?.days ? filterDays(stats.days, start, end) : {}, [stats, start, end]);
  const catalog = storeProductsState.use();
  const [sortBy, setSortBy] = useState<"orders" | "revenue">("orders");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Aggregate product counts
  const productData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(days).forEach((d: any) => {
      if (d.productCounts) {
        Object.entries(d.productCounts).forEach(([name, count]) => {
          counts[name] = (counts[name] || 0) + (count as number);
        });
      }
    });

    // Match with catalog for price
    return Object.entries(counts).map(([name, orders]) => {
      const product = catalog.products.find((p) => p.name === name);
      const price = product ? parseFloat(product.price) : 0;
      const revenue = orders * price;
      return { name, orders, revenue, price };
    });
  }, [days, catalog]);

  const totalOrders = productData.reduce((s, p) => s + p.orders, 0);
  const totalRevenue = productData.reduce((s, p) => s + p.revenue, 0);

  const sorted = useMemo(() => {
    return [...productData].sort((a, b) => {
      const val = sortBy === "orders" ? a.orders - b.orders : a.revenue - b.revenue;
      return sortDir === "desc" ? -val : val;
    });
  }, [productData, sortBy, sortDir]);

  const toggleSort = (col: "orders" | "revenue") => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>Loading analytics...</span>
      </div>
    );
  }

  const maxRevenue = sorted.length > 0 ? Math.max(...sorted.map((p) => p.revenue)) : 1;

  const RANK_COLORS = ["#f59e0b", "#94a3b8", "#CD7F32"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary KPIs */}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...summaryCard, borderLeft: "4px solid #6366f1" }}>
          <span style={summaryLabel}>Total Products Sold</span>
          <span style={summaryValue}>{totalOrders}</span>
        </div>
        <div style={{ ...summaryCard, borderLeft: "4px solid #10b981" }}>
          <span style={summaryLabel}>Product Revenue</span>
          <span style={summaryValue}>${totalRevenue.toFixed(2)}</span>
        </div>
        <div style={{ ...summaryCard, borderLeft: "4px solid #3b82f6" }}>
          <span style={summaryLabel}>Unique Products</span>
          <span style={summaryValue}>{sorted.length}</span>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <span style={titleStyle}>Product Performance</span>
            <span style={subtitleStyle}>Ranked by {sortBy === "orders" ? "order count" : "revenue"}</span>
          </div>
          <button style={exportBtn} onClick={() => {
            exportToCSV(
              ["Product", "Orders", "Revenue", "% of Revenue"],
              sorted.map((p) => [p.name, String(p.orders), `$${p.revenue.toFixed(2)}`, totalRevenue > 0 ? `${(p.revenue / totalRevenue * 100).toFixed(1)}%` : "0%"]),
              "product-performance"
            );
          }}>
            <FiDownload size={14} color="#64748b" />
            <span style={{ fontSize: 12, fontWeight: "600", color: "#64748b" }}>Export</span>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={tableHeader}>
            <span style={{ ...headerCell, width: 44, textAlign: "center" }}>#</span>
            <span style={{ ...headerCell, flex: 3 }}>Product</span>
            <button style={{ ...headerCell, flex: 1, cursor: "pointer", background: "none", border: "none", padding: 0, textAlign: "right", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 }} onClick={() => toggleSort("orders")}>
              Orders {sortBy === "orders" && (sortDir === "desc" ? <FiArrowDown size={10} /> : <FiArrowUp size={10} />)}
            </button>
            <button style={{ ...headerCell, flex: 1.5, cursor: "pointer", background: "none", border: "none", padding: 0, textAlign: "right", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 }} onClick={() => toggleSort("revenue")}>
              Revenue {sortBy === "revenue" && (sortDir === "desc" ? <FiArrowDown size={10} /> : <FiArrowUp size={10} />)}
            </button>
            <span style={{ ...headerCell, flex: 1.5, textAlign: "right" }}>% of Total</span>
          </div>
          {/* Rows */}
          {sorted.length === 0 ? (
            <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiShoppingBag size={22} color="#cbd5e1" />
              </div>
              <span style={{ color: "#94a3b8", textAlign: "center", fontSize: 14 }}>No product data for this period</span>
            </div>
          ) : sorted.map((p, i) => {
            const pctOfTotal = totalRevenue > 0 ? (p.revenue / totalRevenue * 100) : 0;
            const barWidth = maxRevenue > 0 ? (p.revenue / maxRevenue * 100) : 0;
            return (
              <div key={p.name} style={{
                ...tableRow,
                backgroundColor: "#fff",
                transition: "background-color 0.15s ease",
              }}>
                <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i < 3 ? (
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      backgroundColor: i === 0 ? "rgba(245,158,11,0.12)" : i === 1 ? "rgba(148,163,184,0.15)" : "rgba(205,127,50,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <FiAward size={13} color={RANK_COLORS[i]} />
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: "600", color: "#cbd5e1" }}>{i + 1}</span>
                  )}
                </div>
                <span style={{ ...cellStyle, flex: 3, fontWeight: "600", color: "#1e293b" }}>{p.name}</span>
                <span style={{ ...cellStyle, flex: 1, textAlign: "right", fontWeight: "500" }}>{p.orders}</span>
                <span style={{ ...cellStyle, flex: 1.5, textAlign: "right", fontWeight: "600", color: "#10b981" }}>${p.revenue.toFixed(2)}</span>
                <div style={{ flex: 1.5, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                  <div style={{ width: 80, height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      backgroundColor: "#6366f1",
                      borderRadius: 3,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <span style={{ ...cellStyle, fontSize: 12, fontWeight: "600", color: "#64748b", minWidth: 40, textAlign: "right" }}>
                    {pctOfTotal.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
          {/* Totals row */}
          {sorted.length > 0 && (
            <div style={{
              ...tableRow,
              borderTop: "2px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              borderRadius: "0 0 12px 12px",
            }}>
              <span style={{ width: 44, flexShrink: 0 }} />
              <span style={{ ...cellStyle, flex: 3, fontWeight: "700", color: "#0f172a" }}>Total</span>
              <span style={{ ...cellStyle, flex: 1, textAlign: "right", fontWeight: "700", color: "#0f172a" }}>{totalOrders}</span>
              <span style={{ ...cellStyle, flex: 1.5, textAlign: "right", fontWeight: "700", color: "#10b981" }}>${totalRevenue.toFixed(2)}</span>
              <span style={{ ...cellStyle, flex: 1.5, textAlign: "right", fontWeight: "700", color: "#0f172a" }}>100%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const summaryCard: React.CSSProperties = {
  flex: "1 1 180px",
  padding: "18px 22px",
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};
const summaryLabel: React.CSSProperties = { fontSize: 12, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 0.5 };
const summaryValue: React.CSSProperties = { fontSize: 24, fontWeight: "700", color: "#0f172a" };
const card: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  padding: "22px 24px",
};
const titleStyle: React.CSSProperties = { fontSize: 16, fontWeight: "700", color: "#0f172a", display: "block" };
const subtitleStyle: React.CSSProperties = { fontSize: 12, color: "#94a3b8", marginTop: 2, display: "block" };
const exportBtn: React.CSSProperties = {
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
  transition: "background-color 0.15s ease",
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

export default ProductsTab;
