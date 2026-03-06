import React, { useEffect } from "react";
import ItemContainer from "../Cart/ItemContainer";
import useWindowSize from "shared/hooks/useWindowSize";
import { UserStoreStateProps } from "types";

interface ProductsSectionProps {
  catalog: UserStoreStateProps;
  setallLoaded?: (val: boolean) => void;
}

const ProductsSection = ({ catalog, setallLoaded }: ProductsSectionProps) => {
  const { width } = useWindowSize();

  useEffect(() => {
    if (setallLoaded) setallLoaded(true);
  }, [catalog]);

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
          {catalog.products.map((product, index) => {
            return (
              <ItemContainer product={product} key={index} width={width} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
