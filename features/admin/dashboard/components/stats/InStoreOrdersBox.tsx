import React from "react";
import PeriodDropdown from "../PeriodDropdown";
import RevenueBox from "../RevenueBox";
import OrdersBox from "../OrdersBox";

const InStoreOrdersBox = ({
  details,
  period,
  setperiod,
}: {
  details: { orders: number; revenue: number };
  period: string;
  setperiod: (period: string) => void;
}) => {
  return (
    <div style={styles.pickupOrdersContainer}>
      <div style={styles.pickupOrdersInnerContainer}>
        <div style={styles.pickupOrdersHeaderRow}>
          <span style={styles.pickupOrders}>In-Store Orders</span>
          <div>
            <PeriodDropdown value={period} setValue={setperiod} />
          </div>
        </div>
        <div style={styles.pickupOrdersRevAndOrdersContainer}>
          <RevenueBox
            style={styles.revenueBox}
            revenueValue={details.revenue.toFixed(2)}
          />
          <OrdersBox
            style={styles.ordersBox}
            ordersValue={details.orders.toString()}
          />
        </div>
      </div>
    </div>
  );
};

export default InStoreOrdersBox;

const styles: Record<string, React.CSSProperties> = {
  pickupOrdersContainer: {
    width: 383,
    height: 158,
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    borderRadius: 10,
    border: "1px solid #ebebeb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  pickupOrdersInnerContainer: {
    width: 347,
    height: 126,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  pickupOrdersHeaderRow: {
    width: 347,
    height: 27,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pickupOrders: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  pickupOrdersRevAndOrdersContainer: {
    width: 347,
    height: 65,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueBox: {
    height: 65,
    width: 165,
  },
  ordersBox: {
    height: 65,
    width: 165,
  },
};
