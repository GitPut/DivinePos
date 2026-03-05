import React from "react";
import ProductImage from "shared/components/ui/ProductImage";
import { ProductProp } from "types";

const ItemNoOptionsView = ({ product }: { product: ProductProp }) => {
  return (
    <div style={{ marginTop: 50 }}>
      {product.hasImage ? (
        <div style={styles.container}>
          <ProductImage
            source={product.imageUrl ?? ""}
            style={styles.itemImg}
          />
          <div style={styles.rightSide}>
            <span style={styles.familyCombo}>
              {product.name ? product.name : "Product Name..."}
            </span>
            <span style={styles.price}>
              ${product.price ? product.price : "Product Price..."}
            </span>
            <div style={styles.openBtnRow}></div>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: 20,
            height: 160,
            width: 290,
            marginBottom: 30,
          }}
        >
          <div>
            <span style={styles.familyCombo}>
              {product.name ? product.name : "Product Name..."}
            </span>
            <span style={styles.price}>
              ${product.price ? product.price : "0"}
            </span>
            <div
              style={{
                ...styles.openBtnRow,
                width: 250,
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemNoOptionsView;

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 160,
    width: 290,
    marginBottom: 30,
  },
  itemImg: {
    height: 133,
    width: 117,
    margin: 6,
  },
  rightSide: {
    width: "40%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    margin: 6,
    alignSelf: "stretch",
    marginTop: 12,
    marginRight: 11,
    height: "100%",
  },
  familyCombo: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 18,
    height: 42,
    alignSelf: "stretch",
    paddingBottom: 50,
    display: "block",
  },
  price: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 18,
    height: 24,
    alignSelf: "stretch",
    display: "block",
  },
  openBtnRow: {
    height: 42,
    display: "flex",
    alignItems: "flex-end",
    alignSelf: "stretch",
  },
};
