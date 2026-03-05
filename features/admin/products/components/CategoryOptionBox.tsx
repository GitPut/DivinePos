import ProductImage from "shared/components/ui/ProductImage";
import React from "react";
import { storeProductsState } from "store/appState";
import { FiEdit3, FiTrash } from "react-icons/fi";

interface CategoryOptionBoxProps {
  style?: React.CSSProperties;
  category: string;
  editMode: boolean;
  deleteCategory: () => void;
  seteditCategoryModal: (category: string) => void;
}

function CategoryOptionBox({
  style,
  category,
  editMode,
  deleteCategory,
  seteditCategoryModal,
}: CategoryOptionBoxProps) {
  const catalog = storeProductsState.use();
  const listOfImageUrls = catalog.products.filter(
    (item) => item.category === category && item.imageUrl
  );
  const imageUrl =
    listOfImageUrls.length > 0 ? listOfImageUrls[0].imageUrl : null;

  return (
    <button
      style={{ ...styles.container, ...style }}
      onClick={() => {
        seteditCategoryModal(category);
      }}
    >
      <div>
        <ProductImage
          source={imageUrl ? imageUrl : "https://via.placeholder.com/150"}
          style={styles.productImage}
          key={category}
        />
      </div>
      <span style={styles.productNameTxt}>
        {category.length > 20 ? category.substring(0, 20) + "..." : category}
      </span>
      {editMode ? (
        <div>
          <div style={{ ...styles.editProductBtn, borderRadius: 0 }}>
            <FiEdit3 style={styles.editProductIcon} />
            <span style={styles.editProductTxt}>Edit Category</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCategory();
            }}
            style={{ ...styles.editProductBtn, backgroundColor: "#d33" }}
          >
            <FiTrash style={styles.editProductIcon} />
            <span style={styles.editProductTxt}>Delete Category</span>
          </button>
        </div>
      ) : (
        <div style={styles.editProductBtn}>
          <FiEdit3 style={styles.editProductIcon} />
          <span style={styles.editProductTxt}>Edit Category</span>
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

export default CategoryOptionBox;
