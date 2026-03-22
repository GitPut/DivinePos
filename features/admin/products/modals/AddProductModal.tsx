import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoCopy } from "react-icons/io5";
import { FiUpload, FiX, FiPlus, FiClipboard, FiEye, FiEyeOff, FiLayers, FiCode } from "react-icons/fi";
import OptionsItem from "../components/OptionsItem";
import {
  onlineStoreState,
  optionTemplatesState,
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
  const [showPreview, setShowPreview] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const optionTemplates = optionTemplatesState.use();
  const alertP = useAlert();

  const closeModal = () => {
    setaddProductModal(false);
    setexistingProduct(null);
    setisProductTemplate(false);
  };

  const confirmDiscard = () => {
    const hasChanges = existingProduct
      ? JSON.stringify(existingProduct) !== JSON.stringify(newProduct)
      : newProduct.name.length > 0;

    if (hasChanges) {
      Swal.fire({
        title: "Discard changes?",
        text: "You have unsaved changes that will be lost.",
        showCancelButton: true,
        confirmButtonColor: "#1D294E",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "Discard",
        cancelButtonText: "Keep editing",
      }).then(function (t) {
        if (t.value) closeModal();
      });
    } else {
      closeModal();
    }
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

  // Clean up incomplete options, selections, and visibility rules before saving
  function cleanOptions(options: typeof newProductOptions) {
    return options
      .filter((opt) => opt.label && opt.label.trim().length > 0)
      .map((opt) => {
        const cleaned = { ...opt };
        // Remove selections without a name
        cleaned.optionsList = (cleaned.optionsList ?? []).filter(
          (sel) => sel.label && sel.label.trim().length > 0
        );
        // Remove incomplete visibility rules
        if (cleaned.selectedCaseList) {
          cleaned.selectedCaseList = cleaned.selectedCaseList.filter(
            (rule: any) => rule.selectedCaseKey && rule.selectedCaseValue
          );
          if (cleaned.selectedCaseList.length === 0) {
            cleaned.selectedCaseList = [];
          }
        }
        // Default optionType to "Row" if missing
        if (!cleaned.optionType) {
          cleaned.optionType = "Row";
        }
        return cleaned;
      });
  }

  function handleDataUpdate() {
    if (!newProduct.name) {
      alertP.error("Please enter a product name");
      return;
    }
    if (!newProduct.price) {
      alertP.error("Please enter a price");
      return;
    }

    // Clean options before saving
    const cleanedOptions = cleanOptions(newProductOptions);

    if (existingProduct && !isProductTemplate) {
      const copy = structuredClone(catalog.products);
      const newProductUseRef: ProductProp = {
        ...newProduct,
        options: cleanedOptions,
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
                if (newProductUseRef.hasImage && !selectedFile && !currentImgUrl) {
                  storage.ref(auth.currentUser?.uid + "/images/" + existingProduct.id).delete();
                  newProductUseRef.hasImage = false;
                  newProductUseRef.imageUrl = null;
                }
                copy[findIndex] = newProductUseRef;
                if (!newProductUseRef.id) return;
                setStoreProductsState({ categories: catalog.categories, products: copy.sort(customSort) });
                const imgBatch = db.batch();
                imgBatch.set(db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()), newProductUseRef);
                if (onlineStoreDetails.onlineStoreSetUp) {
                  imgBatch.set(db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()), newProductUseRef);
                }
                imgBatch.commit();
              });
          });
      } else {
        if (newProductUseRef.hasImage && !selectedFile && !currentImgUrl) {
          storage.ref(auth.currentUser?.uid + "/images/" + existingProduct.id).delete();
          newProductUseRef.hasImage = false;
          newProductUseRef.imageUrl = null;
        }
        copy[findIndex] = newProductUseRef;
        if (!newProductUseRef.id) return;
        setStoreProductsState({ categories: catalog.categories, products: copy.sort(customSort) });
        const updateBatch = db.batch();
        updateBatch.set(db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()), newProductUseRef);
        if (onlineStoreDetails.onlineStoreSetUp) {
          updateBatch.set(db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProductUseRef.id.toString()), newProductUseRef);
        }
        updateBatch.commit();
      }
    } else {
      newProduct.isTemplate = false;
      newProduct.options = cleanedOptions;
      if (selectedFile) {
        storage.ref(auth.currentUser?.uid + "/images/" + newProduct.id).put(selectedFile).then(() => {
          storage.ref(auth.currentUser?.uid + "/images/" + newProduct.id).getDownloadURL().then((url) => {
            newProduct.hasImage = true;
            newProduct.imageUrl = url;
            const newImgBatch = db.batch();
            newImgBatch.set(db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""), newProduct);
            if (onlineStoreDetails.onlineStoreSetUp) {
              newImgBatch.set(db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""), newProduct);
            }
            newImgBatch.commit();
            setStoreProductsState({ categories: catalog.categories, products: [...catalog.products, newProduct].sort(customSort) });
          });
        });
      } else {
        const newBatch = db.batch();
        newBatch.set(db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""), newProduct);
        if (onlineStoreDetails.onlineStoreSetUp) {
          newBatch.set(db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(newProduct.id?.toString() ?? ""), newProduct);
        }
        newBatch.commit();
        setStoreProductsState({ categories: catalog.categories, products: [...catalog.products, newProduct].sort(customSort) });
      }
    }
    closeModal();
  }

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    if (event.target.files[0].size < 5000000) {
      setSelectedFile(event.target.files[0]);
    } else {
      alertP.error("Sorry 5mb files are the max!");
    }
  };

  const modalTitle = isProductTemplate ? "Add Product" : existingProduct ? "Update Product" : "Add Product";
  const canShowPreview = width > 900;

  return (
    <div style={styles.fullScreen}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button style={styles.closeBtn} onClick={closeModal}>
            <FiX size={18} color="#64748b" />
          </button>
          <span style={styles.topBarTitle}>{modalTitle}</span>
        </div>
        <div style={styles.topBarRight}>
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
                dupBatch.set(db.collection("users").doc(auth.currentUser?.uid).collection("products").doc(copy.id.toString()), copy);
                if (onlineStoreDetails.onlineStoreSetUp) {
                  dupBatch.set(db.collection("public").doc(auth.currentUser?.uid).collection("products").doc(copy.id.toString()), copy);
                }
                dupBatch.commit();
                setStoreProductsState({ categories: catalog.categories, products: [...catalog.products, copy] });
                setexistingProduct(copy);
              }}
            >
              <IoCopy size={14} color="#475569" />
              <span style={styles.actionBtnTxt}>Duplicate</span>
            </button>
          )}
          {existingProduct && !isProductTemplate && (
            <button
              style={styles.duplicateBtn}
              onClick={() => {
                const jsonStr = JSON.stringify(newProduct, null, 2);
                navigator.clipboard.writeText(jsonStr);
                alertP.show("Product JSON copied to clipboard");
              }}
            >
              <FiCode size={14} color="#475569" />
              <span style={styles.actionBtnTxt}>Copy JSON</span>
            </button>
          )}
          {canShowPreview && (
            <button
              style={styles.previewToggleBtn}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <FiEyeOff size={14} color="#475569" /> : <FiEye size={14} color="#475569" />}
              <span style={styles.actionBtnTxt}>{showPreview ? "Hide Preview" : "Show Preview"}</span>
            </button>
          )}
          <button style={styles.cancelBtn} onClick={closeModal}>
            <span style={styles.cancelTxt}>Cancel</span>
          </button>
          <button style={styles.saveBtn} onClick={handleDataUpdate} data-walkthrough="save-product">
            <span style={styles.saveTxt}>
              {isProductTemplate ? "Add Product" : existingProduct ? "Save Changes" : "Add Product"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Editor */}
        <div style={{ ...styles.editorPanel, flex: showPreview ? "0 0 60%" : "1 1 100%", maxWidth: showPreview ? "none" : 860, margin: showPreview ? 0 : "0 auto" }}>
          <div
            style={styles.scrollArea}
            onScroll={(event) => setScrollY(event.currentTarget.scrollTop)}
            ref={scrollViewRef}
          >
            <input type="file" ref={hiddenFileInput} onChange={changeHandler} style={{ display: "none" }} accept="image/*" />

            {/* Product Name + Price — most important, always on top */}
            <div style={styles.topFields}>
              <div style={{ ...styles.fieldGroup, flex: 2 }}>
                <span style={styles.fieldLabel}>Product Name</span>
                <input
                  style={styles.inputLg}
                  placeholder="e.g. Margherita Pizza, Iced Latte, Caesar Salad"
                  onChange={(ev) => setnewProduct((prev) => ({ ...prev, name: ev.target.value }))}
                  value={newProduct?.name}
                  autoFocus
                  data-walkthrough="product-name-input"
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Price ($)</span>
                <input
                  style={styles.inputLg}
                  placeholder="0.00"
                  onChange={(ev) => {
                    const val = ev.target.value;
                    const re = /^-?\d*\.?\d*$/;
                    if (re.test(val)) {
                      setnewProduct((prev) => ({ ...prev, price: val.replace(/^0+/, "") }));
                    } else if (!val) {
                      setnewProduct((prev) => ({ ...prev, price: "0" }));
                    }
                  }}
                  value={newProduct?.price.toString()}
                  data-walkthrough="product-price-input"
                />
              </div>
            </div>

            {/* Details Card */}
            <div style={styles.card}>
              <span style={styles.cardTitle}>Details</span>
              <div style={styles.fieldsRow}>
                <div style={styles.fieldGroup} data-walkthrough="product-category">
                  <span style={styles.fieldLabel}>Category</span>
                  <DropdownStringOptions
                    placeholder="Choose category"
                    value={newProduct?.category ? newProduct.category : null}
                    setValue={(val) => setnewProduct((prev) => ({ ...prev, category: val }))}
                    options={selectValues}
                    scrollY={scrollY}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Display Order</span>
                  <input
                    style={styles.input}
                    placeholder="Auto"
                    onChange={(ev) => {
                      const val = ev.target.value;
                      const re = /^[0-9]+$/;
                      if (re.test(val)) {
                        setnewProduct((prev) => ({ ...prev, rank: val }));
                      } else if (!val) {
                        setnewProduct((prev) => ({ ...prev, rank: undefined }));
                      }
                    }}
                    value={newProduct?.rank?.toString()}
                  />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Description <span style={styles.optionalTag}>optional</span></span>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe this product for your customers"
                  onChange={(ev) => setnewProduct((prev) => ({ ...prev, description: ev.target.value }))}
                  value={newProduct?.description}
                />
              </div>
            </div>

            {/* Image Card */}
            <div style={styles.card}>
              <span style={styles.cardTitle}>Image <span style={styles.optionalTag}>optional</span></span>
              <button onClick={handleClick} style={styles.imageUploadArea} data-walkthrough="product-image-upload">
                {selectedFile ? (
                  <>
                    <img src={URL.createObjectURL(selectedFile)} style={styles.previewImage} key={selectedFile.name} alt="" />
                    <button style={styles.removeImageBtn} onClick={(ev) => { ev.stopPropagation(); setSelectedFile(null); }}>
                      <FiX size={14} color="#fff" />
                    </button>
                  </>
                ) : currentImgUrl ? (
                  <>
                    <img src={currentImgUrl} style={styles.previewImage} key={currentImgUrl} alt="" />
                    <button style={styles.removeImageBtn} onClick={(ev) => { ev.stopPropagation(); setSelectedFile(null); setcurrentImgUrl(null); }}>
                      <FiX size={14} color="#fff" />
                    </button>
                  </>
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <FiUpload size={20} color="#94a3b8" />
                    <span style={styles.uploadTxt}>Click to upload</span>
                    <span style={styles.uploadHint}>PNG, JPG up to 5MB</span>
                  </div>
                )}
              </button>
            </div>

            {/* Settings Card */}
            <div style={styles.card}>
              <span style={styles.cardTitle}>Settings</span>
              <div style={styles.toggleSection}>
                <div style={styles.toggleRow}>
                  <div>
                    <span style={styles.toggleLabel}>Hide from Online Store</span>
                    <span style={styles.toggleHint}>Won't appear on your online store</span>
                  </div>
                  <Switch isActive={newProduct?.dontDisplayOnOnlineStore ?? false} toggleSwitch={() => setnewProduct((prev) => ({ ...prev, dontDisplayOnOnlineStore: !prev.dontDisplayOnOnlineStore }))} />
                </div>
                <div style={{ ...styles.toggleRow, borderBottom: "none" }}>
                  <div>
                    <span style={styles.toggleLabel}>Track Inventory</span>
                    <span style={styles.toggleHint}>Monitor stock levels for this product</span>
                  </div>
                  <Switch isActive={newProduct?.trackStock ?? false} toggleSwitch={() => setnewProduct((prev) => ({ ...prev, trackStock: !prev.trackStock }))} />
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            {newProduct?.trackStock && (
              <div style={styles.card}>
                <span style={styles.cardTitle}>Inventory</span>
                <div style={styles.trackingToggleRow}>
                  <button
                    style={{ ...styles.trackingToggleBtn, ...(!newProduct.recipe || newProduct.recipe.length === 0 ? styles.trackingToggleBtnActive : {}) }}
                    onClick={() => setnewProduct((prev) => { const clone = { ...prev }; delete clone.recipe; return clone; })}
                  >
                    <span style={{ ...styles.trackingToggleTxt, ...(!newProduct.recipe || newProduct.recipe.length === 0 ? styles.trackingToggleTxtActive : {}) }}>Simple Count</span>
                  </button>
                  <button
                    style={{ ...styles.trackingToggleBtn, ...(newProduct.recipe && newProduct.recipe.length > 0 ? styles.trackingToggleBtnActive : {}) }}
                    onClick={() => setnewProduct((prev) => ({ ...prev, recipe: prev.recipe && prev.recipe.length > 0 ? prev.recipe : [] }))}
                  >
                    <span style={{ ...styles.trackingToggleTxt, ...(newProduct.recipe && newProduct.recipe.length > 0 ? styles.trackingToggleTxtActive : {}) }}>Recipe Based</span>
                  </button>
                </div>
                {(!newProduct.recipe || newProduct.recipe.length === 0) && !Array.isArray(newProduct.recipe) && (
                  <div style={styles.fieldsRow}>
                    <div style={styles.fieldGroup}>
                      <span style={styles.fieldLabel}>Stock Quantity</span>
                      <input type="number" min="0" style={styles.input} placeholder="0" value={newProduct.stockQuantity ?? ""} onChange={(ev) => { const val = parseInt(ev.target.value, 10); setnewProduct((prev) => ({ ...prev, stockQuantity: isNaN(val) ? 0 : val })); }} />
                    </div>
                    <div style={styles.fieldGroup}>
                      <span style={styles.fieldLabel}>Low Stock Alert</span>
                      <input type="number" min="0" style={styles.input} placeholder="5" value={newProduct.lowStockThreshold ?? ""} onChange={(ev) => { const val = parseInt(ev.target.value, 10); setnewProduct((prev) => ({ ...prev, lowStockThreshold: isNaN(val) ? 5 : val })); }} />
                    </div>
                    <div style={styles.fieldGroup}>
                      <span style={styles.fieldLabel}>Cost Price</span>
                      <input style={styles.input} placeholder="0.00" value={newProduct.costPrice ?? ""} onChange={(ev) => setnewProduct((prev) => ({ ...prev, costPrice: ev.target.value }))} />
                    </div>
                  </div>
                )}
                {Array.isArray(newProduct.recipe) && (
                  <RecipeEditor recipe={newProduct.recipe} onRecipeChange={(recipe: RecipeItem[]) => setnewProduct((prev) => ({ ...prev, recipe }))} />
                )}
              </div>
            )}

            {/* Options Card */}
            <div style={styles.card}>
              <div style={styles.cardTitleRow}>
                <span style={styles.cardTitle}>
                  Customization Options
                  {newProduct.options.length > 0 && (
                    <span style={styles.optionCount}>{newProduct.options.length}</span>
                  )}
                </span>
                <span style={styles.cardSubtitle}>
                  Let customers customize this product (sizes, toppings, extras, etc.)
                </span>
              </div>
              {newProduct.options.length > 0 && optionTemplates.length > 0 && (
                <div style={styles.optionActionsRow}>
                  <button
                    style={styles.templatePickerBtn}
                    onClick={() => setShowTemplatePicker(true)}
                  >
                    <FiLayers size={14} color="#1D294E" />
                    <span style={styles.templatePickerTxt}>Add from Template</span>
                  </button>
                  <button
                    onClick={() => {
                      setnewProductOptions((prev) => [...prev, {
                        label: null, optionsList: [], numOfSelectable: null,
                        id: Math.random().toString(36).substr(2, 9),
                        optionType: null, selectedCaseList: [], isRequired: false,
                      }]);
                      setindexOn(newProductOptions.length);
                    }}
                    style={styles.addCustomOptionBtn}
                  >
                    <FiPlus size={14} color="#475569" />
                    <span style={styles.addCustomOptionTxt}>Add Custom</span>
                  </button>
                </div>
              )}
              {newProduct.options.length > 0 ? (
                newProduct.options.map((option, index) => (
                  <OptionsItem
                    key={option.id}
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
                    isDragging={dragIndex === index}
                    isDragOver={dragOverIndex === index && dragIndex !== index}
                    onDragStart={(i) => { setDragIndex(i); setindexOn(null); }}
                    onDragOver={(i) => setDragOverIndex(i)}
                    onDragEnd={() => {
                      if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
                        setnewProductOptions((prev) => {
                          const clone = structuredClone(prev);
                          const [moved] = clone.splice(dragIndex, 1);
                          clone.splice(dragOverIndex, 0, moved);
                          return clone;
                        });
                        setnewProduct((prev) => {
                          const clone = structuredClone(prev);
                          const [moved] = clone.options.splice(dragIndex, 1);
                          clone.options.splice(dragOverIndex, 0, moved);
                          return clone;
                        });
                      }
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                  />
                ))
              ) : (
                <div style={styles.emptyOptions}>
                  <span style={styles.emptyOptionsTxt}>No options yet</span>
                  <span style={styles.emptyOptionsHint}>
                    Create options like "Size" with choices like Small, Medium, Large — each with optional price changes
                  </span>
                  <div style={styles.optionBtnsRow} data-walkthrough="product-options-area">
                    {optionTemplates.length > 0 && (
                      <button
                        style={styles.templatePickerBtn}
                        onClick={() => setShowTemplatePicker(true)}
                      >
                        <FiLayers size={15} color="#1D294E" />
                        <span style={styles.templatePickerTxt}>Add from Template</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setnewProductOptions([{
                          label: null, optionsList: [], numOfSelectable: null,
                          id: Math.random().toString(36).substr(2, 9),
                          optionType: null, selectedCaseList: [], isRequired: false,
                        }]);
                        setindexOn(0);
                      }}
                      style={styles.createOptionBtn}
                    >
                      <FiPlus size={15} color="#fff" />
                      <span style={styles.createOptionTxt}>Create Custom</span>
                    </button>
                  </div>
                </div>
              )}
              {/* Template Picker Dropdown */}
              {showTemplatePicker && (
                <div style={styles.templatePickerOverlay}>
                  <div style={styles.templatePickerCard}>
                    <div style={styles.templatePickerHeader}>
                      <span style={styles.templatePickerTitle}>Add from Template</span>
                      <button style={styles.templatePickerClose} onClick={() => setShowTemplatePicker(false)}>
                        <FiX size={14} color="#64748b" />
                      </button>
                    </div>
                    <div style={styles.templatePickerList}>
                      {optionTemplates.map((template) => {
                        const alreadyAdded = newProductOptions.some((o) => o.templateId === template.id);
                        return (
                          <button
                            key={template.id}
                            style={{
                              ...styles.templatePickerItem,
                              ...(alreadyAdded ? { opacity: 0.5 } : {}),
                            }}
                            disabled={alreadyAdded}
                            onClick={() => {
                              const newOpt = {
                                ...structuredClone(template.option),
                                templateId: template.id,
                                id: Math.random().toString(36).substr(2, 9),
                              };
                              setnewProductOptions((prev) => [...prev, newOpt]);
                              setShowTemplatePicker(false);
                            }}
                          >
                            <div style={styles.templatePickerItemLeft}>
                              <FiLayers size={14} color="#1D294E" />
                              <div>
                                <span style={styles.templatePickerItemName}>{template.name}</span>
                                <span style={styles.templatePickerItemMeta}>
                                  {template.option.label} · {template.option.optionsList?.length ?? 0} choices
                                </span>
                              </div>
                            </div>
                            <span style={styles.templatePickerItemAction}>
                              {alreadyAdded ? "Added" : "Add"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && canShowPreview && (
          <div style={styles.previewPanel}>
            <ProductBuilderView
              product={newProduct}
              imageUrl={selectedFile ? URL.createObjectURL(selectedFile) : currentImgUrl ? currentImgUrl : null}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fullScreen: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  // Top Bar
  topBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    padding: "0 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  topBarLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  topBarRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    padding: 0,
  },
  duplicateBtn: {
    height: 36,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
  },
  previewToggleBtn: {
    height: 36,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
  },
  actionBtnTxt: {
    fontWeight: "500",
    color: "#475569",
    fontSize: 13,
  },
  cancelBtn: {
    height: 36,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  cancelTxt: {
    fontWeight: "600",
    color: "#475569",
    fontSize: 13,
  },
  saveBtn: {
    height: 36,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  saveTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 13,
  },
  // Main Content
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  editorPanel: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    padding: "24px 32px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  previewPanel: {
    flex: "0 0 40%",
    borderLeft: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  // Top Fields (Name + Price)
  topFields: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitleRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  optionCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#1D294E",
    width: 20,
    height: 20,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Fields
  fieldsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 140,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: "400",
    color: "#94a3b8",
    marginLeft: 4,
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
  inputLg: {
    height: 48,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    backgroundColor: "#fff",
  },
  textarea: {
    width: "100%",
    height: 80,
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
  // Image
  imageUploadArea: {
    width: "100%",
    height: 120,
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
    gap: 4,
  },
  uploadTxt: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  uploadHint: { fontSize: 11, color: "#94a3b8" },
  // Toggles
  toggleSection: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  toggleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a", display: "block" },
  toggleHint: { fontSize: 12, color: "#94a3b8", marginTop: 1, display: "block" },
  // Inventory
  trackingToggleRow: { display: "flex", flexDirection: "row", gap: 8 },
  trackingToggleBtn: {
    flex: 1, height: 36, borderRadius: 8, border: "1px solid #e2e8f0",
    backgroundColor: "#fff", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  trackingToggleBtnActive: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  trackingToggleTxt: { fontSize: 13, fontWeight: "500", color: "#64748b" },
  trackingToggleTxtActive: { color: "#fff" },
  // Empty Options
  emptyOptions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "28px 16px",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px dashed #e2e8f0",
  },
  emptyOptionsTxt: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  emptyOptionsHint: { fontSize: 13, color: "#94a3b8", marginBottom: 14, textAlign: "center" as const, maxWidth: 400 },
  optionBtnsRow: { display: "flex", flexDirection: "row", alignItems: "center", gap: 10 },
  createOptionBtn: {
    height: 38, paddingLeft: 16, paddingRight: 16, backgroundColor: "#1D294E",
    borderRadius: 8, display: "flex", flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6, border: "none", cursor: "pointer",
  },
  createOptionTxt: { fontWeight: "600", color: "#fff", fontSize: 13 },
  pasteOptionBtn: {
    height: 38, paddingLeft: 16, paddingRight: 16, backgroundColor: "#fff",
    border: "1px solid #e2e8f0", borderRadius: 8, display: "flex",
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, cursor: "pointer",
  },
  pasteOptionTxt: { fontWeight: "500", color: "#475569", fontSize: 13 },
  optionActionsRow: {
    display: "flex", flexDirection: "row" as const, alignItems: "center", gap: 8,
    marginBottom: 4,
  },
  addCustomOptionBtn: {
    height: 34, paddingLeft: 12, paddingRight: 12, backgroundColor: "#fff",
    border: "1px solid #e2e8f0", borderRadius: 8, display: "flex",
    flexDirection: "row" as const, alignItems: "center", justifyContent: "center",
    gap: 5, cursor: "pointer",
  },
  addCustomOptionTxt: { fontWeight: "500", color: "#475569", fontSize: 12 },
  templatePickerBtn: {
    height: 38, paddingLeft: 16, paddingRight: 16, backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe", borderRadius: 8, display: "flex",
    flexDirection: "row" as const, alignItems: "center", justifyContent: "center",
    gap: 6, cursor: "pointer",
  },
  templatePickerTxt: { fontWeight: "600", color: "#1D294E", fontSize: 13 },
  templatePickerOverlay: {
    position: "relative" as const, marginTop: 8,
  },
  templatePickerCard: {
    backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden",
  },
  templatePickerHeader: {
    display: "flex", flexDirection: "row" as const, alignItems: "center",
    justifyContent: "space-between", padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  templatePickerTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  templatePickerClose: {
    width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0",
    backgroundColor: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", padding: 0,
  },
  templatePickerList: {
    maxHeight: 240, overflow: "auto", padding: "4px 0",
  },
  templatePickerItem: {
    display: "flex", flexDirection: "row" as const, alignItems: "center",
    justifyContent: "space-between", width: "100%", padding: "10px 16px",
    background: "none", border: "none", cursor: "pointer", textAlign: "left" as const,
    boxSizing: "border-box" as const,
  },
  templatePickerItemLeft: {
    display: "flex", flexDirection: "row" as const, alignItems: "center",
    gap: 10,
  },
  templatePickerItemName: {
    fontSize: 14, fontWeight: "600", color: "#0f172a", display: "block",
  },
  templatePickerItemMeta: {
    fontSize: 12, color: "#94a3b8", display: "block",
  },
  templatePickerItemAction: {
    fontSize: 13, fontWeight: "600", color: "#1D294E",
  },
};

export default AddProductModal;
