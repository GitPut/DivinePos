import React, { useMemo, useRef, useState } from "react";
import ProductOptionBox from "./components/ProductOptionBox";
import { FiSearch, FiPlus, FiLayers, FiGrid, FiList } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
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
  const [searchFilterValue, setSearchFilterValue] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addProductModal, setAddProductModal] = useState<boolean>(false);
  const [existingProduct, setExistingProduct] = useState<ProductProp | null>(
    null
  );
  const [isProductTemplate, setIsProductTemplate] = useState<boolean>(false);
  const [productTemplatesModalVisible, setProductTemplatesModalVisible] =
    useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragHandledRef = useRef(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  const confirmText = (ProductID: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#1D294E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(function (t) {
      if (t.value) {
        Swal.fire({
          title: "Deleted!",
          text: "Your product has been deleted.",
          confirmButtonColor: "#1D294E",
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

  const canDrag = !searchFilterValue;

  // Auto-scroll when dragging near top/bottom edges
  const handleDragOver = (ev: React.DragEvent) => {
    if (!scrollAreaRef.current) return;
    const rect = scrollAreaRef.current.getBoundingClientRect();
    const y = ev.clientY;
    const edgeSize = 120;

    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (y < rect.top + edgeSize) {
      scrollIntervalRef.current = window.setInterval(() => {
        scrollAreaRef.current?.scrollBy(0, -8);
      }, 16);
    } else if (y > rect.bottom - edgeSize) {
      scrollIntervalRef.current = window.setInterval(() => {
        scrollAreaRef.current?.scrollBy(0, 8);
      }, 16);
    }
  };

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleDragEnd = () => {
    stopAutoScroll();
    if (dragHandledRef.current) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    dragHandledRef.current = true;
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      // Work with the filtered list to get the actual products being reordered
      const productsToReorder = filteredProducts;
      const movedProduct = productsToReorder[dragIndex];
      const targetProduct = productsToReorder[dragOverIndex];

      // Find their positions in the full catalog
      const fullList = [...catalog.products];
      const fromFullIndex = fullList.findIndex((p) => p.id === movedProduct.id);
      const toFullIndex = fullList.findIndex((p) => p.id === targetProduct.id);

      if (fromFullIndex !== -1 && toFullIndex !== -1) {
        const [moved] = fullList.splice(fromFullIndex, 1);
        fullList.splice(toFullIndex, 0, moved);

        // Assign new ranks based on position
        const userId = auth.currentUser?.uid;
        const isOnlineStore = onlineStoreState.get().onlineStoreSetUp;
        fullList.forEach((product, i) => {
          product.rank = i.toString();
          if (userId) {
            db.collection("users")
              .doc(userId)
              .collection("products")
              .doc(product.id)
              .update({ rank: i.toString() })
              .catch(() => {});
            if (isOnlineStore) {
              db.collection("public")
                .doc(userId)
                .collection("products")
                .doc(product.id)
                .update({ rank: i.toString() })
                .catch(() => {});
            }
          }
        });

        updateStoreProductsState({ products: fullList });
      }
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const filteredProducts = useMemo(() => {
    const query = searchFilterValue.toLowerCase().trim();
    let products = catalog.products.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesSearch =
        !query || product.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    // In "All" view (no category filter), sort by category order first, then rank within category
    if (!selectedCategory && !query) {
      const categoryOrder = catalog.categories;
      products = [...products].sort((a, b) => {
        const catA = categoryOrder.indexOf(a.category ?? "");
        const catB = categoryOrder.indexOf(b.category ?? "");
        // Products with no category or unknown category go to the end
        const orderA = catA === -1 ? categoryOrder.length : catA;
        const orderB = catB === -1 ? categoryOrder.length : catB;
        if (orderA !== orderB) return orderA - orderB;
        // Within same category, sort by rank
        return parseFloat(a.rank ?? "0") - parseFloat(b.rank ?? "0");
      });
    }

    return products;
  }, [catalog.products, catalog.categories, selectedCategory, searchFilterValue]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Product Management</span>
          <span style={styles.subtitle}>
            {catalog.products.length} product
            {catalog.products.length !== 1 ? "s" : ""} in your menu
          </span>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchWrap}>
            <FiSearch size={16} color="#94a3b8" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchFilterValue}
              onChange={(e) => setSearchFilterValue(e.target.value)}
            />
          </div>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewToggleBtn,
                ...(viewMode === "list" ? styles.viewToggleBtnActive : {}),
              }}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <FiList size={16} color={viewMode === "list" ? "#fff" : "#64748b"} />
            </button>
            <button
              style={{
                ...styles.viewToggleBtn,
                ...(viewMode === "grid" ? styles.viewToggleBtnActive : {}),
              }}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <FiGrid size={16} color={viewMode === "grid" ? "#fff" : "#64748b"} />
            </button>
          </div>
          <button
            style={styles.templateBtn}
            onClick={() => setProductTemplatesModalVisible(true)}
          >
            <FiLayers size={15} color="#475569" />
            <span style={styles.templateBtnTxt}>Templates</span>
          </button>
          <button
            style={styles.addBtn}
            onClick={() => setAddProductModal(true)}
            data-walkthrough="add-product"
          >
            <FiPlus size={16} color="#fff" />
            <span style={styles.addBtnTxt}>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      {catalog.categories.length > 0 && (
        <div style={styles.categoryRow}>
          <button
            style={{
              ...styles.categoryPill,
              ...(selectedCategory === null ? styles.categoryPillActive : {}),
            }}
            onClick={(ev) => { setSelectedCategory(null); ev.currentTarget.blur(); }}
          >
            <span
              style={{
                ...styles.categoryPillTxt,
                ...(selectedCategory === null ? styles.categoryPillTxtActive : {}),
              }}
            >
              All
            </span>
          </button>
          {catalog.categories.map((category) => (
            <button
              key={category}
              style={{
                ...styles.categoryPill,
                ...(selectedCategory === category ? styles.categoryPillActive : {}),
              }}
              onClick={(ev) => {
                setSelectedCategory((prev) =>
                  prev === category ? null : category
                );
                ev.currentTarget.blur();
              }}
            >
              <span
                style={{
                  ...styles.categoryPillTxt,
                  ...(selectedCategory === category ? styles.categoryPillTxtActive : {}),
                }}
              >
                {category}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Product List/Grid */}
      <div style={styles.scrollArea} ref={scrollAreaRef} onDragOver={handleDragOver} onDragLeave={stopAutoScroll}>
        {filteredProducts.length > 0 ? (
          viewMode === "list" ? (
            <div style={styles.tableCard}>
              {/* Table Header */}
              <div style={styles.tableHeader}>
                {canDrag && <span style={{ ...styles.tableHeaderTxt, width: 28 }} />}
                <span style={{ ...styles.tableHeaderTxt, width: 52 }} />
                <span style={{ ...styles.tableHeaderTxt, flex: 1 }}>Product</span>
                <span style={{ ...styles.tableHeaderTxt, width: 80, textAlign: "center" }}>Price</span>
                <span style={{ ...styles.tableHeaderTxt, width: 100, textAlign: "center" }}>Category</span>
                <span style={{ ...styles.tableHeaderTxt, width: 80, textAlign: "center" }}>Options</span>
                <span style={{ ...styles.tableHeaderTxt, width: 80, textAlign: "center" }}>Stock</span>
                <span style={{ ...styles.tableHeaderTxt, width: 76, textAlign: "center" }}>Actions</span>
              </div>
              {filteredProducts.map((product, i) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    ...(!canDrag ? {} : {}),
                    ...(dragIndex === i ? { opacity: 0.4 } : {}),
                    ...(dragOverIndex === i && dragIndex !== i
                      ? { borderTop: "2px solid #1D294E" }
                      : {}),
                  }}
                  onDragOver={(ev) => {
                    if (!canDrag) return;
                    ev.preventDefault();
                    setDragOverIndex(i);
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    handleDragEnd();
                  }}
                >
                  {canDrag && (
                    <div
                      draggable
                      onDragStart={() => {
                        setDragIndex(i);
                        dragHandledRef.current = false;
                      }}
                      onDragEnd={() => handleDragEnd()}
                      style={styles.dragHandle}
                      title="Drag to reorder"
                    >
                      <MdDragIndicator size={16} color="#94a3b8" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <ProductOptionBox
                      product={product}
                      editMode={true}
                      deleteProduct={() => confirmText(product.id)}
                      setexistingProduct={setExistingProduct}
                      viewMode="list"
                      isLast={i === filteredProducts.length - 1}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductOptionBox
                  key={product.id}
                  product={product}
                  editMode={true}
                  deleteProduct={() => confirmText(product.id)}
                  setexistingProduct={setExistingProduct}
                  viewMode="grid"
                />
              ))}
            </div>
          )
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyTitle}>
              {searchFilterValue || selectedCategory
                ? "No products found"
                : "No products yet"}
            </span>
            <span style={styles.emptySubtitle}>
              {searchFilterValue || selectedCategory
                ? "Try a different search or category"
                : "Add your first product to get started"}
            </span>
            {!searchFilterValue && !selectedCategory && (
              <button
                style={styles.emptyAddBtn}
                onClick={() => setAddProductModal(true)}
              >
                <FiPlus size={16} color="#fff" />
                <span style={styles.addBtnTxt}>Add Product</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal isVisible={!!(addProductModal || existingProduct)}>
        <AddProductModal
          addProductModal={addProductModal}
          setaddProductModal={setAddProductModal}
          existingProduct={existingProduct}
          setexistingProduct={setExistingProduct}
          isProductTemplate={isProductTemplate}
          setisProductTemplate={setIsProductTemplate}
        />
      </Modal>

      {/* Templates Modal */}
      <Modal
        isVisible={productTemplatesModalVisible}
        onBackdropPress={() => setProductTemplatesModalVisible(false)}
      >
        <div style={styles.modalWrap}>
          <ProductTemplatesModal
            setproductTemplatesModalVisible={setProductTemplatesModalVisible}
            setexistingProduct={setExistingProduct}
            setisProductTemplate={setIsProductTemplate}
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
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexShrink: 0,
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  headerActions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 40,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none" as const,
  },
  searchInput: {
    height: 40,
    width: 220,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    paddingLeft: 36,
    paddingRight: 12,
    fontSize: 13,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    lineHeight: "40px",
  },
  viewToggle: {
    display: "flex",
    flexDirection: "row",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  viewToggleBtn: {
    width: 36,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  viewToggleBtnActive: {
    backgroundColor: "#0f172a",
  },
  templateBtn: {
    height: 40,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 14,
    paddingRight: 14,
    cursor: "pointer",
  },
  templateBtnTxt: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  addBtn: {
    height: 40,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 16,
    paddingRight: 16,
    cursor: "pointer",
  },
  addBtnTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
    flexShrink: 0,
  },
  categoryPill: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  categoryPillActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  categoryPillTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  categoryPillTxtActive: {
    color: "#fff",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    paddingBottom: 20,
  },
  // Table view
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    gap: 12,
  },
  tableHeaderTxt: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  // Grid view
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    width: "100%",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 12,
  },
  emptyAddBtn: {
    height: 40,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 16,
    paddingRight: 16,
    cursor: "pointer",
  },
  dragHandle: {
    width: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    flexShrink: 0,
    paddingLeft: 8,
  },
  modalWrap: {
    display: "flex",
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default ProductList;
