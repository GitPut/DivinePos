import React from "react";
import { addCartState, cartState, ingredientsState, setProductBuilderState } from "store/appState";
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
  const ingredients = ingredientsState.use();

  const hasRecipe = product.recipe && product.recipe.length > 0;
  let isOutOfStock = false;
  let isLowStock = false;

  if (hasRecipe && product.trackStock === true) {
    for (const recipeItem of product.recipe!) {
      const ing = ingredients.find((i) => i.id === recipeItem.ingredientId);
      if (!ing || ing.stockQuantity <= 0) {
        isOutOfStock = true;
        break;
      }
      if (ing.stockQuantity <= ing.lowStockThreshold) {
        isLowStock = true;
      }
    }
  } else if (product.trackStock === true) {
    isOutOfStock = (product.stockQuantity ?? 0) <= 0;
    isLowStock =
      typeof product.stockQuantity === "number" &&
      typeof product.lowStockThreshold === "number" &&
      product.stockQuantity > 0 &&
      product.stockQuantity <= product.lowStockThreshold;
  }

  return (
    <div id={product.id} style={{ visibility: "hidden", position: "absolute", height: 0, overflow: "hidden", pointerEvents: "none" }}>
      <button
        onClick={() => {
          if (isOutOfStock) return;
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
                editableObj: {
                  name: product.name,
                  price: product.price,
                  description: product.description,
                  options: product.options,
                  total: product.price,
                  extraDetails: "",
                  id: product.id,
                },
              },
              cart
            );
          }
        }}
        className="pos-product-card"
        style={{
          ...styles.container,
          ...(isOutOfStock ? styles.outOfStockContainer : {}),
        }}
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
          {isOutOfStock && (
            <div style={styles.outOfStockBadge}>
              <span style={styles.outOfStockBadgeText}>Out of Stock</span>
            </div>
          )}
          {isLowStock && (
            <div style={styles.lowStockBadge}>
              <span style={styles.lowStockBadgeText}>
                {hasRecipe ? "Low Stock" : `Low: ${product.stockQuantity}`}
              </span>
            </div>
          )}
        </div>
        <div style={styles.infoSection}>
          <span
            style={{
              ...styles.productName,
              ...(isOutOfStock ? { color: "#aaa" } : {}),
            }}
          >
            {product.name}
          </span>
          {product.category && (
            <span style={styles.categoryLabel}>{product.category}</span>
          )}
          <span
            style={{
              ...styles.price,
              ...(isOutOfStock ? { color: "#bbb" } : {}),
            }}
          >
            ${product.price}
          </span>
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
  outOfStockContainer: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: "#f8f9fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative" as const,
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
  outOfStockBadge: {
    position: "absolute" as const,
    bottom: 6,
    left: 6,
    backgroundColor: "#dc2626",
    borderRadius: 6,
    padding: "3px 8px",
  },
  outOfStockBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  lowStockBadge: {
    position: "absolute" as const,
    bottom: 6,
    right: 6,
    backgroundColor: "#f59e0b",
    borderRadius: 6,
    padding: "3px 8px",
  },
  lowStockBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
