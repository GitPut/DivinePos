import React, { useMemo, useState } from "react";
import { FiArrowUp, FiArrowDown, FiDownload } from "react-icons/fi";
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

  if (loading) return <span style={{ color: "#94a3b8" }}>Loading...</span>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={title}>Product Performance</span>
          <button style={exportBtn} onClick={() => {
            exportToCSV(
              ["Product", "Orders", "Revenue", "% of Revenue"],
              sorted.map((p) => [p.name, String(p.orders), `$${p.revenue.toFixed(2)}`, totalRevenue > 0 ? `${(p.revenue / totalRevenue * 100).toFixed(1)}%` : "0%"]),
              "product-performance"
            );
          }}>
            <FiDownload size={14} color="#64748b" />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={tableHeader}>
            <span style={{ ...headerCell, flex: 3 }}>Product</span>
            <button style={{ ...headerCell, flex: 1, cursor: "pointer", background: "none", border: "none", textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }} onClick={() => toggleSort("orders")}>
              Orders {sortBy === "orders" && (sortDir === "desc" ? <FiArrowDown size={10} /> : <FiArrowUp size={10} />)}
            </button>
            <button style={{ ...headerCell, flex: 1.5, cursor: "pointer", background: "none", border: "none", textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }} onClick={() => toggleSort("revenue")}>
              Revenue {sortBy === "revenue" && (sortDir === "desc" ? <FiArrowDown size={10} /> : <FiArrowUp size={10} />)}
            </button>
            <span style={{ ...headerCell, flex: 1, textAlign: "right" }}>% of Total</span>
          </div>
          {/* Rows */}
          {sorted.length === 0 ? (
            <span style={{ padding: 20, color: "#94a3b8", textAlign: "center" }}>No product data for this period</span>
          ) : sorted.map((p, i) => (
            <div key={p.name} style={{ ...tableRow, backgroundColor: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
              <span style={{ ...cell, flex: 3, fontWeight: "600" }}>{p.name}</span>
              <span style={{ ...cell, flex: 1, textAlign: "right" }}>{p.orders}</span>
              <span style={{ ...cell, flex: 1.5, textAlign: "right" }}>${p.revenue.toFixed(2)}</span>
              <span style={{ ...cell, flex: 1, textAlign: "right" }}>
                {totalRevenue > 0 ? `${(p.revenue / totalRevenue * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
          ))}
          {/* Totals row */}
          <div style={{ ...tableRow, borderTop: "2px solid #e2e8f0", fontWeight: "700" }}>
            <span style={{ ...cell, flex: 3, fontWeight: "700" }}>Total</span>
            <span style={{ ...cell, flex: 1, textAlign: "right", fontWeight: "700" }}>{totalOrders}</span>
            <span style={{ ...cell, flex: 1.5, textAlign: "right", fontWeight: "700" }}>${totalRevenue.toFixed(2)}</span>
            <span style={{ ...cell, flex: 1, textAlign: "right", fontWeight: "700" }}>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20 };
const title: React.CSSProperties = { fontSize: 15, fontWeight: "700", color: "#0f172a" };
const exportBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const tableHeader: React.CSSProperties = { display: "flex", flexDirection: "row", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" };
const headerCell: React.CSSProperties = { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 0.5 };
const tableRow: React.CSSProperties = { display: "flex", flexDirection: "row", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" };
const cell: React.CSSProperties = { fontSize: 13, color: "#0f172a" };

export default ProductsTab;
