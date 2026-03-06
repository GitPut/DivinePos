import React from "react";
import { addCartState, cartState, setProductBuilderState } from "store/appState";
import ProductImage from "shared/components/ui/ProductImage";
import { FiImage } from "react-icons/fi";
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
        style={styles.container}
      >
        <div style={styles.imageWrapper}>
          {product.hasImage && product.imageUrl ? (
            <ProductImage
              key={product.id}
              source={product.imageUrl}
              style={styles.itemImg}
              alt={product.name}
            />
          ) : (
            <div style={styles.noImagePlaceholder}>
              <FiImage size={28} color="#cbd5e1" />
            </div>
          )}
        </div>
        <div style={styles.infoSection}>
          <span style={styles.productName}>{product.name}</span>
          {product.category && (
            <span style={styles.categoryLabel}>{product.category}</span>
          )}
          <span style={styles.price}>${product.price}</span>
        </div>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%",
    padding: 0,
    display: "flex",
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "box-shadow 0.15s ease",
    overflow: "hidden",
    boxSizing: "border-box" as const,
    textAlign: "left" as const,
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: "#f8f9fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  infoSection: {
    padding: "10px 12px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  productName: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: 14,
    lineHeight: "1.3",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    minHeight: "2.6em",
  },
  categoryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
  price: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
    marginTop: 4,
  },
};

export default ItemContainer;
