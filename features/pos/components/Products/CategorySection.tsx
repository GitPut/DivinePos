import React from "react";
import CategoryButton from "../Cart/CategoryButton";
import { updatePosState } from "store/posState";
import { UserStoreStateProps } from "types";

interface CategorySectionProps {
  catalog: UserStoreStateProps;
  section: string;
}

const CategorySection = ({ catalog, section }: CategorySectionProps) => {
  return (
    <div style={styles.categoryContainer}>
      <span style={styles.lblTxt}>Menu Category</span>
      <div style={styles.scrollArea}>
        <div
          style={{ overflow: "auto", ...styles.scrollArea_contentContainerStyle }}
        >
          {catalog.categories?.map((category) => {
            return (
              <CategoryButton
                key={category}
                category={category}
                onPress={() => {
                  updatePosState({ section: category });
                }}
                isSelected={section === category}
                style={styles.activeCategoryBtn}
                imageUrl={
                  catalog.products[
                    catalog.products.findIndex(
                      (x) => x.category === category && x.hasImage
                    )
                  ]?.imageUrl ?? null
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;

const styles: Record<string, React.CSSProperties> = {
  categoryContainer: {
    width: "93%",
    height: 178,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  lblTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 19,
    marginBottom: 10,
    display: "inline-block",
  },
  scrollArea: {
    alignSelf: "stretch",
  },
  scrollArea_contentContainerStyle: {
    width: "93%",
    height: 156,
    paddingBottom: 5,
    display: "flex",
    flexDirection: "row",
  },
  activeCategoryBtn: {
    width: 125,
    marginRight: 15,
    height: 150,
  },
  categoryBtn: {
    width: 125,
    marginRight: 18,
    height: 150,
  },
};
