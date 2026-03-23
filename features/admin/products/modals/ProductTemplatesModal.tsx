import React, { useMemo, useState } from "react";
import { FiX, FiSearch, FiLayers } from "react-icons/fi";
import productTemplates from "../components/productTemplates";
import { ProductProp } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

interface ProductTemplatesModalProps {
  setproductTemplatesModalVisible: (val: boolean) => void;
  setexistingProduct: (val: ProductProp) => void;
  setisProductTemplate: (val: boolean) => void;
}

function ProductTemplatesModal({
  setproductTemplatesModalVisible,
  setexistingProduct,
  setisProductTemplate,
}: ProductTemplatesModalProps) {
  const { width, height } = useWindowSize();
  const catalog = productTemplates;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const close = () => {
    setproductTemplatesModalVisible(false);
    setisProductTemplate(false);
  };

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    return catalog.products.filter((product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [catalog.products, selectedCategory, search]);

  const handleSelect = (product: any) => {
    const newProduct: ProductProp = {
      ...product,
      isTemplate: true,
      id: Math.random().toString(36).substr(2, 9),
      name: product.name,
      price: product.price,
      options: product.options ?? [],
      description: product.description,
    };
    setexistingProduct(newProduct);
    setisProductTemplate(true);
    setproductTemplatesModalVisible(false);
  };

  return (
    <div style={styles.outerWrap}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles.panel,
          height: Math.min(height - 60, 700),
          width: Math.min(width * 0.7, 860),
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconWrap}>
              <FiLayers size={18} color="#1D294E" />
            </div>
            <div>
              <span style={styles.title}>Product Templates</span>
              <span style={styles.subtitle}>Start with a pre-built product and customize it</span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={close}>
            <FiX size={18} color="#64748b" />
          </button>
        </div>

        {/* Search + Category Filter */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrap}>
            <FiSearch size={15} color="#94a3b8" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={styles.categoryRow}>
            <button
              style={{
                ...styles.categoryPill,
                ...(selectedCategory === null ? styles.categoryPillActive : {}),
              }}
              onClick={() => setSelectedCategory(null)}
            >
              <span style={{
                ...styles.categoryPillTxt,
                ...(selectedCategory === null ? styles.categoryPillTxtActive : {}),
              }}>All</span>
            </button>
            {catalog.categories.map((category) => (
              <button
                key={category}
                style={{
                  ...styles.categoryPill,
                  ...(selectedCategory === category ? styles.categoryPillActive : {}),
                }}
                onClick={() => setSelectedCategory((prev) => prev === category ? null : category)}
              >
                <span style={{
                  ...styles.categoryPillTxt,
                  ...(selectedCategory === category ? styles.categoryPillTxtActive : {}),
                }}>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div style={styles.scrollArea}>
          {filteredProducts.length > 0 ? (
            <div style={styles.grid}>
              {filteredProducts.map((product, index) => (
                <button
                  key={index}
                  style={styles.templateCard}
                  onClick={() => handleSelect(product)}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.cardName}>{product.name}</span>
                    <span style={styles.cardPrice}>${product.price}</span>
                  </div>
                  {product.description && (
                    <span style={styles.cardDesc}>{product.description}</span>
                  )}
                  <div style={styles.cardMeta}>
                    {product.category && (
                      <span style={styles.cardCategory}>{product.category}</span>
                    )}
                    {product.options && product.options.length > 0 && (
                      <span style={styles.cardOptions}>
                        {product.options.length} option{product.options.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <span style={styles.useBtn}>Use Template</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyTitle}>No templates found</span>
              <span style={styles.emptySubtitle}>Try a different search or category</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  outerWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 1,
    display: "block",
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
  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  searchWrap: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 38,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingLeft: 12,
    paddingRight: 12,
    margin: "0 24px",
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    height: 36,
    flex: 1,
    border: "none",
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    backgroundColor: "transparent",
  },
  categoryRow: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    overflowX: "auto" as const,
    flexShrink: 0,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 2,
  },
  categoryPill: {
    padding: "5px 12px",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
  },
  categoryPillActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  categoryPillTxt: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  categoryPillTxtActive: {
    color: "#fff",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    padding: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
  },
  templateCard: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 0.15s",
  },
  cardTop: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    flexShrink: 0,
  },
  cardDesc: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  },
  cardMeta: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 2,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 4,
  },
  cardOptions: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1D294E",
    backgroundColor: "#eff6ff",
    padding: "2px 8px",
    borderRadius: 4,
  },
  useBtn: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D294E",
    marginTop: 4,
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
};

export default ProductTemplatesModal;
