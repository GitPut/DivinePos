import ProductImage from "shared/components/ui/ProductImage";
import React from "react";
import { FiEdit3, FiTrash } from "react-icons/fi";
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
      <div>
        <ProductImage
          source={product.imageUrl ? product.imageUrl : "https://via.placeholder.com/150"}
          style={styles.productImage}
        />
      </div>
      <span style={styles.productNameTxt}>
        {product.name.length > 20
          ? product.name.substring(0, 20) + "..."
          : product.name}
      </span>
      <span style={styles.productPriceTxt}>${product.price}</span>
      {editMode ? (
        <div>
          <div style={{ ...styles.editProductBtn, borderRadius: 0 }}>
            <FiEdit3 style={styles.editProductIcon} />
            <span style={styles.editProductTxt}>Edit Product</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteProduct?.();
            }}
            style={{ ...styles.editProductBtn, backgroundColor: "#d33" }}
          >
            <FiTrash style={styles.editProductIcon} />
            <span style={styles.editProductTxt}>Delete Product</span>
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
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  productImage: {
    height: 125,
    width: 127,
    marginTop: 20,
  },
  productNameTxt: {
    color: "#121212",
    fontSize: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  productPriceTxt: {
    fontWeight: "700",
    color: "#20c85c",
    fontSize: 20,
  },
  editProductBtn: {
    width: 215,
    height: 37,
    borderRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: "#2b3659",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  editProductIcon: {
    color: "rgba(255,254,254,1)",
    fontSize: 20,
  },
  editProductTxt: {
    color: "rgba(255,255,255,1)",
    fontSize: 14,
    marginLeft: 10,
  },
};

export default ProductOptionBox;
