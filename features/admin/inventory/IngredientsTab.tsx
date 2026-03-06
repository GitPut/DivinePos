import React, { useState } from "react";
import { ingredientsState } from "store/appState";
import { Ingredient } from "types";
import { FiPackage, FiAlertTriangle, FiXCircle, FiPlus } from "react-icons/fi";
import AddEditIngredientModal from "./AddEditIngredientModal";
import IngredientStockAdjustmentModal from "./IngredientStockAdjustmentModal";
import IngredientStockHistoryModal from "./IngredientStockHistoryModal";

type StatusFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

function IngredientsTab() {
  const ingredients = ingredientsState.use();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);
  const [historyIngredient, setHistoryIngredient] = useState<Ingredient | null>(null);

  const categories = Array.from(
    new Set(ingredients.map((i) => i.category).filter(Boolean))
  ) as string[];

  const getStatus = (i: Ingredient): StatusFilter => {
    const qty = i.stockQuantity ?? 0;
    if (qty <= 0) return "out_of_stock";
    if (typeof i.lowStockThreshold === "number" && qty <= i.lowStockThreshold)
      return "low_stock";
    return "in_stock";
  };

  const filtered = ingredients.filter((i) => {
    const matchSearch =
      !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || i.category === selectedCategory;
    const matchStatus =
      statusFilter === "all" || getStatus(i) === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const outOfStockCount = ingredients.filter(
    (i) => (i.stockQuantity ?? 0) <= 0
  ).length;
  const lowStockCount = ingredients.filter((i) => {
    const qty = i.stockQuantity ?? 0;
    return (
      qty > 0 &&
      typeof i.lowStockThreshold === "number" &&
      qty <= i.lowStockThreshold
    );
  }).length;

  const statusBadge = (status: StatusFilter) => {
    switch (status) {
      case "in_stock":
        return (
          <span
            style={{
              ...styles.badge,
              backgroundColor: "#dcfce7",
              color: "#15803d",
            }}
          >
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span
            style={{
              ...styles.badge,
              backgroundColor: "#fef3c7",
              color: "#b45309",
            }}
          >
            Low Stock
          </span>
        );
      case "out_of_stock":
        return (
          <span
            style={{
              ...styles.badge,
              backgroundColor: "#fee2e2",
              color: "#dc2626",
            }}
          >
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.pageTitle}>Ingredients</span>
        <button style={styles.addBtn} onClick={() => setAddModalOpen(true)}>
          <FiPlus size={16} color="#fff" />
          <span style={styles.addBtnText}>Add Ingredient</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <FiPackage size={20} color="#1e293b" />
          <div style={styles.summaryCardInfo}>
            <span style={styles.summaryValue}>{ingredients.length}</span>
            <span style={styles.summaryLabel}>Total Ingredients</span>
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
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {categories.length > 0 && (
          <select
            style={styles.filterSelect}
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ingredient</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Low Alert</th>
              <th style={styles.th}>Cost/Unit</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    color: "#94a3b8",
                    padding: 40,
                  }}
                >
                  {ingredients.length === 0
                    ? "No ingredients yet. Add your first ingredient to get started."
                    : "No ingredients match your filters"}
                </td>
              </tr>
            ) : (
              filtered.map((ingredient) => {
                const status = getStatus(ingredient);
                return (
                  <tr
                    key={ingredient.id}
                    style={styles.tableRow}
                    onClick={() => setHistoryIngredient(ingredient)}
                  >
                    <td style={styles.td}>
                      <span style={styles.ingredientName}>
                        {ingredient.name}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryText}>
                        {ingredient.category ?? "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#64748b" }}>
                        {ingredient.unit}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          fontWeight: "600",
                          color:
                            (ingredient.stockQuantity ?? 0) <= 0
                              ? "#dc2626"
                              : "#1a1a1a",
                        }}
                      >
                        {ingredient.stockQuantity ?? 0}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#64748b" }}>
                        {ingredient.lowStockThreshold ?? "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#64748b" }}>
                        {ingredient.costPerUnit
                          ? `$${ingredient.costPerUnit}`
                          : "—"}
                      </span>
                    </td>
                    <td style={styles.td}>{statusBadge(status)}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button
                        style={styles.editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIngredient(ingredient);
                        }}
                      >
                        <span style={styles.editBtnText}>Edit</span>
                      </button>
                      <button
                        style={{ ...styles.adjustBtn, marginLeft: 6 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdjustingIngredient(ingredient);
                        }}
                      >
                        <span style={styles.adjustBtnText}>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddEditIngredientModal
        ingredient={addModalOpen ? undefined : editingIngredient}
        isOpen={addModalOpen || !!editingIngredient}
        onClose={() => {
          setAddModalOpen(false);
          setEditingIngredient(null);
        }}
      />
      <IngredientStockAdjustmentModal
        ingredient={adjustingIngredient}
        onClose={() => setAdjustingIngredient(null)}
      />
      <IngredientStockHistoryModal
        ingredient={historyIngredient}
        onClose={() => setHistoryIngredient(null)}
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
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontWeight: "700",
    fontSize: 20,
    color: "#1a1a1a",
  },
  addBtn: {
    height: 38,
    paddingLeft: 16,
    paddingRight: 18,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#1e293b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  ingredientName: {
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
  editBtn: {
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
  editBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
  },
  adjustBtn: {
    height: 30,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#1e293b",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  adjustBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },
};

export default IngredientsTab;
