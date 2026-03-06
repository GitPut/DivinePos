import React from "react";
import { updatePosState } from "store/posState";
import { UserStoreStateProps } from "types";

interface CategorySectionProps {
  catalog: UserStoreStateProps;
  section: string;
}

const CategorySection = ({ catalog, section }: CategorySectionProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.tabsRow}>
        <button
          className="pos-category-pill"
          style={{
            ...styles.tab,
            ...(section === "__all__" ? styles.tabActive : styles.tabInactive),
          }}
          onClick={() => updatePosState({ section: "__all__" })}
        >
          All
        </button>
        {catalog.categories?.map((category) => (
          <button
            key={category}
            className="pos-category-pill"
            style={{
              ...styles.tab,
              ...(section === category ? styles.tabActive : styles.tabInactive),
            }}
            onClick={() => updatePosState({ section: category })}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "95%",
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    overflow: "auto",
    paddingBottom: 4,
  },
  tab: {
    padding: "8px 18px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  tabActive: {
    backgroundColor: "#1e293b",
    color: "#fff",
    border: "1px solid #1e293b",
  },
  tabInactive: {
    backgroundColor: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
};
