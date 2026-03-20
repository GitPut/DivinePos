import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoCopy } from "react-icons/io5";
import { FiUpload, FiX } from "react-icons/fi";
import OptionsItem from "../components/OptionsItem";
import {
  onlineStoreState,
  setStoreProductsState,
  storeProductsState,
} from "store/appState";
import { auth, db, storage } from "services/firebase/config";
import Switch from "shared/components/ui/Switch";
import ProductBuilderView from "../components/ProductBuilderView";
import { useAlert } from "react-alert";
import Swal from "sweetalert2";
import { ProductProp, RecipeItem } from "types";
import DropdownStringOptions from "shared/components/ui/DropdownStringOptions";
import useWindowSize from "shared/hooks/useWindowSize";
import RecipeEditor from "features/admin/inventory/RecipeEditor";

interface AddProductModalProps {
  addProductModal: boolean;
  setaddProductModal: (val: boolean) => void;
  existingProduct?: ProductProp | null;
  setexistingProduct: (val: ProductProp | null) => void;
  isProductTemplate: boolean;
  setisProductTemplate: (val: boolean) => void;
}

const customSort = (a: ProductProp, b: ProductProp) => {
  const rankA = parseFloat(a.rank ?? "0") || Number.MAX_SAFE_INTEGER;
  const rankB = parseFloat(b.rank ?? "0") || Number.MAX_SAFE_INTEGER;
  return rankA - rankB;
};

function AddProductModal({
  addProductModal,
  setaddProductModal,
  existingProduct,
  setexistingProduct,
  isProductTemplate,
  setisProductTemplate,
}: AddProductModalProps) {
  const { width, height } = useWindowSize();
  const catalog = storeProductsState.use();
  const [newProduct, setnewProduct] = useState<ProductProp>(
    existingProduct
      ? existingProduct
      : {
          name: "",
          price: "0",
          category: null,
          options: [],
          description: "",
          id: Math.random().toString(36).substr(2, 9),
        }
  );
  const [newProductOptions, setnewProductOptions] = useState(
    existingProduct ? existingProduct.options : []
  );
  const [currentImgUrl, setcurrentImgUrl] = useState(
    existingProduct ? existingProduct.imageUrl : null
  );
  const onlineStoreDetails = onlineStoreState.use();
  const [indexOn, setindexOn] = useState<number | null>(null);
  const [selectValues, setselectValues] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<null | File>();
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const [selectedID, setselectedID] = useState<string | null>(null);
  const alertP = useAlert();

  const confirmText = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will lose your new product!",
      showCancelButton: true,
      confirmButtonColor: "#1470ef",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, discard!",
    }).then(function (t) {
      if (t.value) {
        setaddProductModal(false);
        setexistingProduct(null);
        setisProductTemplate(false);
      }
    });
  };

  useEffect(() => {
    if (existingProduct) {
      setnewProduct(existingProduct);
      setnewProductOptions(existingProduct.options);
      setcurrentImgUrl(existingProduct.imageUrl);
    }
  }, [addProductModal, existingProduct]);

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  useEffect(() => {
    if (catalog.categories) {
      const local: string[] = [];
      catalog.categories.map((val) => local.push(val));
      setselectValues(local);
    }
  }, []);

  useEffect(() => {
    setnewProduct((prev) => {
      const clone = structuredClone(prev);
      clone.options = newProductOptions;
      return clone;
    });
  }, [newProductOptions]);

  function handleDataUpdate() {
    if (!newProduct.name) {
      alertP.error("Please enter a product name");
      return;
    }
    if (!newProduct.price) {
      alertP.error("Please enter a price");
      return;
    }

    if (existingProduct && !isProductTemplate) {
      const copy = structuredClone(catalog.products);
      const newProductUseRef: ProductProp = {
        ...newProduct,
        options: newProductOptions,
      };
      const findIndex = copy.findIndex((e) => e.id === existingProduct.id);

      if (selectedFile) {
        newProductUseRef.hasImage = true;
        storage
          .ref(auth.currentUser?.uid + "/images/" + existingProduct.id)
          .put(selectedFile)
          .then(() => {
            storage
              .ref(auth.currentUser?.uid + "/images/" + existingProduct.id)
              .getDownloadURL()
              .then((url) => {
                newProductUseRef.hasImage = true;
                newProductUseRef.imageUrl = url;
                if (
                  newProductUseRef.hasImage &&
                  !selectedFile &&
                  !currentImgUrl
                ) {
                  storage
                    .ref(
                      auth.currentUser?.uid + "/images/" + existingProduct.id
                    )
                    .delete();
                  newProductUseRef.hasImage = false;
                  newProductUseRef.imageUrl = null;
                }

                copy[findIndex] = newProductUseRef;
                if (!newProductUseRef.id) return;

                setStoreProductsState({
                  categories: catalog.categories,
                  products: copy.sort(customSort),
                });
                const imgBatch = db.batch();
                imgBatch.set(
                  db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()),
                  newProductUseRef
                );
                if (onlineStoreDetails.onlineStoreSetUp) {
                  imgBatch.set(
                    db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()),
                    newProductUseRef
                  );
                }
                imgBatch.commit();
              });
          });
      } else {
        if (newProductUseRef.hasImage && !selectedFile && !currentImgUrl) {
          storage
            .ref(auth.currentUser?.uid + "/images/" + existingProduct.id)
            .delete();
          newProductUseRef.hasImage = false;
          newProductUseRef.imageUrl = null;
        }

        copy[findIndex] = newProductUseRef;
        if (!newProductUseRef.id) return;

        setStoreProductsState({
          categories: catalog.categories,
          products: copy.sort(customSort),
        });
        const updateBatch = db.batch();
        updateBatch.set(
          db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()),
          newProductUseRef
        );
        if (onlineStoreDetails.onlineStoreSetUp) {
          updateBatch.set(
            db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()),
            newProductUseRef
          );
        }
        updateBatch.commit();
      }
    } else {
      newProduct.isTemplate = false;
      if (selectedFile) {
        storage
          .ref(auth.currentUser?.uid + "/images/" + newProduct.id)
          .put(selectedFile)
          .then(() => {
            storage
              .ref(auth.currentUser?.uid + "/images/" + newProduct.id)
              .getDownloadURL()
              .then((url) => {
                newProduct.hasImage = true;
                newProduct.imageUrl = url;
                const newImgBatch = db.batch();
                newImgBatch.set(
                  db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""),
                  newProduct
                );
                if (onlineStoreDetails.onlineStoreSetUp) {
                  newImgBatch.set(
                    db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""),
                    newProduct
                  );
                }
                newImgBatch.commit();
                setStoreProductsState({
                  categories: catalog.categories,
                  products: [...catalog.products, newProduct].sort(customSort),
                });
              });
          });
      } else {
        const newBatch = db.batch();
        newBatch.set(
          db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""),
          newProduct
        );
        if (onlineStoreDetails.onlineStoreSetUp) {
          newBatch.set(
            db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""),
            newProduct
          );
        }
        newBatch.commit();
        setStoreProductsState({
          categories: catalog.categories,
          products: [...catalog.products, newProduct].sort(customSort),
        });
      }
    }
    setaddProductModal(false);
    setexistingProduct(null);
    setisProductTemplate(false);
  }

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    if (event.target.files[0].size < 5000000) {
      setSelectedFile(event.target.files[0]);
    } else {
      alertP.error("Sorry 5mb files are the max!");
    }
  };

  const modalTitle = isProductTemplate
    ? "Add Product"
    : existingProduct
    ? "Update Product"
    : "Add Product";

  return (
    <div
      onClick={() => {
        if (
          existingProduct &&
          JSON.stringify(existingProduct) !== JSON.stringify(newProduct)
        ) {
          confirmText();
        } else if (!existingProduct && newProduct.name.length > 0) {
          confirmText();
        } else {
          setaddProductModal(false);
          setexistingProduct(null);
          setisProductTemplate(false);
        }
      }}
      style={styles.backdrop}
    >
      <div onClick={(ev) => ev.stopPropagation()} style={{ cursor: "default" }}>
        <div style={styles.panelsRow}>
          {/* Left Panel — Editor */}
          <div
            style={{
              ...styles.panel,
              height: height * 0.9,
              width: width * 0.6,
            }}
          >
            {/* Header */}
            <div style={styles.headerRow}>
              <div>
                <span style={styles.title}>{modalTitle}</span>
                <span style={styles.subtitle}>
                  {existingProduct && !isProductTemplate
                    ? "Edit product details, pricing, and options"
                    : "Fill in details to create a new product"}
                </span>
              </div>
              <div style={styles.headerActions}>
                {existingProduct && !isProductTemplate && (
                  <button
                    style={styles.duplicateBtn}
                    onClick={() => {
                      const copy: ProductProp = { ...existingProduct };
                      copy.name = copy.name + " Copy";
                      copy.imageUrl = "";
                      copy.hasImage = false;
                      copy.id = Math.random().toString(36).substr(2, 9);
                      const dupBatch = db.batch();
                      dupBatch.set(
                        db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(copy.id.toString()),
                        copy
                      );
                      if (onlineStoreDetails.onlineStoreSetUp) {
                        dupBatch.set(
                          db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(copy.id.toString()),
                          copy
                        );
                      }
                      dupBatch.commit();
                      setStoreProductsState({
                        categories: catalog.categories,
                        products: [...catalog.products, copy],
                      });
                      setexistingProduct(copy);
                    }}
                  >
                    <IoCopy size={14} color="#475569" />
                    <span style={styles.duplicateTxt}>Duplicate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div
              style={styles.scrollArea}
              onScroll={(event) => {
                setScrollY(event.currentTarget.scrollTop);
              }}
              ref={scrollViewRef}
            >
              <input
                type="file"
                ref={hiddenFileInput}
                onChange={changeHandler}
                style={{ display: "none" }}
                accept="image/*"
              />

              {/* Image Upload */}
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Product Image</span>
                <button onClick={handleClick} style={styles.imageUploadArea}>
                  {selectedFile ? (
                    <>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        style={styles.previewImage}
                        key={selectedFile.name}
                        alt=""
                      />
                      <button
                        style={styles.removeImageBtn}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        <FiX size={14} color="#fff" />
                      </button>
                    </>
                  ) : currentImgUrl ? (
                    <>
                      <img
                        src={currentImgUrl}
                        style={styles.previewImage}
                        key={currentImgUrl}
                        alt=""
                      />
                      <button
                        style={styles.removeImageBtn}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedFile(null);
                          setcurrentImgUrl(null);
                        }}
                      >
                        <FiX size={14} color="#fff" />
                      </button>
                    </>
                  ) : (
                    <div style={styles.uploadPlaceholder}>
                      <FiUpload size={24} color="#94a3b8" />
                      <span style={styles.uploadTxt}>
                        Click to upload an image
                      </span>
                      <span style={styles.uploadHint}>Max 5MB</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Product Details Grid */}
              <div style={styles.fieldsGrid}>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Product Name</span>
                  <input
                    style={styles.input}
                    placeholder="Enter product name"
                    onChange={(ev) =>
                      setnewProduct((prevState) => ({
                        ...prevState,
                        name: ev.target.value,
                      }))
                    }
                    value={newProduct?.name}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Base Price</span>
                  <input
                    style={styles.input}
                    placeholder="0.00"
                    onChange={(ev) => {
                      const val = ev.target.value;
                      const re = /^-?\d*\.?\d*$/;
                      if (re.test(val)) {
                        setnewProduct((prevState) => ({
                          ...prevState,
                          price: val.replace(/^0+/, ""),
                        }));
                      } else if (!val) {
                        setnewProduct((prevState) => ({
                          ...prevState,
                          price: "0",
                        }));
                      }
                    }}
                    value={newProduct?.price.toString()}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Category</span>
                  <DropdownStringOptions
                    placeholder="Choose category"
                    value={
                      newProduct?.category ? newProduct.category : null
                    }
                    setValue={(val) => {
                      setnewProduct((prevState) => ({
                        ...prevState,
                        category: val,
                      }));
                    }}
                    options={selectValues}
                    scrollY={scrollY}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Rank</span>
                  <input
                    style={styles.input}
                    placeholder="N/A"
                    onChange={(ev) => {
                      const val = ev.target.value;
                      const re = /^[0-9]+$/;
                      if (re.test(val)) {
                        setnewProduct((prevState) => ({
                          ...prevState,
                          rank: val,
                        }));
                      } else if (!val) {
                        setnewProduct((prevState) => ({
                          ...prevState,
                          rank: undefined,
                        }));
                      }
                    }}
                    value={newProduct?.rank?.toString()}
                  />
                </div>
              </div>

              {/* Toggle Rows */}
              <div style={styles.toggleSection}>
                <div style={styles.toggleRow}>
                  <div>
                    <span style={styles.toggleLabel}>Hide from Online Store</span>
                    <span style={styles.toggleHint}>Product won't appear on your online store</span>
                  </div>
                  <Switch
                    isActive={newProduct?.dontDisplayOnOnlineStore ?? false}
                    toggleSwitch={() => {
                      setnewProduct((prevState) => ({
                        ...prevState,
                        dontDisplayOnOnlineStore:
                          !prevState.dontDisplayOnOnlineStore,
                      }));
                    }}
                  />
                </div>
                <div style={styles.toggleRow}>
                  <div>
                    <span style={styles.toggleLabel}>Track Inventory</span>
                    <span style={styles.toggleHint}>Monitor stock levels for this product</span>
                  </div>
                  <Switch
                    isActive={newProduct?.trackStock ?? false}
                    toggleSwitch={() => {
                      setnewProduct((prevState) => ({
                        ...prevState,
                        trackStock: !prevState.trackStock,
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Inventory Tracking */}
              {newProduct?.trackStock && (
                <div style={styles.inventorySection}>
                  <div style={styles.trackingToggleRow}>
                    <button
                      style={{
                        ...styles.trackingToggleBtn,
                        ...(!newProduct.recipe || newProduct.recipe.length === 0
                          ? styles.trackingToggleBtnActive
                          : {}),
                      }}
                      onClick={() => setnewProduct((prev) => {
                        const clone = { ...prev };
                        delete clone.recipe;
                        return clone;
                      })}
                    >
                      <span
                        style={{
                          ...styles.trackingToggleTxt,
                          ...(!newProduct.recipe || newProduct.recipe.length === 0
                            ? styles.trackingToggleTxtActive
                            : {}),
                        }}
                      >
                        Track by Count
                      </span>
                    </button>
                    <button
                      style={{
                        ...styles.trackingToggleBtn,
                        ...(newProduct.recipe && newProduct.recipe.length > 0
                          ? styles.trackingToggleBtnActive
                          : {}),
                      }}
                      onClick={() => setnewProduct((prev) => ({ ...prev, recipe: prev.recipe && prev.recipe.length > 0 ? prev.recipe : [] }))}
                    >
                      <span
                        style={{
                          ...styles.trackingToggleTxt,
                          ...(newProduct.recipe && newProduct.recipe.length > 0
                            ? styles.trackingToggleTxtActive
                            : {}),
                        }}
                      >
                        Track by Recipe
                      </span>
                    </button>
                  </div>

                  {(!newProduct.recipe || newProduct.recipe.length === 0) && !Array.isArray(newProduct.recipe) && (
                    <div style={styles.stockFieldsRow}>
                      <div style={styles.fieldGroup}>
                        <span style={styles.fieldLabel}>Stock Quantity</span>
                        <input
                          type="number"
                          min="0"
                          style={styles.input}
                          placeholder="0"
                          value={newProduct.stockQuantity ?? ""}
                          onChange={(ev) => {
                            const val = parseInt(ev.target.value, 10);
                            setnewProduct((prevState) => ({
                              ...prevState,
                              stockQuantity: isNaN(val) ? 0 : val,
                            }));
                          }}
                        />
                      </div>
                      <div style={styles.fieldGroup}>
                        <span style={styles.fieldLabel}>Low Stock Alert</span>
                        <input
                          type="number"
                          min="0"
                          style={styles.input}
                          placeholder="5"
                          value={newProduct.lowStockThreshold ?? ""}
                          onChange={(ev) => {
                            const val = parseInt(ev.target.value, 10);
                            setnewProduct((prevState) => ({
                              ...prevState,
                              lowStockThreshold: isNaN(val) ? 5 : val,
                            }));
                          }}
                        />
                      </div>
                      <div style={styles.fieldGroup}>
                        <span style={styles.fieldLabel}>Cost Price</span>
                        <input
                          style={styles.input}
                          placeholder="0.00"
                          value={newProduct.costPrice ?? ""}
                          onChange={(ev) => {
                            setnewProduct((prevState) => ({
                              ...prevState,
                              costPrice: ev.target.value,
                            }));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {Array.isArray(newProduct.recipe) && (
                    <RecipeEditor
                      recipe={newProduct.recipe}
                      onRecipeChange={(recipe: RecipeItem[]) =>
                        setnewProduct((prev) => ({ ...prev, recipe }))
                      }
                    />
                  )}
                </div>
              )}

              {/* Description */}
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Description</span>
                <textarea
                  style={styles.textarea}
                  placeholder="Enter product description"
                  onChange={(ev) =>
                    setnewProduct((prevState) => ({
                      ...prevState,
                      description: ev.target.value,
                    }))
                  }
                  value={newProduct?.description}
                />
              </div>

              {/* Options */}
              <div style={styles.optionsSection}>
                <span style={styles.sectionTitle}>Options</span>
                {newProduct.options.map((option, index) => (
                  <OptionsItem
                    key={option.id}
                    style={styles.optionsItem}
                    item={option}
                    index={index}
                    setnewProduct={setnewProduct}
                    newProduct={newProduct}
                    newProductOptions={newProductOptions}
                    setnewProductOptions={setnewProductOptions}
                    indexOn={indexOn}
                    setindexOn={setindexOn}
                    scrollY={scrollY}
                    scrollViewRef={scrollViewRef}
                    selectedID={selectedID}
                    setselectedID={setselectedID}
                  />
                ))}
                {newProduct.options.length === 0 && (
                  <div style={styles.optionBtnsRow}>
                    <button
                      onClick={() => {
                        setnewProductOptions([
                          {
                            label: null,
                            optionsList: [],
                            numOfSelectable: null,
                            id: Math.random().toString(36).substr(2, 9),
                            optionType: null,
                            selectedCaseList: [],
                            isRequired: false,
                          },
                        ]);
                        setindexOn(0);
                      }}
                      disabled={
                        newProduct?.options.length > 0 &&
                        newProduct?.options[newProduct?.options.length - 1]
                          .label === null
                      }
                      style={styles.createOptionBtn}
                    >
                      <span style={styles.createOptionTxt}>Create Option</span>
                    </button>
                    <button
                      style={styles.pasteOptionBtn}
                      onClick={() => {
                        navigator.clipboard.readText().then((text) => {
                          try {
                            const parsed = JSON.parse(text);
                            setnewProductOptions([parsed]);
                            setindexOn(0);
                          } catch (e) {
                            alertP.error("Invalid JSON");
                          }
                        });
                      }}
                    >
                      <span style={styles.pasteOptionTxt}>Paste Option</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setaddProductModal(false);
                  setexistingProduct(null);
                  setisProductTemplate(false);
                }}
              >
                <span style={styles.cancelTxt}>Cancel</span>
              </button>
              <button style={styles.saveBtn} onClick={handleDataUpdate}>
                <span style={styles.saveTxt}>
                  {isProductTemplate
                    ? "Add Product"
                    : existingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Panel — Preview */}
          <div
            style={{
              ...styles.panel,
              height: height * 0.9,
              width: width * 0.36,
            }}
          >
            <ProductBuilderView
              product={newProduct}
              imageUrl={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : currentImgUrl
                  ? currentImgUrl
                  : null
              }
            />
          </div>
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
  },
  panelsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    width: "100%",
    gap: 12,
  },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  // Header
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 28px 16px",
    flexShrink: 0,
    borderBottom: "1px solid #f1f5f9",
  },
  title: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 20,
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
    display: "block",
  },
  headerActions: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  duplicateBtn: {
    height: 36,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 14,
    paddingRight: 14,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
  },
  duplicateTxt: {
    fontWeight: "500",
    color: "#475569",
    fontSize: 13,
  },
  // Scroll Area
  scrollArea: {
    flex: 1,
    overflow: "auto",
    padding: "20px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  // Fields
  fieldsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 calc(50% - 8px)",
    minWidth: 140,
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
    backgroundColor: "#fff",
  },
  textarea: {
    width: "100%",
    height: 100,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 12,
    boxSizing: "border-box" as const,
    resize: "none" as const,
    fontFamily: "inherit",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
  },
  // Image Upload
  imageUploadArea: {
    width: "100%",
    height: 160,
    backgroundColor: "#f8fafc",
    border: "2px dashed #e2e8f0",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative" as const,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  },
  removeImageBtn: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  uploadTxt: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  uploadHint: {
    fontSize: 11,
    color: "#94a3b8",
  },
  // Toggle Section
  toggleSection: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  toggleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
  },
  toggleHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
    display: "block",
  },
  // Inventory
  inventorySection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  trackingToggleRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  trackingToggleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trackingToggleBtnActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  trackingToggleTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  trackingToggleTxtActive: {
    color: "#fff",
  },
  stockFieldsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  // Options
  optionsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 16,
  },
  optionsItem: {
    alignSelf: "stretch",
  },
  optionBtnsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  createOptionBtn: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#1470ef",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  createOptionTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 14,
  },
  pasteOptionBtn: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  pasteOptionTxt: {
    fontWeight: "600",
    color: "#475569",
    fontSize: 14,
  },
  // Footer
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    padding: "16px 28px",
    borderTop: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  cancelBtn: {
    height: 42,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  cancelTxt: {
    fontWeight: "600",
    color: "#475569",
    fontSize: 14,
  },
  saveBtn: {
    height: 42,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: "#1470ef",
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

export default AddProductModal;
