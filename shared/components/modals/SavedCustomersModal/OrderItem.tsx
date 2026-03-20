import React from "react";
import { FiShoppingBag, FiTruck, FiTrash2 } from "react-icons/fi";
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
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.orderNum}>Order #{prevOrderIndex + 1}</span>
        <div style={styles.actionBtns}>
          <button style={styles.pickupBtn} onClick={setOrderPickUp} title="Reorder as Pickup">
            <FiShoppingBag size={14} color="#fff" />
            <span style={styles.btnTxt}>Pickup</span>
          </button>
          {isDeliverable && (
            <button style={styles.deliveryBtn} onClick={setOrderDelivery} title="Reorder as Delivery">
              <FiTruck size={14} color="#fff" />
              <span style={styles.btnTxt}>Deliver</span>
            </button>
          )}
          <button style={styles.deleteBtn} onClick={removeCustomerOrder} title="Remove order">
            <FiTrash2 size={14} color="#ef4444" />
          </button>
        </div>
      </div>
      {prevOrder.cart?.map((cartItem, index) => (
        <div key={index} style={styles.itemRow}>
          <span style={styles.itemName}>{cartItem.name}</span>
          <span style={styles.itemQty}>x{cartItem.quantity ? cartItem.quantity : 1}</span>
          <span style={styles.itemPrice}>${parseFloat(cartItem.price).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 12,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderNum: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 14,
  },
  actionBtns: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pickupBtn: {
    height: 30,
    backgroundColor: "#1470ef",
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    border: "none",
    cursor: "pointer",
  },
  deliveryBtn: {
    height: 30,
    backgroundColor: "#f59e0b",
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    border: "none",
    cursor: "pointer",
  },
  btnTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  deleteBtn: {
    width: 30,
    height: 30,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  itemName: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  itemQty: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
    width: 30,
    textAlign: "center" as const,
  },
  itemPrice: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
    width: 60,
    textAlign: "right" as const,
  },
};

export default OrderItem;
