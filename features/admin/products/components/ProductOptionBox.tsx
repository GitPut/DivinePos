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
  viewMode?: "grid" | "list";
  isLast?: boolean;
}

function ProductOptionBox({
  style,
  product,
  editMode,
  deleteProduct,
  setexistingProduct,
  isTemplate,
  viewMode = "grid",
  isLast,
}: ProductOptionBoxProps) {
  if (viewMode === "list") {
    return (
      <button
        style={{
          ...listStyles.row,
          ...(!isLast ? { borderBottom: "1px solid #f1f5f9" } : {}),
        }}
        onClick={() => setexistingProduct(product)}
      >
        {/* Thumbnail */}
        <div style={listStyles.thumbWrap}>
          {product.imageUrl ? (
            <ProductImage
              source={product.imageUrl}
              style={listStyles.thumb}
              alt={product.name}
            />
          ) : (
            <div style={listStyles.thumbPlaceholder}>
              <FiImage size={16} color="#cbd5e1" />
            </div>
          )}
        </div>
        {/* Name + Description */}
        <div style={listStyles.nameCol}>
          <span style={listStyles.productName}>{product.name}</span>
          {product.description && (
            <span style={listStyles.description}>{product.description}</span>
          )}
        </div>
        {/* Price */}
        <div style={listStyles.priceCol}>
          <span style={listStyles.price}>${product.price}</span>
        </div>
        {/* Category */}
        <div style={listStyles.categoryCol}>
          {product.category ? (
            <span style={listStyles.categoryBadge}>{product.category}</span>
          ) : (
            <span style={listStyles.categoryBadge}>No Category</span>
          )}
        </div>
        {/* Options count */}
        <div style={listStyles.optionsCol}>
          {product.options.length > 0 ? (
            <span style={listStyles.optionsCount}>{product.options.length}</span>
          ) : (
            <span style={listStyles.offText}>None</span>
          )}
        </div>
        {/* Stock */}
        <div style={listStyles.stockCol}>
          {product.trackStock ? (
            <span
              style={{
                ...listStyles.stockBadge,
                ...(product.stockQuantity !== undefined &&
                product.lowStockThreshold !== undefined &&
                product.stockQuantity <= product.lowStockThreshold
                  ? { backgroundColor: "#fef2f2", color: "#ef4444" }
                  : { backgroundColor: "#f0fdf4", color: "#16a34a" }),
              }}
            >
              {product.stockQuantity ?? 0}
            </span>
          ) : (
            <span style={listStyles.offText}>Off</span>
          )}
        </div>
        {/* Actions */}
        {editMode && (
          <div style={listStyles.actionsCol}>
            <button
              style={listStyles.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                setexistingProduct(product);
              }}
              title="Edit"
            >
              <FiEdit3 size={14} color="#64748b" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteProduct?.();
              }}
              style={listStyles.deleteBtn}
              title="Delete"
            >
              <FiTrash2 size={14} color="#ef4444" />
            </button>
          </div>
        )}
      </button>
    );
  }

  // Grid view (card)
  return (
    <button
      style={{ ...gridStyles.container, ...style }}
      onClick={() => setexistingProduct(product)}
    >
      {product.imageUrl ? (
        <ProductImage
          source={product.imageUrl}
          style={gridStyles.productImage}
          alt={product.name}
        />
      ) : (
        <div style={gridStyles.noImagePlaceholder}>
          <FiImage size={24} color="#cbd5e1" />
        </div>
      )}
      <div style={gridStyles.infoSection}>
        <span style={gridStyles.productName}>{product.name}</span>
        <div style={gridStyles.metaRow}>
          <span style={gridStyles.productPrice}>${product.price}</span>
          {product.category && (
            <span style={gridStyles.categoryBadge}>{product.category}</span>
          )}
        </div>
      </div>
      {editMode && (
        <div style={gridStyles.actionRow}>
          <button
            style={gridStyles.editBtn}
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
            style={gridStyles.deleteBtn}
          >
            <FiTrash2 size={14} color="#ef4444" />
          </button>
        </div>
      )}
    </button>
  );
}

const listStyles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "10px 20px",
    gap: 12,
    cursor: "pointer",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    boxSizing: "border-box",
  },
  thumbWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
  },
  thumb: {
    width: 42,
    height: 42,
    objectFit: "cover" as const,
  },
  thumbPlaceholder: {
    width: 42,
    height: 42,
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
  },
  nameCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  description: {
    fontSize: 12,
    color: "#94a3b8",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  priceCol: {
    width: 80,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  categoryCol: {
    width: 100,
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: 20,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 110,
  },
  optionsCol: {
    width: 80,
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionsCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  stockCol: {
    width: 80,
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  stockBadge: {
    fontSize: 12,
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: 20,
  },
  offText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  actionsCol: {
    width: 76,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 0,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #fee2e2",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
};

const gridStyles: Record<string, React.CSSProperties> = {
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
