import React, { useMemo } from "react";
import ItemContainer from "../Cart/ItemContainer";
import useWindowSize from "shared/hooks/useWindowSize";
import { UserStoreStateProps } from "types";

interface ProductsSectionProps {
  catalog: UserStoreStateProps;
  searchQuery?: string;
  section?: string;
}

const ProductsSection = ({ catalog, searchQuery = "", section = "__all__" }: ProductsSectionProps) => {
  const { width } = useWindowSize();

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return catalog.products.filter((product) => {
      const matchesCategory = section === "__all__" || product.category === section;
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [catalog.products, section, searchQuery]);

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
