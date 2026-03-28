import React from "react";
import PeriodDropdown from "../PeriodDropdown";
import MostOrderedItemsList from "../MostOrderedItemsList";

interface MostOrderedItemsObject {
  name: string;
  orders: number;
  imageUrl: string;
}

interface MostOrderedItemsBoxProps {
  style?: React.CSSProperties;
  period: string;
  setperiod: (period: string) => void;
  details: MostOrderedItemsObject[];
}

const MostOrderedItemsBox = ({
  style,
  period,
  setperiod,
  details,
}: MostOrderedItemsBoxProps) => {
  return (
    <div style={{ ...styles.mostOrderItemsContainer, ...style }}>
      <div style={styles.mostOrderedItemsInnerContainer}>
        <div style={styles.mostOrderedItemsHeaderRow}>
          <span style={styles.mostOrderedItems}>Most Ordered Items</span>
          <PeriodDropdown value={period} setValue={setperiod} />
        </div>
        <div style={styles.mostOrderedItemsChartHeader}>
          <span style={styles.itemsLbl}>Items</span>
          <span style={styles.ordersLbl}>Orders</span>
        </div>
        <div style={styles.topItemsContainer}>
          {details.map((item) => (
            <MostOrderedItemsList
              key={item.name}
              itemName={item.name}
              itemNumOfOrders={item.orders.toString()}
              imageUrl={item.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MostOrderedItemsBox;

const styles: Record<string, React.CSSProperties> = {
  mostOrderItemsContainer: {
    width: 383,
    height: 350,
    border: "1px solid rgba(232,232,232,1)",
    borderRadius: 10,
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  mostOrderedItemsInnerContainer: {
    width: 326,
    height: "90%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  mostOrderedItemsHeaderRow: {
    width: 326,
    height: 27,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mostOrderedItems: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  mostOrderedItemsChartHeader: {
    width: 326,
    height: 15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itemsLbl: {
    fontWeight: "700",
    color: "#9ea0a6",
    fontSize: 13,
  },
  ordersLbl: {
    fontWeight: "700",
    color: "#9ea0a6",
    fontSize: 13,
  },
  topItemsContainer: {
    width: 326,
    height: 240,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
  },
};
