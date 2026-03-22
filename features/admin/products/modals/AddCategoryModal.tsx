import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { updateData } from "services/firebase/functions";
import { setStoreProductsState, storeProductsState } from "store/appState";
import { useAlert } from "react-alert";

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
    <div
      style={styles.backdrop}
      onClick={() => setaddCategoryModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={styles.container}
      >
        <span style={styles.title}>
          {existingCategory ? "Edit Category" : "Add Category"}
        </span>
        <span style={styles.subtitle}>
          {existingCategory
            ? "Update the category name or position"
            : "Create a new category for your menu"}
        </span>

        <div style={styles.fieldsArea}>
          {/* Category Name */}
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Category Name</span>
            <input
              style={styles.input}
              placeholder="e.g. Appetizers, Drinks, Desserts"
              value={categoryName}
              onChange={(e) => setcategoryName(e.target.value)}
              data-walkthrough="category-name-input"
            />
          </div>

          {/* Category Position */}
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Position</span>
            <div style={styles.positionRow}>
              <button
                style={styles.positionBtn}
                onClick={() =>
                  setcategoryPosition((prev) =>
                    prev !== 0 ? prev - 1 : prev
                  )
                }
              >
                <FiMinus size={16} color="#475569" />
              </button>
              <div style={styles.positionValue}>
                <span style={styles.positionNum}>{categoryPosition + 1}</span>
              </div>
              <button
                style={styles.positionBtn}
                onClick={() =>
                  setcategoryPosition((prev) =>
                    prev < catalog.categories.length ? prev + 1 : prev
                  )
                }
              >
                <FiPlus size={16} color="#475569" />
              </button>
            </div>
          </div>
        </div>

        <div style={styles.btnsRow}>
          <button
            onClick={() => setaddCategoryModal(false)}
            style={styles.cancelBtn}
          >
            <span style={styles.cancelTxt}>Cancel</span>
          </button>
          <button onClick={Update} style={styles.saveBtn} data-walkthrough="save-category">
            <span style={styles.saveTxt}>
              {existingCategory ? "Save Changes" : "Add Category"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    cursor: "default",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    width: 440,
    padding: 28,
    gap: 4,
    cursor: "default",
  },
  title: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 20,
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginBottom: 20,
  },
  fieldsArea: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  input: {
    height: 42,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  positionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    width: 130,
  },
  positionBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  positionValue: {
    width: 46,
    height: 42,
    backgroundColor: "#fff",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  positionNum: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 15,
  },
  btnsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  cancelTxt: {
    fontWeight: "600",
    color: "#475569",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  saveTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 14,
  },
};

export default AddCategoryModal;
