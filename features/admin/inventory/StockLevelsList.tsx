import React, { useState } from "react";
import { storeProductsState } from "store/appState";
import { ProductProp } from "types";
import { FiPackage, FiAlertTriangle, FiXCircle } from "react-icons/fi";
import StockAdjustmentModal from "./StockAdjustmentModal";
import StockHistoryModal from "./StockHistoryModal";

type StatusFilter = "all" | "in_stock" | "low_stock" | "out_of_stock" | "not_tracked";

function StockLevelsList() {
  const catalog = storeProductsState.use();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [adjustingProduct, setAdjustingProduct] = useState<ProductProp | null>(null);
  const [historyProduct, setHistoryProduct] = useState<ProductProp | null>(null);

  const getStatus = (p: ProductProp): StatusFilter => {
    if (p.trackStock !== true) return "not_tracked";
    const qty = p.stockQuantity ?? 0;
    if (qty <= 0) return "out_of_stock";
    if (
      typeof p.lowStockThreshold === "number" &&
      qty <= p.lowStockThreshold
    )
      return "low_stock";
    return "in_stock";
  };

  const filteredProducts = catalog.products.filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !selectedCategory || p.category === selectedCategory;
    const matchStatus =
      statusFilter === "all" || getStatus(p) === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const trackedProducts = catalog.products.filter(
    (p) => p.trackStock === true
  );
  const outOfStockCount = trackedProducts.filter(
    (p) => (p.stockQuantity ?? 0) <= 0
  ).length;
  const lowStockCount = trackedProducts.filter((p) => {
    const qty = p.stockQuantity ?? 0;
    return (
      qty > 0 &&
      typeof p.lowStockThreshold === "number" &&
      qty <= p.lowStockThreshold
    );
  }).length;

  const statusBadge = (status: StatusFilter) => {
    switch (status) {
      case "in_stock":
        return (
          <span style={{ ...styles.badge, backgroundColor: "#dcfce7", color: "#15803d" }}>
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span style={{ ...styles.badge, backgroundColor: "#fef3c7", color: "#b45309" }}>
            Low Stock
          </span>
        );
      case "out_of_stock":
        return (
          <span style={{ ...styles.badge, backgroundColor: "#fee2e2", color: "#dc2626" }}>
            Out of Stock
          </span>
        );
      default:
        return (
          <span style={{ ...styles.badge, backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
            Not Tracked
          </span>
        );
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.pageTitle}>Inventory Management</span>

      {/* Summary Cards */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <FiPackage size={20} color="#1e293b" />
          <div style={styles.summaryCardInfo}>
            <span style={styles.summaryValue}>{trackedProducts.length}</span>
            <span style={styles.summaryLabel}>Tracked Products</span>
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: "#fef3c7" }}>
          <FiAlertTriangle size={20} color="#b45309" />
          <div style={styles.summaryCardInfo}>
            <span style={{ ...styles.summaryValue, color: "#b45309" }}>
              {lowStockCount}
            </span>
            <span style={styles.summaryLabel}>Low Stock</span>
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: "#fee2e2" }}>
          <FiXCircle size={20} color="#dc2626" />
          <div style={styles.summaryCardInfo}>
            <span style={{ ...styles.summaryValue, color: "#dc2626" }}>
              {outOfStockCount}
            </span>
            <span style={styles.summaryLabel}>Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <input
          style={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.filterSelect}
          value={selectedCategory ?? ""}
          onChange={(e) =>
            setSelectedCategory(e.target.value || null)
          }
        >
          <option value="">All Categories</option>
          {catalog.categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="not_tracked">Not Tracked</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Low Alert</th>
              <th style={styles.th}>Cost</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: "center", color: "#94a3b8", padding: 40 }}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const status = getStatus(product);
                return (
                  <tr
                    key={product.id}
                    style={styles.tableRow}
                    onClick={() => {
                      if (product.trackStock) setHistoryProduct(product);
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.productName}>{product.name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryText}>
                        {product.category ?? "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          fontWeight: "600",
                          color:
                            product.trackStock !== true
                              ? "#94a3b8"
                              : (product.stockQuantity ?? 0) <= 0
                              ? "#dc2626"
                              : "#1a1a1a",
                        }}
                      >
                        {product.trackStock === true
                          ? product.stockQuantity ?? 0
                          : "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#64748b" }}>
                        {product.trackStock === true
                          ? product.lowStockThreshold ?? "—"
                          : "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#64748b" }}>
                        {product.costPrice
                          ? `$${product.costPrice}`
                          : "—"}
                      </span>
                    </td>
                    <td style={styles.td}>{statusBadge(status)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {product.trackStock === true && (
                        <button
                          style={styles.adjustBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustingProduct(product);
                          }}
                        >
                          <span style={styles.adjustBtnText}>Adjust</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <StockAdjustmentModal
        product={adjustingProduct}
        onClose={() => setAdjustingProduct(null)}
      />
      <StockHistoryModal
        product={historyProduct}
        onClose={() => setHistoryProduct(null)}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: 24,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  pageTitle: {
    fontWeight: "700",
    fontSize: 20,
    color: "#1a1a1a",
    marginBottom: 20,
  },
  summaryRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  summaryCardInfo: {
    display: "flex",
    flexDirection: "column",
  },
  summaryValue: {
    fontWeight: "700",
    fontSize: 22,
    color: "#1a1a1a",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  filtersRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    padding: "0 12px",
    fontSize: 14,
    boxSizing: "border-box",
  },
  filterSelect: {
    height: 38,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    padding: "0 12px",
    fontSize: 13,
    backgroundColor: "#fff",
    color: "#1a1a1a",
    cursor: "pointer",
  },
  tableWrapper: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  th: {
    textAlign: "left" as const,
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    borderBottom: "1px solid #f1f5f9",
    position: "sticky" as const,
    top: 0,
    backgroundColor: "#fff",
  },
  td: {
    padding: "12px 16px",
    fontSize: 14,
    color: "#1a1a1a",
    borderBottom: "1px solid #f8f9fc",
  },
  tableRow: {
    cursor: "pointer",
  },
  productName: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  categoryText: {
    color: "#64748b",
    fontSize: 13,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  adjustBtn: {
    height: 30,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  adjustBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
  },
};

export default StockLevelsList;
