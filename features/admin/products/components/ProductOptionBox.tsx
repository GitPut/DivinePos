import ProductImage from "shared/components/ui/ProductImage";
import React from "react";
import { FiEdit3, FiTrash2, FiImage } from "react-icons/fi";
import { ProductProp } from "types";

interface ProductOptionBoxProps {
  style?: React.CSSProperties;
  product: ProductProp;
  editMode?: boolean;
  deleteProduct?: () => void;
  setexistingProduct: (val: ProductProp) => void;
  isTemplate?: boolean;
}

function ProductOptionBox({
  style,
  product,
  editMode,
  deleteProduct,
  setexistingProduct,
  isTemplate,
}: ProductOptionBoxProps) {
  return (
    <button
      style={{ ...styles.container, ...style }}
      onClick={() => setexistingProduct(product)}
    >
      {product.imageUrl ? (
        <ProductImage
          source={product.imageUrl}
          style={styles.productImage}
          alt={product.name}
        />
      ) : (
        <div style={styles.noImagePlaceholder}>
          <FiImage size={24} color="#cbd5e1" />
        </div>
      )}
      <div style={styles.infoSection}>
        <span style={styles.productName}>{product.name}</span>
        <div style={styles.metaRow}>
          <span style={styles.productPrice}>${product.price}</span>
          {product.category && (
            <span style={styles.categoryBadge}>{product.category}</span>
          )}
        </div>
      </div>
      {editMode ? (
        <div style={styles.actionRow}>
          <button
            style={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              setexistingProduct(product);
            }}
          >
            <FiEdit3 size={14} color="#475569" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteProduct?.();
            }}
            style={styles.deleteBtn}
          >
            <FiTrash2 size={14} color="#ef4444" />
          </button>
        </div>
      ) : (
        <div style={styles.actionRow}>
          <button style={styles.editBtn} onClick={(e) => e.stopPropagation()}>
            <FiEdit3 size={14} color="#475569" />
            <span style={styles.editTxt}>
              {!isTemplate ? "Edit" : "View"}
            </span>
          </button>
        </div>
      )}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 12,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    padding: 0,
    overflow: "hidden",
    width: "100%",
    textAlign: "left",
  },
  productImage: {
    height: 130,
    width: "100%",
    objectFit: "cover" as const,
  },
  noImagePlaceholder: {
    height: 130,
    width: "100%",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "12px 14px",
    flex: 1,
  },
  productName: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metaRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productPrice: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 14,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 20,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 100,
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    padding: "8px 10px",
    borderTop: "1px solid #f1f5f9",
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "none",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  editTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    cursor: "pointer",
  },
};

export default ProductOptionBox;
