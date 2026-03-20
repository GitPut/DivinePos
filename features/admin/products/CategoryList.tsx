import React, { useMemo, useRef, useState } from "react";
import { FiSearch, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import {
  onlineStoreState,
  updateStoreProductsState,
  storeProductsState,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import Swal from "sweetalert2";
import AddCategoryModal from "./modals/AddCategoryModal";
import Modal from "shared/components/ui/Modal";

function CategoryList() {
  const catalog = storeProductsState.use();
  const [searchFilterValue, setSearchFilterValue] = useState<string>("");
  const onlineStoreDetails = onlineStoreState.use();
  const [addCategoryModal, setAddCategoryModal] = useState<
    boolean | string | null
  >(false);
  const [editCategoryModal, setEditCategoryModal] = useState<string | null>(
    null
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const confirmText = (category: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#1470ef",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(function (t) {
      if (t.value) {
        Swal.fire({
          title: "Deleted!",
          text: "Your category has been deleted.",
          confirmButtonColor: "#1470ef",
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

  const saveCategories = (newCategories: string[]) => {
    db.collection("users").doc(auth.currentUser?.uid).update({
      categories: newCategories,
    });
    if (onlineStoreDetails.onlineStoreSetUp) {
      db.collection("public").doc(auth.currentUser?.uid).update({
        categories: newCategories,
      });
    }
    updateStoreProductsState({ categories: newCategories });
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const newCategories = [...catalog.categories];
    const [moved] = newCategories.splice(dragIndex, 1);
    newCategories.splice(targetIndex, 0, moved);
    saveCategories(newCategories);
  };

  const filteredCategories = useMemo(() => {
    if (!searchFilterValue) return catalog.categories;
    const query = searchFilterValue.toLowerCase().trim();
    return catalog.categories.filter((category) =>
      category.toLowerCase().includes(query)
    );
  }, [catalog.categories, searchFilterValue]);

  const isSearching = searchFilterValue.trim().length > 0;

  const getProductCount = (category: string) =>
    catalog.products.filter((p) => p.category === category).length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Category Management</span>
          <span style={styles.subtitle}>
            {isSearching
              ? "Drag to reorder is disabled while searching"
              : "Drag categories to reorder them"}
          </span>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchWrap}>
            <FiSearch size={16} color="#94a3b8" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search categories..."
              value={searchFilterValue}
              onChange={(e) => setSearchFilterValue(e.target.value)}
            />
          </div>
          <button
            style={styles.addBtn}
            onClick={() => setAddCategoryModal(true)}
          >
            <FiPlus size={16} color="#fff" />
            <span style={styles.addBtnTxt}>Add Category</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.scrollArea}>
        <div style={styles.card}>
          {/* Table Header */}
          <div style={styles.tableHeader}>
            <span style={{ ...styles.tableHeaderTxt, flex: 0, width: 70, marginRight: 8 }}>
              #
            </span>
            <span style={{ ...styles.tableHeaderTxt, flex: 1 }}>
              Category Name
            </span>
            <span style={{ ...styles.tableHeaderTxt, width: 100, textAlign: "center" }}>
              Products
            </span>
            <span style={{ ...styles.tableHeaderTxt, width: 100, textAlign: "center" }}>
              Actions
            </span>
          </div>

          {/* Category Rows */}
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, i) => {
              const count = getProductCount(category);
              const originalIndex = catalog.categories.indexOf(category);
              const isDragging = dragIndex === originalIndex;
              const isDragOver = dragOverIndex === originalIndex && dragIndex !== originalIndex;
              return (
                <div
                  key={category}
                  draggable={!isSearching}
                  onDragStart={(ev) => {
                    setDragIndex(originalIndex);
                    ev.dataTransfer.effectAllowed = "move";
                    // Make the drag image semi-transparent
                    if (ev.currentTarget instanceof HTMLElement) {
                      ev.dataTransfer.setDragImage(ev.currentTarget, 0, 0);
                    }
                  }}
                  onDragEnter={() => {
                    dragCounter.current++;
                    setDragOverIndex(originalIndex);
                  }}
                  onDragLeave={() => {
                    dragCounter.current--;
                    if (dragCounter.current === 0) {
                      setDragOverIndex(null);
                    }
                  }}
                  onDragOver={(ev) => {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    dragCounter.current = 0;
                    handleDrop(originalIndex);
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                    dragCounter.current = 0;
                  }}
                  style={{
                    ...styles.tableRow,
                    ...(i < filteredCategories.length - 1
                      ? { borderBottom: "1px solid #f1f5f9" }
                      : {}),
                    ...(isDragging ? { opacity: 0.4 } : {}),
                    ...(isDragOver
                      ? { borderTop: "2px solid #1470ef", marginTop: -1 }
                      : {}),
                    ...(!isSearching ? { cursor: "grab" } : {}),
                  }}
                >
                  <div style={{ width: 70, flex: 0, flexShrink: 0, display: "flex", flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 }}>
                    {!isSearching && (
                      <MdDragIndicator size={16} color="#cbd5e1" />
                    )}
                    <span style={styles.positionNum}>
                      {originalIndex + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <span style={styles.categoryName}>{category}</span>
                  </div>
                  <div style={{ width: 100, display: "flex", justifyContent: "center" }}>
                    <span style={styles.countBadge}>
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div style={styles.actionBtns}>
                    <button
                      style={styles.editBtn}
                      onClick={() => setEditCategoryModal(category)}
                    >
                      <FiEdit3 size={14} color="#64748b" />
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => confirmText(category)}
                    >
                      <FiTrash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyTitle}>
                {searchFilterValue ? "No categories found" : "No categories yet"}
              </span>
              <span style={styles.emptySubtitle}>
                {searchFilterValue
                  ? "Try a different search term"
                  : "Add your first category to organize your menu"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isVisible={!!addCategoryModal}
        onBackdropPress={() => setAddCategoryModal(false)}
      >
        <div style={styles.modalWrap}>
          <AddCategoryModal
            setaddCategoryModal={setAddCategoryModal}
            index={catalog.categories.length}
          />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isVisible={!!editCategoryModal}
        onBackdropPress={() => setEditCategoryModal(null)}
      >
        <div style={styles.modalWrap}>
          <AddCategoryModal
            setaddCategoryModal={(val) => {
              if (typeof val === "boolean" && !val) {
                setEditCategoryModal(null);
              } else {
                setAddCategoryModal(val);
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
    marginBottom: 24,
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
  },
  searchIcon: {
    position: "absolute",
    left: 12,
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
  },
  addBtn: {
    height: 40,
    backgroundColor: "#1470ef",
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
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  tableHeaderTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "14px 20px",
    transition: "background-color 0.15s",
  },
  positionNum: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  countBadge: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: 20,
    whiteSpace: "nowrap" as const,
  },
  actionBtns: {
    width: 100,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #fee2e2",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
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
  },
  modalWrap: {
    display: "flex",
    flex: 1,
    height: "100%",
    width: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    justifyContent: "center",
    alignItems: "center",
  },
};

export default CategoryList;
