import React, { useEffect, useState } from "react";
import ProductOptionBox from "./components/ProductOptionBox";
import { FiSearch, FiPlus } from "react-icons/fi";
import { MdFormatListBulletedAdd } from "react-icons/md";
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
  const [editMode, seteditMode] = useState<boolean>(false);
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
        <button
          style={styles.manageProductsBtn}
          onClick={() => seteditMode((prev) => !prev)}
        >
          <MdFormatListBulletedAdd style={styles.manageProductIcon} />
          <span style={styles.manageProductsTxt}>Manage Products</span>
        </button>
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
        <div style={{ overflow: "auto", flexGrow: 1, justifyContent: "flex-start" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))",
              gap: 30,
              width: "100%",
            }}
          >
            <button
              style={{ ...styles.addProductBtn, ...(editMode ? { height: 322 } : {}) }}
              onClick={() => setaddProductModal(true)}
            >
              <FiPlus style={styles.addProductPlusIcon} />
              <span style={styles.addNewItemTxt}>Add New Item</span>
              <span style={styles.addNewItemTxt}>Or</span>
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
                  style={{
                    ...styles.productOptionBox,
                    ...(editMode ? { height: 322 } : {}),
                  }}
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
  manageProductsBtn: {
    width: 181,
    height: 38,
    backgroundColor: "#fdfdff",
    border: "1px solid #000000",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    cursor: "pointer",
  },
  manageProductIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 22,
  },
  manageProductsTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 14,
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
    width: 215,
    height: 285,
    border: "3px dashed #858585",
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
    marginBottom: 30,
    cursor: "pointer",
  },
  addProductPlusIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  addNewItemTxt: {
    color: "#121212",
    fontSize: 16,
    marginTop: 20,
    display: "inline-block",
  },
  templateBtn: {
    width: 175,
    height: 48,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    border: "none",
    cursor: "pointer",
  },
  templatesBtnLbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 17,
    marginRight: 10,
  },
  productOptionBox: {
    height: 285,
    width: 215,
    marginLeft: 0,
    marginBottom: 30,
    marginRight: 30,
  },
};

export default ProductList;
