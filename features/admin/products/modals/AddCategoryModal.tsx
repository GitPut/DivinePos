import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { updateData } from "services/firebase/functions";
import { setStoreProductsState, storeProductsState } from "store/appState";
import { useAlert } from "react-alert";
import useWindowSize from "shared/hooks/useWindowSize";

interface AddCategoryModalProps {
  setaddCategoryModal: (val: boolean | string | null) => void;
  existingCategory?: string | null;
  index: number;
}

function AddCategoryModal({
  setaddCategoryModal,
  existingCategory,
  index,
}: AddCategoryModalProps) {
  const { height, width } = useWindowSize();
  const [categoryName, setcategoryName] = useState<string>(
    existingCategory ? existingCategory : ""
  );
  const [categoryPosition, setcategoryPosition] = useState(index);
  const catalog = storeProductsState.use();
  const alertP = useAlert();

  const Update = () => {
    if (categoryName === "") {
      alertP.error("Category name cannot be empty");
      return;
    }
    const localCatalog = structuredClone(catalog);
    const newCategories: string[] = [];
    localCatalog.categories = localCatalog.categories.filter(
      (category) => category !== existingCategory
    );
    if (localCatalog.categories.length > 0) {
      if (categoryPosition !== localCatalog.categories.length) {
        localCatalog.categories.forEach((category, index) => {
          if (index === categoryPosition) {
            newCategories.push(categoryName);
            newCategories.push(category);
          } else {
            newCategories.push(category);
          }
        });
      } else {
        localCatalog.categories.forEach((category) => {
          newCategories.push(category);
        });
        newCategories.push(categoryName);
      }
    } else {
      newCategories.push(categoryName);
    }
    updateData(newCategories);
    setStoreProductsState({ ...catalog, categories: newCategories });
    setaddCategoryModal(false);
  };

  return (
    <button
      onClick={() => setaddCategoryModal(false)}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: height,
        width: width,
        border: "none",
        background: "none",
        cursor: "default",
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: "default" }}
      >
        <div style={styles.container}>
          <span style={styles.addCategoryTxt}>Add Category</span>
          <div style={styles.bottomContainer}>
            <div style={styles.nameAndPosRow}>
              <div style={styles.categoryNameGroup}>
                <span style={styles.categoryNameLbl}>Category Name</span>
                <input
                  style={styles.categoryNameInput}
                  placeholder="Enter Category Name"
                  value={categoryName}
                  onChange={(e) => setcategoryName(e.target.value)}
                />
              </div>
              <div style={styles.categoryPositionGroup}>
                <span style={styles.categoryPosition}>Category Position</span>
                <div style={styles.minusPlusSelectorRow}>
                  <button
                    style={styles.minusContainer}
                    onClick={() =>
                      setcategoryPosition((prev) =>
                        prev !== 0 ? prev - 1 : prev
                      )
                    }
                  >
                    <FiMinus style={styles.minusIcon} />
                  </button>
                  <div style={styles.indexContainer}>
                    <span style={styles.text}>{categoryPosition + 1}</span>
                  </div>
                  <button
                    style={styles.plusContainer}
                    onClick={() =>
                      setcategoryPosition((prev) =>
                        prev < catalog.categories.length ? prev + 1 : prev
                      )
                    }
                  >
                    <FiPlus style={styles.plusIcon} />
                  </button>
                </div>
              </div>
            </div>
            <div style={styles.btnsRow}>
              <button
                onClick={() => setaddCategoryModal(false)}
                style={styles.cancelBox}
              >
                <span style={styles.cancelTxt}>Cancel</span>
              </button>
              <button onClick={Update} style={styles.saveBox}>
                <span style={styles.saveTxt}>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: 511,
    height: 582,
  },
  addCategoryTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 21,
    marginTop: 40,
    marginBottom: 40,
    display: "inline-block",
  },
  bottomContainer: {
    width: 377,
    height: 321,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameAndPosRow: {
    width: 377,
    height: 77,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryNameGroup: {
    width: 197,
    height: 77,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  categoryNameLbl: {
    color: "#121212",
    fontSize: 17,
  },
  categoryNameInput: {
    width: 197,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    border: "1px solid #9b9b9b",
    padding: 10,
    boxSizing: "border-box" as const,
  },
  categoryPositionGroup: {
    width: 150,
    height: 77,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  categoryPosition: {
    color: "#121212",
    fontSize: 17,
  },
  minusPlusSelectorRow: {
    width: 150,
    height: 50,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  minusContainer: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(179,179,179,1)",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  minusIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  indexContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#E6E6E6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  plusContainer: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(179,179,179,1)",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  plusIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  btnsRow: {
    width: 377,
    height: 47,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelBox: {
    width: 173,
    height: 47,
    backgroundColor: "#eef2ff",
    borderRadius: 20,
    boxShadow: "3px 3px 20px rgba(240, 240, 240, 1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
  },
  cancelTxt: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 20,
  },
  saveBox: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    boxShadow: "3px 3px 20px rgba(216, 216, 216, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  saveTxt: {
    fontWeight: "700",
    color: "#eef2ff",
    fontSize: 20,
  },
};

export default AddCategoryModal;
