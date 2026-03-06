import React from "react";
import { addCartState, cartState, setProductBuilderState } from "store/appState";
import ProductImage from "shared/components/ui/ProductImage";
import { FiPlus, FiImage } from "react-icons/fi";
import { ProductProp } from "types";

interface ItemContainerProps {
  product: ProductProp;
  onLayout?: () => void;
  width: number;
}

function ItemContainer({ product, onLayout, width }: ItemContainerProps) {
  const cart = cartState.use();

  return (
    <div id={product.id} style={{ visibility: "hidden", position: "absolute", height: 0, overflow: "hidden", pointerEvents: "none" }}>
      <button
        onClick={() => {
          if (product.options.length > 0) {
            setProductBuilderState({
              product: product,
              itemIndex: null,
              imageUrl: product.imageUrl ? product.imageUrl : null,
              isOpen: true,
            });
          } else {
            addCartState(
              {
                name: product.name,
                price: product.price,
                description: product.description,
                options: [],
                extraDetails: null,
                imageUrl: product.imageUrl ? product.imageUrl : null,
              },
              cart
            );
          }
        }}
        className="pos-product-card"
        style={width > 1250 ? styles.container : styles.containerMobile}
      >
        {product.hasImage && product.imageUrl ? (
          <ProductImage
            key={product.id}
            source={product.imageUrl}
            style={width < 1250 ? styles.itemImgSmall : styles.itemImg}
            alt={product.name}
          />
        ) : (
          <div style={{
            ...(width < 1250 ? styles.itemImgSmall : styles.itemImg),
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <FiImage size={24} color="#ccc" />
          </div>
        )}
        <div style={styles.rightSide}>
          <span style={styles.familyCombo}>{product.name}</span>
          <div
            style={{
              width: "90%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 6,
              paddingTop: 4,
              display: "flex",
            }}
          >
            <span style={styles.price}>${product.price}</span>
            <div style={styles.openBtn}>
              <FiPlus size={18} color="#555" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    padding: "10px 12px",
    display: "flex",
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "box-shadow 0.15s ease",
    gap: 12,
    boxSizing: "border-box" as const,
  },
  containerMobile: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "box-shadow 0.15s ease",
    gap: 8,
    boxSizing: "border-box" as const,
  },
  itemImg: {
    height: 90,
    width: 90,
    objectFit: "contain" as const,
    flexShrink: 0,
  },
  itemImgSmall: {
    height: 80,
    width: 90,
    objectFit: "contain" as const,
  },
  rightSide: {
    flex: 1,
    justifyContent: "space-between",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
    minHeight: 70,
  },
  familyCombo: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: 14,
    alignSelf: "stretch",
    width: "90%",
    display: "inline-block",
    lineHeight: "1.3",
  },
  price: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 15,
  },
  openBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 100,
    border: "1px solid #e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
};

export default ItemContainer;
