import React from "react";
import ProductImage from "shared/components/ui/ProductImage";

interface CategoryButtonProps {
  style?: React.CSSProperties;
  isSelected: boolean;
  onPress: () => void;
  category?: string;
  imageUrl?: string | null;
}

function CategoryButton({
  style,
  isSelected,
  onPress,
  category,
  imageUrl,
}: CategoryButtonProps) {
  return (
    <button
      style={{
        ...styles.container,
        ...style,
        ...(isSelected
          ? { backgroundColor: "rgba(29,41,78,1)" }
          : { backgroundColor: "#f9fafc" }),
      }}
      onClick={onPress}
    >
      <span
        style={{
          ...styles.categoryLbl,
          ...(isSelected ? { color: "white" } : { color: "rgba(0,0,0,1)" }),
        }}
      >
        {category ? category : "Placeholder"}
      </span>
      {imageUrl && (
        <div>
          <ProductImage
            source={imageUrl}
            style={styles.categoryImg}
            key={category}
          />
        </div>
      )}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  categoryLbl: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 0,
    marginBottom: 0,
    textAlign: "center",
    display: "inline-block",
  },
  categoryImg: {
    height: 96,
    width: 95,
    marginTop: 0,
    marginBottom: 0,
  },
};

export default CategoryButton;
