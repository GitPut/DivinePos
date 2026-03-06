import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoCopy } from "react-icons/io5";
import { MdFolderCopy } from "react-icons/md";
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
      confirmButtonColor: "#2b3659",
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
                db.collection("users")
                  .doc(auth.currentUser?.uid)
                  .collection("products")
                  .doc(newProductUseRef.id.toString())
                  .set(newProductUseRef);
                if (onlineStoreDetails.onlineStoreSetUp) {
                  db.collection("public")
                    .doc(auth.currentUser?.uid)
                    .collection("products")
                    .doc(newProductUseRef.id.toString())
                    .set(newProductUseRef);
                }
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
        db.collection("users")
          .doc(auth.currentUser?.uid)
          .collection("products")
          .doc(newProductUseRef.id.toString())
          .set(newProductUseRef);
        if (onlineStoreDetails.onlineStoreSetUp) {
          db.collection("public")
            .doc(auth.currentUser?.uid)
            .collection("products")
            .doc(newProductUseRef.id.toString())
            .set(newProductUseRef);
        }
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
                db.collection("users")
                  .doc(auth.currentUser?.uid)
                  .collection("products")
                  .doc(newProduct.id?.toString())
                  .set(newProduct);
                if (onlineStoreDetails.onlineStoreSetUp) {
                  db.collection("public")
                    .doc(auth.currentUser?.uid)
                    .collection("products")
                    .doc(newProduct.id?.toString())
                    .set(newProduct);
                }
                setStoreProductsState({
                  categories: catalog.categories,
                  products: [...catalog.products, newProduct].sort(customSort),
                });
              });
          });
      } else {
        db.collection("users")
          .doc(auth.currentUser?.uid)
          .collection("products")
          .doc(newProduct.id?.toString())
          .set(newProduct);
        if (onlineStoreDetails.onlineStoreSetUp) {
          db.collection("public")
            .doc(auth.currentUser?.uid)
            .collection("products")
            .doc(newProduct.id?.toString())
            .set(newProduct);
        }
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
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: height,
        width: width,
      }}
    >
      <div onClick={(ev) => ev.stopPropagation()}>
        <div style={{ cursor: "default" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              width: "100%",
            }}
          >
            <div
              style={{
                ...styles.container,
                height: height * 0.9,
                width: width * 0.6,
              }}
            >
              <div style={styles.topRow}>
                <span style={styles.productAdd}>
                  Product{" "}
                  {isProductTemplate
                    ? "Add"
                    : existingProduct
                    ? "Update"
                    : "Add"}
                </span>
                {existingProduct && !isProductTemplate && (
                  <button
                    style={styles.templateBtn}
                    onClick={() => {
                      const copy: ProductProp = { ...existingProduct };
                      copy.name = copy.name + " Copy";
                      copy.imageUrl = "";
                      copy.hasImage = false;
                      copy.id = Math.random().toString(36).substr(2, 9);
                      db.collection("users")
                        .doc(auth.currentUser?.uid)
                        .collection("products")
                        .doc(copy.id.toString())
                        .set(copy);
                      if (onlineStoreDetails.onlineStoreSetUp) {
                        db.collection("public")
                          .doc(auth.currentUser?.uid)
                          .collection("products")
                          .doc(copy.id.toString())
                          .set(copy);
                      }
                      setStoreProductsState({
                        categories: catalog.categories,
                        products: [...catalog.products, copy],
                      });
                      setexistingProduct(copy);
                    }}
                  >
                    <span style={styles.templatesBtnLbl}>Duplicate</span>
                    <IoCopy style={styles.chevronDownIcon} />
                  </button>
                )}
              </div>
              <div style={{ ...styles.innerScrollArea, height: height * 0.6 }}>
                <div
                  style={{
                    ...styles.innerScrollArea_contentContainerStyle,
                    overflow: "auto",
                    height: "100%",
                  }}
                  onScroll={(event) => {
                    const currentScrollPosition = event.currentTarget.scrollTop;
                    setScrollY(currentScrollPosition);
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
                  <div style={styles.imageUploadGroup}>
                    <span style={styles.productImageUploadTxt}>
                      Product Image Upload
                    </span>
                    <button
                      onClick={handleClick}
                      style={styles.productImageUpContainer}
                    >
                      {selectedFile ? (
                        <>
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            style={{
                              width: 150,
                              height: 150,
                              objectFit: "contain",
                            }}
                            key={selectedFile.name}
                            alt=""
                          />
                          <button
                            style={{
                              backgroundColor: "red",
                              padding: 5,
                              borderRadius: 5,
                              position: "absolute",
                              top: 10,
                              right: 10,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedFile(null);
                            }}
                          >
                            <span style={{ color: "white" }}>Remove</span>
                          </button>
                        </>
                      ) : currentImgUrl ? (
                        <>
                          <img
                            src={currentImgUrl}
                            style={{
                              width: 150,
                              height: 150,
                              objectFit: "contain",
                            }}
                            key={currentImgUrl}
                            alt=""
                          />
                          <button
                            style={{
                              backgroundColor: "red",
                              padding: 5,
                              borderRadius: 5,
                              position: "absolute",
                              top: 10,
                              right: 10,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setSelectedFile(null);
                              setcurrentImgUrl(null);
                            }}
                          >
                            <span style={{ color: "white" }}>Remove</span>
                          </button>
                        </>
                      ) : (
                        <div style={styles.uploadImageInner}>
                          <MdFolderCopy
                            size={70}
                            color="rgba(0,0,0,1)"
                          />
                          <span style={styles.dragDropImageTxt}>
                            Drag &amp; drop or select a file to upload Image
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div style={styles.spacer}></div>
                  <div style={styles.productSmallDetailsRow}>
                    <div style={styles.productNameInputGroup}>
                      <span style={styles.productNameTxt}>Product Name</span>
                      <input
                        style={styles.productNameBox}
                        placeholder="Enter Product Name"
                        onChange={(ev) =>
                          setnewProduct((prevState) => ({
                            ...prevState,
                            name: ev.target.value,
                          }))
                        }
                        value={newProduct?.name}
                      />
                    </div>
                    <div style={styles.productPriceInputGroup}>
                      <span style={styles.productPriceTxt}>Base Price</span>
                      <input
                        style={styles.productPriceBox}
                        placeholder="Enter Base Price"
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
                    <div style={styles.productCategoryInputGroup}>
                      <span style={styles.category}>Category</span>
                      <DropdownStringOptions
                        placeholder="Choose Category"
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
                    <div style={styles.productRankInputGroup}>
                      <span style={styles.rankTxt}>Rank</span>
                      <input
                        style={styles.rankBox}
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
                  <div style={styles.spacer2}></div>
                  <div style={styles.displayOnlineSwitchRow}>
                    <span style={styles.displayOnlineStoreTxt}>
                      Dont display on online store?:
                    </span>
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
                  <div style={{ width: "100%", height: 20 }}></div>
                  <div style={styles.displayOnlineSwitchRow}>
                    <span style={styles.displayOnlineStoreTxt}>
                      Track Inventory?:
                    </span>
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
                  {newProduct?.trackStock && (
                    <div style={{ width: "100%", marginTop: 16 }}>
                      {/* Tracking mode toggle */}
                      <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 16 }}>
                        <button
                          style={{
                            flex: 1,
                            height: 34,
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            backgroundColor: (!newProduct.recipe || newProduct.recipe.length === 0) ? "#1e293b" : "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => setnewProduct((prev) => ({ ...prev, recipe: undefined }))}
                        >
                          <span style={{ fontSize: 13, fontWeight: "500", color: (!newProduct.recipe || newProduct.recipe.length === 0) ? "#fff" : "#64748b" }}>
                            Track by Count
                          </span>
                        </button>
                        <button
                          style={{
                            flex: 1,
                            height: 34,
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            backgroundColor: (newProduct.recipe && newProduct.recipe.length > 0) ? "#1e293b" : "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => setnewProduct((prev) => ({ ...prev, recipe: prev.recipe && prev.recipe.length > 0 ? prev.recipe : [] }))}
                        >
                          <span style={{ fontSize: 13, fontWeight: "500", color: (newProduct.recipe && newProduct.recipe.length > 0) ? "#fff" : "#64748b" }}>
                            Track by Recipe
                          </span>
                        </button>
                      </div>

                      {/* Simple count-based tracking */}
                      {(!newProduct.recipe || newProduct.recipe.length === 0) && !Array.isArray(newProduct.recipe) && (
                        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ color: "#121212", fontSize: 14 }}>Stock Quantity</span>
                            <input
                              type="number"
                              min="0"
                              style={styles.rankBox}
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
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ color: "#121212", fontSize: 14 }}>Low Stock Alert</span>
                            <input
                              type="number"
                              min="0"
                              style={styles.rankBox}
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
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ color: "#121212", fontSize: 14 }}>Cost Price</span>
                            <input
                              style={styles.rankBox}
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

                      {/* Recipe-based ingredient tracking */}
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
                  <div style={styles.spacer3}></div>
                  <div style={styles.productDescriptionInputGroup}>
                    <span style={styles.productDescriptionTxt}>
                      Product Description
                    </span>
                    <textarea
                      style={styles.productDiscBox}
                      placeholder="Enter Product Description"
                      onChange={(ev) =>
                        setnewProduct((prevState) => ({
                          ...prevState,
                          description: ev.target.value,
                        }))
                      }
                      value={newProduct?.description}
                    />
                  </div>
                  <div style={styles.spacer4}></div>
                  <span style={styles.optionsTxt}>Options</span>
                  <div style={styles.spacer5}></div>
                  {newProduct.options.map((option, index) => {
                    return (
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
                    );
                  })}
                  {newProduct.options.length === 0 && (
                    <div
                      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                    >
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
                        <span style={styles.createOptionTxt}>
                          Create Option
                        </span>
                      </button>
                      <button
                        style={{ ...styles.createOptionBtn, marginLeft: 20 }}
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
                        <span style={styles.createOptionTxt}>Paste Option</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.cancelAndSaveBtns}>
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
                      ? "Add"
                      : existingProduct
                      ? "Save"
                      : "Add"}
                  </span>
                </button>
              </div>
            </div>
            <div
              style={{
                ...styles.container,
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
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1px solid #e6e6e6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
  },
  topRow: {
    width: "95%",
    height: 49,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productAdd: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 21,
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
    border: "none",
    cursor: "pointer",
  },
  templatesBtnLbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
    marginRight: 10,
  },
  chevronDownIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  innerScrollArea: {
    width: "90%",
  },
  innerScrollArea_contentContainerStyle: {
    paddingRight: 20,
  },
  imageUploadGroup: {
    width: "100%",
    height: 179,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  productImageUploadTxt: {
    color: "#121212",
    fontSize: 17,
    marginBottom: 5,
    display: "inline-block",
  },
  productImageUpContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#ffffff",
    border: "1px solid #a8a8a8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    position: "relative" as const,
    cursor: "pointer",
  },
  uploadImageInner: {
    width: 400,
    height: 98,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upProductImageIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 70,
  },
  dragDropImageTxt: {
    color: "#121212",
    fontSize: 16,
  },
  spacer: {
    width: "100%",
    height: 53,
  },
  productSmallDetailsRow: {
    width: "100%",
    height: 79,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productNameInputGroup: {
    width: 195,
    height: 79,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 0,
  },
  productNameTxt: {
    color: "#121212",
    fontSize: 17,
  },
  productNameBox: {
    width: 195,
    height: 52,
    backgroundColor: "rgba(255,255, 255,1)",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
    padding: 10,
    boxSizing: "border-box" as const,
  },
  productPriceInputGroup: {
    width: 197,
    height: 79,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 0,
  },
  productPriceTxt: {
    color: "#121212",
    fontSize: 17,
  },
  productPriceBox: {
    width: 197,
    height: 52,
    backgroundColor: "rgba(255,255, 255,1)",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
    padding: 10,
    boxSizing: "border-box" as const,
  },
  productCategoryInputGroup: {
    width: 197,
    height: 79,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 0,
  },
  category: {
    color: "#121212",
    fontSize: 17,
    marginBottom: 5,
    display: "inline-block",
  },
  categoryDropDownBox: {
    backgroundColor: "rgba(255,255, 255,1)",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
  },
  productRankInputGroup: {
    width: 156,
    height: 79,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 0,
  },
  rankTxt: {
    color: "#121212",
    fontSize: 17,
  },
  rankBox: {
    width: 154,
    height: 52,
    backgroundColor: "rgba(255,255, 255,1)",
    borderRadius: 5,
    border: "1px solid #9e9e9e",
    padding: 10,
    boxSizing: "border-box" as const,
  },
  spacer2: {
    width: "100%",
    height: 36,
  },
  displayOnlineSwitchRow: {
    width: 300,
    height: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  displayOnlineStoreTxt: {
    color: "#121212",
    fontSize: 17,
  },
  onlineStoreSwitch: {
    width: 40,
    height: 20,
    backgroundColor: "#E6E6E6",
  },
  spacer3: {
    width: "100%",
    height: 28,
  },
  productDescriptionInputGroup: {
    width: "100%",
    height: 141,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  productDescriptionTxt: {
    color: "#121212",
    fontSize: 17,
  },
  productDiscBox: {
    width: "100%",
    height: 114,
    backgroundColor: "#ffffff",
    border: "1px solid #a8a8a8",
    padding: 10,
    boxSizing: "border-box" as const,
    resize: "none" as const,
    fontFamily: "inherit",
  },
  spacer4: {
    width: "100%",
    height: 31,
  },
  optionsTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  spacer5: {
    width: "100%",
    height: 31,
  },
  optionsItem: {
    alignSelf: "stretch",
  },
  createOptionBtn: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  createOptionTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  cancelAndSaveBtns: {
    width: "95%",
    height: 47,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cancelBtn: {
    width: 173,
    height: 47,
    backgroundColor: "#eef2ff",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 25,
    border: "none",
    cursor: "pointer",
  },
  cancelTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  saveBtn: {
    width: 173,
    height: 47,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  saveTxt: {
    fontWeight: "700",
    color: "#eef2ff",
    fontSize: 20,
  },
};

export default AddProductModal;
