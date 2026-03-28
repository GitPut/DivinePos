import React, { useEffect, useState } from "react";
import Modal from "shared/components/ui/Modal";
import { ProductProp } from "types";
import { adjustStockManually } from "services/firebase/functions";
import { MdClear } from "react-icons/md";

interface StockAdjustmentModalProps {
  product: ProductProp | null;
  onClose: () => void;
}

type AdjustmentType = "restock" | "adjustment" | "correction";

function StockAdjustmentModal({ product, onClose }: StockAdjustmentModalProps) {
  const [type, setType] = useState<AdjustmentType>("restock");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setType("restock");
    setQuantity("");
    setNote("");
    setLoading(false);
    setError("");
  }, [product]);

  if (!product) return null;

  const currentStock = product.stockQuantity ?? 0;

  const getNewQuantity = (): number => {
    const val = parseInt(quantity, 10);
    if (isNaN(val)) return currentStock;
    if (type === "restock") return currentStock + val;
    return val;
  };

  const newQuantity = getNewQuantity();

  const handleConfirm = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await adjustStockManually(product.id, newQuantity, type, note || undefined);
      onClose();
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || "Failed to update stock. Please try again.");
    }
  };

  return (
    <Modal isVisible={!!product} onBackdropPress={onClose}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Adjust Stock</span>
          <button style={styles.closeBtn} onClick={onClose}>
            <MdClear size={20} color="#64748b" />
          </button>
        </div>

        <span style={styles.productName}>{product.name}</span>
        <span style={styles.currentStock}>
          Current Stock: {currentStock} units
        </span>

        <div style={styles.typeRow}>
          {(["restock", "adjustment", "correction"] as AdjustmentType[]).map(
            (t) => (
              <button
                key={t}
                style={{
                  ...styles.typeBtn,
                  ...(type === t ? styles.typeBtnActive : {}),
                }}
                onClick={() => setType(t)}
              >
                <span
                  style={{
                    ...styles.typeBtnText,
                    ...(type === t ? styles.typeBtnTextActive : {}),
                  }}
                >
                  {t === "restock"
                    ? "Restock"
                    : t === "adjustment"
                    ? "Set Quantity"
                    : "Correction"}
                </span>
              </button>
            )
          )}
        </div>

        <div style={styles.inputGroup}>
          <span style={styles.inputLabel}>
            {type === "restock" ? "Add units" : "New quantity"}
          </span>
          <input
            type="number"
            min="0"
            style={styles.input}
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <span style={styles.inputLabel}>Note (optional)</span>
          <textarea
            style={styles.textarea}
            placeholder="Reason for adjustment..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <div style={styles.previewRow}>
          <span style={styles.previewLabel}>New stock level will be:</span>
          <span style={styles.previewValue}>{newQuantity}</span>
        </div>

        {error && (
          <span style={{ color: "#dc2626", fontSize: 13 }}>{error}</span>
        )}

        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={onClose}>
            <span style={styles.cancelBtnText}>Cancel</span>
          </button>
          <button
            style={{
              ...styles.confirmBtn,
              opacity: loading ? 0.6 : 1,
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            <span style={styles.confirmBtnText}>
              {loading ? "Saving..." : "Confirm"}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 420,
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
  productName: {
    fontWeight: "600",
    fontSize: 15,
    color: "#1e293b",
  },
  currentStock: {
    fontSize: 14,
    color: "#64748b",
  },
  typeRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBtnActive: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  typeBtnTextActive: {
    color: "#fff",
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
  textarea: {
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    padding: 12,
    fontSize: 13,
    fontFamily: "inherit",
    resize: "none" as const,
    boxSizing: "border-box" as const,
  },
  previewRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fc",
    padding: "12px 16px",
    borderRadius: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  previewValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  btnRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
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
    flex: 1,
    height: 42,
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

export default StockAdjustmentModal;
