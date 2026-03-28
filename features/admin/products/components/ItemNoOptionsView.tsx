import React from "react";
import { FiImage } from "react-icons/fi";
import { ProductProp } from "types";

interface ItemNoOptionsViewProps {
  product: ProductProp;
  imageUrl?: string | null;
}

const ItemNoOptionsView = ({ product, imageUrl }: ItemNoOptionsViewProps) => {
  const hasImage = imageUrl || product.imageUrl;
  const imgSrc = imageUrl || product.imageUrl || "";

  return (
    <div style={styles.card}>
      {hasImage ? (
        <img src={imgSrc} alt="" style={styles.image} />
      ) : (
        <div style={styles.imagePlaceholder}>
          <FiImage size={32} color="#cbd5e1" />
          <span style={styles.placeholderTxt}>No image</span>
        </div>
      )}
      <div style={styles.info}>
        <span style={styles.name}>
          {product.name || "Product Name"}
        </span>
        {product.description && (
          <span style={styles.description}>{product.description}</span>
        )}
        <span style={styles.price}>
          ${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}
        </span>
        {product.category && (
          <span style={styles.category}>{product.category}</span>
        )}
      </div>
    </div>
  );
};

export default ItemNoOptionsView;

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    objectFit: "contain" as const,
    backgroundColor: "#f8fafc",
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderTxt: {
    fontSize: 13,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px",
    gap: 6,
  },
  name: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 20,
    textAlign: "center" as const,
  },
  description: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center" as const,
    maxWidth: "90%",
  },
  price: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 22,
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: 20,
    marginTop: 2,
  },
};
