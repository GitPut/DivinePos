import React from "react";
import { storeDetailsState } from "store/appState";
import { posState } from "store/posState";
import { TransListStateItem } from "types";
import { parseDate } from "utils/dateFormatting";

interface KitchenOrderDetailsProps {
  element: TransListStateItem;
  index: number;
  style: React.CSSProperties;
  date: Date | null;
  cartString: string;
}

function KitchenOrderDetails({
  element,
  cartString,
  date,
}: KitchenOrderDetailsProps) {
  const parsedDate = parseDate(date as Date);
  storeDetailsState.use();
  posState.use();

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <div style={styles.orderDetailsContainer}>
          <div style={styles.orderNameRow}>
            <span style={styles.orderNameLabel}>Order Name:</span>
            <span style={styles.orderNameValue}>
              {element?.customer
                ? element.customer?.name?.toUpperCase()
                : "N/A"}
            </span>
          </div>
          <div style={styles.orderNumberRow}>
            <span style={styles.orderNumberLabel}>Order Number:</span>
            <span style={styles.orderNumberValue}>
              {element?.transNum?.toUpperCase()}
            </span>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.orderTypeWithDateRow}>
            {element?.online && (
              <span style={{ ...styles.orderType, color: "#01C550" }}>
                Online Order{"\n"}
                {element.method === "pickupOrder" && "Pickup"}
                {element.method === "deliveryOrder" && "Delivery"}
              </span>
            )}
            {!element?.online && (
              <>
                {(element?.customer?.name?.length ?? 0) > 0 ? (
                  <span style={{ ...styles.orderType, color: "#FF0F00" }}>
                    Phone Order{"\n"}
                    {element?.method === "pickupOrder" && "Pickup"}
                    {element?.method === "deliveryOrder" && "Delivery"}
                  </span>
                ) : (
                  <span style={styles.orderType}>
                    POS Order{"\n"}
                    {element?.method === "pickupOrder" && "Pickup"}
                    {element?.method === "deliveryOrder" && "Delivery"}
                  </span>
                )}
              </>
            )}
            <span style={styles.orderDate}>
              {parsedDate?.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div style={styles.cartDetailsContainer}>
          <div
            style={{
              overflow: "auto",
              padding: 10,
              height: "100%",
            }}
          >
            <span style={styles.cartDetailsOrderLabel}>Order:</span>
            <span style={styles.cartDetails}>{cartString}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    width: 540,
    height: 609,
    backgroundColor: "rgba(255,255,255,1)",
    marginRight: 10,
    borderWidth: 1,
    borderStyle: "solid" as const,
    borderColor: "black",
    display: "flex",
    flexDirection: "column",
  },
  innerContainer: {
    width: 496,
    height: 550,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
  },
  orderDetailsContainer: {
    width: 400,
    height: 102,
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  orderNameRow: {
    width: "100%",
    height: 19,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
  },
  orderNameLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
    marginRight: 10,
  },
  orderNameValue: {
    color: "#121212",
    fontSize: 15,
  },
  orderNumberRow: {
    width: "100%",
    height: 19,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
  },
  orderNumberLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
    marginRight: 10,
  },
  orderNumberValue: {
    color: "#121212",
    fontSize: 15,
    width: 206,
    height: 18,
    display: "inline-block",
  },
  divider: {
    width: 399,
    height: 1,
    backgroundColor: "rgba(0,0,0,1)",
  },
  orderTypeWithDateRow: {
    width: 400,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  orderType: {
    fontWeight: "700",
    color: "#0029ff",
    fontSize: 15,
    whiteSpace: "pre-line" as const,
  },
  orderDate: {
    color: "#121212",
  },
  cartDetailsContainer: {
    width: 420,
    height: 400,
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: "solid" as const,
    borderColor: "black",
  },
  cartDetailsOrderLabel: {
    color: "#121212",
    fontSize: 15,
  },
  cartDetails: {
    color: "#121212",
    fontSize: 15,
    width: 394,
    height: 169,
    marginLeft: 6,
    whiteSpace: "pre-line" as const,
    display: "block",
  },
};

export default KitchenOrderDetails;
