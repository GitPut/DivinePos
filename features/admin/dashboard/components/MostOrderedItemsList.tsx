import ProductImage from "shared/components/ui/ProductImage";
import React from "react";

function MostOrderedItemsList({
  imageUrl,
  itemName,
  itemNumOfOrders,
}: {
  imageUrl: string;
  itemName: string;
  itemNumOfOrders: string;
}) {
  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <div>
          <ProductImage
            source={imageUrl ?? "https://via.placeholder.com/70"}
            style={styles.itemImg}
            key={itemName}
          />
        </div>
        <span style={styles.itemName}>{itemName}</span>
      </div>
      <span style={styles.itemNumOfOrders}>{itemNumOfOrders}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    width: 326,
  },
  leftSide: {
    width: 256,
    height: 70,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  itemImg: {
    height: 70,
    width: 70,
    marginRight: 7,
  },
  itemName: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  itemNumOfOrders: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
};

export default MostOrderedItemsList;
