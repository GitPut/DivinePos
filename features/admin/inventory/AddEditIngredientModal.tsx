import React, { useEffect, useState } from "react";
import Modal from "shared/components/ui/Modal";
import { Ingredient, IngredientUnit } from "types";
import { addIngredient, updateIngredient, deleteIngredient } from "services/firebase/functions";
import { MdClear } from "react-icons/md";

const UNIT_OPTIONS: { value: IngredientUnit; label: string }[] = [
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "oz", label: "Ounces (oz)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "liters", label: "Liters" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "gallons", label: "Gallons" },
  { value: "count", label: "Count" },
  { value: "dozen", label: "Dozen" },
  { value: "cups", label: "Cups" },
  { value: "tbsp", label: "Tablespoons (tbsp)" },
  { value: "tsp", label: "Teaspoons (tsp)" },
];

interface AddEditIngredientModalProps {
  ingredient?: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

function AddEditIngredientModal({
  ingredient,
  isOpen,
  onClose,
}: AddEditIngredientModalProps) {
  const isEditing = !!ingredient;

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<IngredientUnit>("lbs");
  const [category, setCategory] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setUnit(ingredient.unit);
      setCategory(ingredient.category ?? "");
      setStockQuantity(String(ingredient.stockQuantity ?? 0));
      setLowStockThreshold(String(ingredient.lowStockThreshold ?? 0));
      setCostPerUnit(ingredient.costPerUnit ?? "");
    } else {
      setName("");
      setUnit("lbs");
      setCategory("");
      setStockQuantity("");
      setLowStockThreshold("");
      setCostPerUnit("");
    }
    setLoading(false);
    setError("");
  }, [ingredient, isOpen]);

  const handleSave = async () => {
    if (loading) return;
    if (!name.trim()) {
      setError("Please enter an ingredient name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isEditing && ingredient) {
        await updateIngredient(ingredient.id, {
          name: name.trim(),
          unit,
          category: category.trim() || null,
          lowStockThreshold: parseFloat(lowStockThreshold) || 0,
          costPerUnit: costPerUnit || "0",
          stockQuantity: parseFloat(stockQuantity) || 0,
        });
      } else {
        await addIngredient({
          name: name.trim(),
          unit,
          category: category.trim() || null,
          stockQuantity: parseFloat(stockQuantity) || 0,
          lowStockThreshold: parseFloat(lowStockThreshold) || 0,
          costPerUnit: costPerUnit || "0",
        });
      }
      onClose();
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || "Failed to save. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!ingredient || loading) return;
    if (!window.confirm(`Delete "${ingredient.name}"? This cannot be undone.`))
      return;
    setLoading(true);
    try {
      await deleteIngredient(ingredient.id);
      onClose();
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || "Failed to delete.");
    }
  };

  return (
    <Modal isVisible={isOpen} onBackdropPress={onClose}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>
            {isEditing ? "Edit Ingredient" : "Add Ingredient"}
          </span>
          <button style={styles.closeBtn} onClick={onClose}>
            <MdClear size={20} color="#64748b" />
          </button>
        </div>

        <div style={styles.inputGroup}>
          <span style={styles.inputLabel}>Name</span>
          <input
            style={styles.input}
            placeholder="e.g., Mozzarella Cheese"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <span style={styles.inputLabel}>Unit</span>
            <select
              style={styles.select}
              value={unit}
              onChange={(e) => setUnit(e.target.value as IngredientUnit)}
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <span style={styles.inputLabel}>Category</span>
            <input
              style={styles.input}
              placeholder="e.g., Dairy"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <span style={styles.inputLabel}>Stock Quantity</span>
            <input
              type="number"
              min="0"
              step="any"
              style={styles.input}
              placeholder="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <span style={styles.inputLabel}>Low Stock Alert</span>
            <input
              type="number"
              min="0"
              step="any"
              style={styles.input}
              placeholder="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <span style={styles.inputLabel}>Cost Per Unit ($)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            style={styles.input}
            placeholder="0.00"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
          />
        </div>

        {error && (
          <span style={{ color: "#dc2626", fontSize: 13 }}>{error}</span>
        )}

        <div style={styles.btnRow}>
          {isEditing && (
            <button style={styles.deleteBtn} onClick={handleDelete}>
              <span style={styles.deleteBtnText}>Delete</span>
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button style={styles.cancelBtn} onClick={onClose}>
            <span style={styles.cancelBtnText}>Cancel</span>
          </button>
          <button
            style={{
              ...styles.confirmBtn,
              opacity: loading ? 0.6 : 1,
            }}
            onClick={handleSave}
            disabled={loading}
          >
            <span style={styles.confirmBtnText}>
              {loading ? "Saving..." : isEditing ? "Save" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 460,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1a1a1a",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  input: {
    height: 40,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    padding: "0 12px",
    fontSize: 14,
    boxSizing: "border-box" as const,
  },
  select: {
    height: 40,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    padding: "0 10px",
    fontSize: 14,
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  },
  btnRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    alignItems: "center",
  },
  deleteBtn: {
    height: 42,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 10,
    border: "1px solid #fecaca",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  cancelBtn: {
    height: 42,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  confirmBtn: {
    height: 42,
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#1e293b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
};

export default AddEditIngredientModal;
