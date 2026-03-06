import React, { useEffect, useState } from "react";
import ProductOptionBox from "./components/ProductOptionBox";
import { FiSearch, FiPlus } from "react-icons/fi";
import {
  onlineStoreState,
  updateStoreProductsState,
  storeProductsState,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import Swal from "sweetalert2";
import AddProductModal from "./modals/AddProductModal";
import Modal from "shared/components/ui/Modal";
import ProductTemplatesModal from "./modals/ProductTemplatesModal";
import { ProductProp } from "types";

function ProductList() {
  const catalog = storeProductsState.use();
  const onlineStoreDetails = onlineStoreState.use();
  const [searchFilterValue, setsearchFilterValue] = useState<string>("");
  const [selectedCategory, setselectedCategory] = useState<string | null>();
  const editMode = true;
  const [addProductModal, setaddProductModal] = useState<boolean>(false);
  const [existingProduct, setexistingProduct] = useState<ProductProp | null>(
    null
  );
  const [isProductTemplate, setisProductTemplate] = useState<boolean>(false);
  const [productTemplatesModalVisible, setproductTemplatesModalVisible] =
    useState<boolean>(false);

  const confirmText = (ProductID: string) => {
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
          text: "Your product has been deleted.",
          confirmButtonColor: "#2b3659",
        });
        const localCatalog = structuredClone(catalog);
        if (localCatalog.products.length > 1) {
          localCatalog.products = localCatalog.products.filter(
            (item) => item.id !== ProductID
          );
        } else {
          localCatalog.products = [];
        }
        db.collection("users")
          .doc(auth.currentUser?.uid)
          .collection("products")
          .doc(ProductID)
          .delete();
        if (onlineStoreDetails.onlineStoreSetUp) {
          db.collection("public")
            .doc(auth.currentUser?.uid)
            .collection("products")
            .doc(ProductID)
            .delete();
        }
        updateStoreProductsState({ products: localCatalog.products });
      }
    });
  };

  useEffect(() => {
    catalog.products.map((product) => {
      if (
        product.category === selectedCategory &&
        product.name
          .toLowerCase()
          .includes(searchFilterValue.toLocaleLowerCase())
      ) {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else if (product.category === selectedCategory && !searchFilterValue) {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else if (
        searchFilterValue.length > 0 &&
        product.name
          .toLowerCase()
          .includes(searchFilterValue.toLocaleLowerCase()) &&
        !selectedCategory
      ) {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else if (!searchFilterValue && !selectedCategory) {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "flex";
        }
      } else {
        const getItem = document.getElementById(product.id);
        if (getItem) {
          getItem.style.display = "none";
        }
      }
    });
  }, [searchFilterValue, selectedCategory, catalog]);

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <span style={styles.productManagementTxt}>Product Management</span>
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
      <div style={styles.categoriesScrollView}>
        <div style={{ display: "flex", flexDirection: "row", overflow: "auto", width: "100%" }}>
          {catalog.categories.map((category, index) => (
            <button
              key={index}
              style={{
                marginRight: 35,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                borderBottom: selectedCategory === category
                  ? "2px solid black"
                  : "2px solid grey",
              }}
              onClick={() =>
                setselectedCategory((prev) =>
                  prev === category ? null : category
                )
              }
            >
              <span
                style={{
                  ...styles.categoryOpt1Txt,
                  color: selectedCategory === category ? "black" : "grey",
                }}
              >
                {category}
              </span>
            </button>
          ))}
        </div>
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
              onClick={() => setaddProductModal(true)}
            >
              <FiPlus style={styles.addProductPlusIcon} />
              <span style={styles.addNewItemTxt}>Add New Item</span>
              <span style={{ color: "#999", fontSize: 13 }}>or</span>
              <button
                style={styles.templateBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setproductTemplatesModalVisible(true);
                }}
              >
                <span style={styles.templatesBtnLbl}>Choose Template</span>
              </button>
            </button>
            {catalog.products.map((product) => (
              <div key={product.id} id={product.id}>
                <ProductOptionBox
                  product={product}
                  editMode={editMode}
                  deleteProduct={() => confirmText(product.id)}
                  setexistingProduct={setexistingProduct}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isVisible={addProductModal || existingProduct ? true : false}
        onBackdropPress={() => {
          setaddProductModal(false);
          setexistingProduct(null);
        }}
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
          <AddProductModal
            addProductModal={addProductModal}
            setaddProductModal={setaddProductModal}
            existingProduct={existingProduct}
            setexistingProduct={setexistingProduct}
            isProductTemplate={isProductTemplate}
            setisProductTemplate={setisProductTemplate}
          />
        </div>
      </Modal>
      <Modal
        isVisible={productTemplatesModalVisible ? true : false}
        onBackdropPress={() => setproductTemplatesModalVisible(false)}
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
          <ProductTemplatesModal
            setproductTemplatesModalVisible={setproductTemplatesModalVisible}
            setexistingProduct={setexistingProduct}
            setisProductTemplate={setisProductTemplate}
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
  categoriesScrollView: {
    width: "85%",
    marginBottom: 30,
  },
  categoryOpt1Txt: {
    color: "grey",
    padding: 10,
    display: "inline-block",
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
    minHeight: 200,
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
  templateBtn: {
    width: 150,
    height: 38,
    backgroundColor: "#1c294e",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    border: "none",
    cursor: "pointer",
  },
  templatesBtnLbl: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 13,
  },
};

export default ProductList;
