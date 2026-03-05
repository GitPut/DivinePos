import React from "react";
import { MdStore, MdDirectionsCar, MdClear } from "react-icons/md";
import { CustomersOrdersProp } from "types";

interface OrderItemProps {
  prevOrder: CustomersOrdersProp;
  prevOrderIndex: number;
  setOrderPickUp: () => void;
  setOrderDelivery: () => void;
  isDeliverable: boolean;
  removeCustomerOrder: () => void;
}

const OrderItem = ({
  prevOrder,
  prevOrderIndex,
  setOrderPickUp,
  setOrderDelivery,
  isDeliverable,
  removeCustomerOrder,
}: OrderItemProps) => {
  return (
    <div style={styles.orderContainer}>
      <div style={styles.topOrderRow}>
        <span style={styles.orderNumber}>Order #{prevOrderIndex + 1}</span>
        <div style={styles.deliveryOrPickupRow}>
          <button style={styles.pickupBtn} onClick={setOrderPickUp}>
            <MdStore style={styles.pickupIcon} />
          </button>
          {isDeliverable && (
            <button style={styles.deliveryBtn} onClick={setOrderDelivery}>
              <MdDirectionsCar style={styles.deliveryIcon} />
            </button>
          )}
          <button style={styles.deleteBtn} onClick={removeCustomerOrder}>
            <MdClear style={styles.deleteIcon} />
          </button>
        </div>
      </div>
      {prevOrder.cart?.map((cartItem, index) => (
        <div key={index} style={styles.itemContainer}>
          <span style={styles.itemName}>{cartItem.name}</span>
          <span style={styles.itemPrice}>
            ${parseFloat(cartItem.price).toFixed(2)}
          </span>
          <span style={styles.itemQty}>
            Qty: {cartItem.quantity ? cartItem.quantity : 1}
          </span>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  orderContainer: {
    width: 439,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomStyle: "solid" as const,
    borderBottomColor: "black",
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
  },
  topOrderRow: {
    width: 439,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    display: "flex",
  },
  orderNumber: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  deliveryOrPickupRow: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  pickupBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  pickupIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  deliveryBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  deliveryIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  deleteBtn: {
    width: 35,
    height: 35,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  deleteIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 30,
  },
  itemContainer: {
    width: 439,
    height: 53,
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    display: "flex",
  },
  itemName: {
    color: "#121212",
    fontSize: 15,
    flex: 4,
    marginLeft: 15,
    display: "block",
  },
  itemPrice: {
    color: "#03c551",
    fontSize: 15,
    flex: 1,
    display: "block",
  },
  itemQty: {
    color: "#121212",
    fontSize: 15,
    flex: 1,
    display: "block",
  },
};

export default OrderItem;
