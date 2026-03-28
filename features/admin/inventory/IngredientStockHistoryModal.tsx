import React, { useEffect, useState } from "react";
import Modal from "shared/components/ui/Modal";
import { Ingredient, IngredientStockHistoryEntry } from "types";
import { fetchIngredientStockHistory } from "services/firebase/functions";
import { MdClear } from "react-icons/md";

interface IngredientStockHistoryModalProps {
  ingredient: Ingredient | null;
  onClose: () => void;
}

const typeColors: Record<string, { bg: string; text: string }> = {
  sale: { bg: "#dbeafe", text: "#1d4ed8" },
  restock: { bg: "#dcfce7", text: "#15803d" },
  adjustment: { bg: "#fef3c7", text: "#b45309" },
  correction: { bg: "#ede9fe", text: "#7c3aed" },
};

function IngredientStockHistoryModal({
  ingredient,
  onClose,
}: IngredientStockHistoryModalProps) {
  const [history, setHistory] = useState<IngredientStockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ingredient) return;
    setLoading(true);
    fetchIngredientStockHistory(ingredient.id)
      .then((entries) => {
        setHistory(entries);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ingredient]);

  if (!ingredient) return null;

  const formatDate = (entry: IngredientStockHistoryEntry) => {
    try {
      const date = entry.createdAt.toDate();
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const formatQty = (val: number) => {
    if (Number.isInteger(val)) return String(val);
    return val.toFixed(2);
  };

  return (
    <Modal isVisible={!!ingredient} onBackdropPress={onClose}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <span style={styles.title}>Stock History</span>
            <span style={styles.ingredientName}>
              {ingredient.name} ({ingredient.unit})
            </span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <MdClear size={20} color="#64748b" />
          </button>
        </div>

        <div style={styles.tableWrapper}>
          {loading ? (
            <div style={styles.loadingState}>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                Loading history...
              </span>
            </div>
          ) : history.length === 0 ? (
            <div style={styles.loadingState}>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>
                No history entries yet
              </span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Change</th>
                  <th style={styles.th}>Before</th>
                  <th style={styles.th}>After</th>
                  <th style={styles.th}>Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const colors =
                    typeColors[entry.type] ?? typeColors.adjustment;
                  return (
                    <tr key={entry.id}>
                      <td style={styles.td}>{formatDate(entry)}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          color:
                            entry.quantityChange > 0 ? "#15803d" : "#dc2626",
                          fontWeight: "600",
                        }}
                      >
                        {entry.quantityChange > 0
                          ? `+${formatQty(entry.quantityChange)}`
                          : formatQty(entry.quantityChange)}
                      </td>
                      <td style={styles.td}>
                        {formatQty(entry.quantityBefore)}
                      </td>
                      <td style={styles.td}>
                        {formatQty(entry.quantityAfter)}
                      </td>
                      <td style={{ ...styles.td, color: "#94a3b8" }}>
                        {entry.note || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <button style={styles.doneBtn} onClick={onClose}>
          <span style={styles.doneBtnText}>Done</span>
        </button>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 640,
    maxHeight: "80vh",
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
    alignItems: "flex-start",
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1a1a1a",
    display: "block",
  },
  ingredientName: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    display: "block",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  tableWrapper: {
    flex: 1,
    overflow: "auto",
    minHeight: 100,
  },
  loadingState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  th: {
    textAlign: "left" as const,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "10px 10px",
    fontSize: 13,
    color: "#1a1a1a",
    borderBottom: "1px solid #f8f9fc",
  },
  typeBadge: {
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize" as const,
  },
  doneBtn: {
    height: 40,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
};

export default IngredientStockHistoryModal;
