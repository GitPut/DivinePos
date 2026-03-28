import React from "react";
import { FiShoppingBag, FiTruck, FiTrash2, FiRefreshCw } from "react-icons/fi";
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
  const itemCount = prevOrder.cart?.reduce((sum, item) => sum + (parseInt(item.quantity ?? "1") || 1), 0) || 0;
  const orderTotal = prevOrder.cart?.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity ?? "1") || 1)), 0) || 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div style={styles.orderInfo}>
          <span style={styles.orderNum}>Order #{prevOrderIndex + 1}</span>
          <span style={styles.orderMeta}>
            {itemCount} item{itemCount !== 1 ? "s" : ""} · ${orderTotal.toFixed(2)}
          </span>
        </div>
        <div style={styles.actionBtns}>
          <button style={styles.reorderBtn} onClick={setOrderPickUp} title="Reorder as Pickup">
            <FiRefreshCw size={12} color="#1D294E" />
            <span style={styles.reorderTxt}>Pickup</span>
          </button>
          {isDeliverable && (
            <button style={styles.deliverBtn} onClick={setOrderDelivery} title="Reorder as Delivery">
              <FiTruck size={12} color="#d97706" />
              <span style={{ ...styles.reorderTxt, color: "#d97706" }}>Deliver</span>
            </button>
          )}
          <button style={styles.deleteBtn} onClick={removeCustomerOrder} title="Remove order">
            <FiTrash2 size={13} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div style={styles.itemsList}>
        {prevOrder.cart?.map((cartItem, index) => {
          const qty = parseInt(cartItem.quantity ?? "1") || 1;
          const price = parseFloat(cartItem.price);
          return (
            <div key={index} style={styles.itemRow}>
              <span style={styles.itemName}>{cartItem.name}</span>
              <span style={styles.itemQty}>x{qty}</span>
              <span style={styles.itemPrice}>${(price * qty).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 8,
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #f1f5f9",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  orderNum: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 13,
  },
  orderMeta: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  actionBtns: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  reorderBtn: {
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 8,
    paddingRight: 8,
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  reorderTxt: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D294E",
  },
  deliverBtn: {
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 8,
    paddingRight: 8,
    border: "1px solid #fef3c7",
    cursor: "pointer",
  },
  deleteBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#fff",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "4px 0",
    gap: 8,
  },
  itemName: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  itemQty: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    width: 28,
    textAlign: "center" as const,
  },
  itemPrice: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "600",
    width: 55,
    textAlign: "right" as const,
  },
};

export default OrderItem;
