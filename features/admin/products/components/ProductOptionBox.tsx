import ProductImage from "shared/components/ui/ProductImage";
import React from "react";
import { FiEdit3, FiTrash, FiImage } from "react-icons/fi";
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
      className="admin-card"
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
          <FiImage style={{ fontSize: 28, color: "#ccc" }} />
          <span style={{ fontSize: 11, color: "#bbb" }}>No image</span>
        </div>
      )}
      <div style={styles.infoSection}>
        <span style={styles.productNameTxt}>
          {product.name.length > 22
            ? product.name.substring(0, 22) + "..."
            : product.name}
        </span>
        <span style={styles.productPriceTxt}>${product.price}</span>
      </div>
      {editMode ? (
        <div style={styles.actionBtns}>
          <div style={styles.editProductBtn}>
            <FiEdit3 style={styles.editProductIcon} />
            <span style={styles.editProductTxt}>Edit</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteProduct?.();
            }}
            style={styles.deleteProductBtn}
          >
            <FiTrash style={styles.editProductIcon} />
            <span style={styles.editProductTxt}>Delete</span>
          </button>
        </div>
      ) : (
        <div style={styles.editProductBtn}>
          <FiEdit3 style={styles.editProductIcon} />
          <span style={styles.editProductTxt}>
            {!isTemplate ? "Edit Product" : "View Template"}
          </span>
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
    alignItems: "center",
    justifyContent: "flex-start",
    border: "1px solid #e8eaed",
    cursor: "pointer",
    padding: 0,
    overflow: "hidden",
    width: "100%",
  },
  productImage: {
    height: 110,
    width: "100%",
    objectFit: "cover" as const,
  },
  noImagePlaceholder: {
    height: 110,
    width: "100%",
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 10px",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  productNameTxt: {
    color: "#1a1a1a",
    fontSize: 14,
    fontWeight: "600",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  productPriceTxt: {
    fontWeight: "700",
    color: "#20c85c",
    fontSize: 15,
  },
  actionBtns: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  editProductBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "#2b3659",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    gap: 6,
  },
  deleteProductBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "#dc2626",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    gap: 6,
  },
  editProductIcon: {
    color: "#fff",
    fontSize: 14,
  },
  editProductTxt: {
    color: "#fff",
    fontSize: 13,
  },
};

export default ProductOptionBox;
