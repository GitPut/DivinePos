import React, { useMemo, useState } from "react";
import ItemContainer from "../Cart/ItemContainer";
import useWindowSize from "shared/hooks/useWindowSize";
import { UserStoreStateProps } from "types";
import { isProductAvailableNow } from "utils/productAvailability";
import useInterval from "shared/hooks/useInterval";

interface ProductsSectionProps {
  catalog: UserStoreStateProps;
  searchQuery?: string;
  section?: string;
}

const ProductsSection = ({ catalog, searchQuery = "", section = "__all__" }: ProductsSectionProps) => {
  const { width } = useWindowSize();
  const [tick, setTick] = useState(0);
  // Re-check availability every 60s so time-restricted products appear/disappear
  useInterval(() => setTick((t) => t + 1), 60000);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = catalog.products.filter((product) => {
      const matchesCategory = section === "__all__" || product.category === section;
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      const matchesTime = isProductAvailableNow(product);
      return matchesCategory && matchesSearch && matchesTime;
    });
    // In "All" view, sort by category order first, then rank within category
    if (section === "__all__" && !query) {
      const categories = catalog.categories;
      return [...filtered].sort((a, b) => {
        const catA = categories.indexOf(a.category ?? "");
        const catB = categories.indexOf(b.category ?? "");
        const orderA = catA === -1 ? categories.length : catA;
        const orderB = catB === -1 ? categories.length : catB;
        if (orderA !== orderB) return orderA - orderB;
        return (parseFloat(a.rank ?? "999") - parseFloat(b.rank ?? "999"));
      });
    }
    return filtered;
  }, [catalog.products, catalog.categories, section, searchQuery, tick]);

  const styles = {
    scrollAreaProducts: {
      width: "95%",
      flex: 1,
      minHeight: 0,
      marginLeft: "auto",
      marginRight: "auto",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns:
        width > 1250
          ? "repeat(auto-fill, minmax(190px, 1fr))"
          : "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "12px",
      paddingBottom: 20,
      paddingTop: 4,
    },
  };

  return (
    <div style={styles.scrollAreaProducts}>
      <div style={{ overflowY: "auto", height: "100%" }}>
        <div style={styles.gridContainer}>
          {filteredProducts.map((product, index) => (
            <ItemContainer product={product} key={index} width={width} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
