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
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column",
    paddingTop: 16,
    paddingBottom: 8,
  },
  lblTxt: {
    fontWeight: "600",
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
    display: "inline-block",
  },
  scrollArea: {
    alignSelf: "stretch",
  },
  scrollArea_contentContainerStyle: {
    width: "100%",
    paddingBottom: 5,
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  activeCategoryBtn: {
    width: 90,
    height: 80,
    flexShrink: 0,
  },
  categoryBtn: {
    width: 90,
    height: 80,
    flexShrink: 0,
  },
};
