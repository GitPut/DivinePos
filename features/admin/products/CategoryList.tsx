import React, { useEffect, useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import {
  onlineStoreState,
  updateStoreProductsState,
  storeProductsState,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import Swal from "sweetalert2";
import CategoryOptionBox from "./components/CategoryOptionBox";
import AddCategoryModal from "./modals/AddCategoryModal";
import Modal from "shared/components/ui/Modal";

function CategoryList() {
  const catalog = storeProductsState.use();
  const [searchFilterValue, setsearchFilterValue] = useState<string>("");
  const onlineStoreDetails = onlineStoreState.use();
  const editMode = true;
  const [addCategoryModal, setaddCategoryModal] = useState<
    boolean | string | null
  >(false);
  const [editCategoryModal, seteditCategoryModal] = useState<string | null>(
    null
  );

  const confirmText = (category: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#2b3659",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(function (t) {
      if (t.value) {
        Swal.fire({
          title: "Deleted!",
          text: "Your category has been deleted.",
          color: "#2b3659",
          confirmButtonColor: "#2b3659",
        });
        const localCatalog = structuredClone(catalog);
        if (localCatalog.categories.length > 1) {
          localCatalog.categories = catalog.categories.filter(
            (e) => e !== category
          );
        } else {
          localCatalog.categories = [];
        }

        db.collection("users").doc(auth.currentUser?.uid).update({
          categories: localCatalog.categories,
        });
        if (onlineStoreDetails.onlineStoreSetUp) {
          db.collection("public").doc(auth.currentUser?.uid).update({
            categories: localCatalog.categories,
          });
        }
        updateStoreProductsState({ categories: localCatalog.categories });
      }
    });
  };

  useEffect(() => {
    catalog.categories.map((category: string, index: number) => {
      if (
        category
          .toLowerCase()
          .includes(searchFilterValue.toLocaleLowerCase()) ||
        !searchFilterValue
      ) {
        const getItem = document.getElementById(index.toString());
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else {
        const getItem = document.getElementById(index.toString());
        if (getItem) {
          getItem.style.display = "none";
        }
      }
    });
  }, [searchFilterValue]);

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <span style={styles.productManagementTxt}>Category Management</span>
        <div style={{ width: "60%", position: "relative" }}>
          <input
            style={styles.searchProductBox}
            placeholder="Search"
            value={searchFilterValue}
            onChange={(e) => setsearchFilterValue(e.target.value)}
          />
          <FiSearch
            style={{
              color: "grey",
              fontSize: 20,
              position: "absolute",
              top: 5,
              right: 5,
            }}
          />
        </div>
        <div style={{ width: 181 }} />
      </div>
      <div style={styles.scrollArea}>
        <div style={{ padding: "0 0 20px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 20,
              width: "100%",
            }}
          >
            <button
              className="admin-card"
              style={styles.addProductBtn}
              onClick={() => setaddCategoryModal(true)}
            >
              <FiPlus style={styles.addProductPlusIcon} />
              <span style={styles.addNewItemTxt}>Add New Category</span>
            </button>
            {catalog.categories.map((category) => (
              <div key={category} id={category}>
                <CategoryOptionBox
                  category={category}
                  editMode={editMode}
                  deleteCategory={() => confirmText(category)}
                  seteditCategoryModal={seteditCategoryModal}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isVisible={addCategoryModal ? true : false}
        onBackdropPress={() => setaddCategoryModal(false)}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            width: "100%",
            position: "absolute",
            left: 0,
            top: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AddCategoryModal
            setaddCategoryModal={setaddCategoryModal}
            index={catalog.categories.length}
          />
        </div>
      </Modal>
      <Modal
        isVisible={editCategoryModal ? true : false}
        onBackdropPress={() => seteditCategoryModal(null)}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            width: "100%",
            position: "absolute",
            left: 0,
            top: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AddCategoryModal
            setaddCategoryModal={(val) => {
              if (typeof val === "boolean" && !val) {
                seteditCategoryModal(null);
              } else {
                setaddCategoryModal(val);
              }
            }}
            index={catalog.categories.findIndex((e) => e === editCategoryModal)}
            existingCategory={editCategoryModal}
          />
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    overflow: "hidden",
    minHeight: 0,
  },
  topRow: {
    width: "95%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 25,
  },
  scrollArea: {
    flex: 1,
    width: "95%",
    overflow: "auto",
    minHeight: 0,
  },
  productManagementTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  searchProductBox: {
    width: "100%",
    height: 34,
    backgroundColor: "#f6f6fb",
    border: "1px solid #000000",
    borderRadius: 10,
    paddingLeft: 10,
    boxSizing: "border-box" as const,
  },
  addProductBtn: {
    border: "2px dashed #ccc",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "24px 16px",
    gap: 6,
    minHeight: 180,
  },
  addProductPlusIcon: {
    color: "#888",
    fontSize: 28,
  },
  addNewItemTxt: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
    display: "inline-block",
  },
};

export default CategoryList;
