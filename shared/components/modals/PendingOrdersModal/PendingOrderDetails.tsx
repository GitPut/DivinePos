import React, { useEffect } from "react";
import { FiChevronLeft, FiEdit3, FiX } from "react-icons/fi";
import { auth, db } from "services/firebase/config";
import { updateTransList } from "services/firebase/functions";
import { storeDetailsState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { CurrentOrderProp, OngoingListStateProp } from "types";
import { parseDate } from "utils/dateFormatting";

interface PendingOrderDetailsProps {
  updateOrderHandler: (val: OngoingListStateProp) => void;
  currentOrder: CurrentOrderProp;
  fadeOut: (val: boolean) => void;
  setcurrentOrder: (val: CurrentOrderProp) => void;
  setongoingOrderListModal: (val: boolean) => void;
}

function PendingOrderDetails({
  currentOrder,
  updateOrderHandler,
  fadeOut,
  setcurrentOrder,
  setongoingOrderListModal,
}: PendingOrderDetailsProps) {
  const { element, index, cartString, date } = currentOrder;
  const parsedDate = parseDate(date as Date);
  const storeDetails = storeDetailsState.use();
  const { managerAuthorizedStatus, pendingAuthAction } = posState.use();

  useEffect(() => {
    if (
      managerAuthorizedStatus &&
      pendingAuthAction === `cancelOrder${element?.id}`
    ) {
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .doc(element?.id)
        .delete();
      updatePosState({
        managerAuthorizedStatus: false,
        pendingAuthAction: "",
      });
      fadeOut(false);
    } else if (
      managerAuthorizedStatus &&
      pendingAuthAction === `updateOrder${element?.id}` &&
      element?.id
    ) {
      updateOrderHandler({
        ...element,
        index: index,
        isInStoreOrder: element?.isInStoreOrder ?? false,
        id: element?.id ?? "",
        cart: element?.cart ?? [],
        cartNote: element?.cartNote ?? "",
        customer: element?.customer ?? null,
        method: element?.method ?? "",
        online: element?.online ?? false,
        transNum: element?.transNum ?? "",
        total: element?.total ?? "",
      });
      fadeOut(false);
    }
  }, [managerAuthorizedStatus, pendingAuthAction]);

  const getMethodColor = (): string => {
    if (element?.method === "tableOrder") return "#8b5cf6";
    if (element?.method === "deliveryOrder" || element?.method === "delivery") return "#f59e0b";
    if (element?.method === "pickupOrder" || element?.method === "pickup") return "#1470ef";
    if (element?.online) return "#06b6d4";
    return "#10b981";
  };

  const getMethodLabel = (): string => {
    if (element?.method === "tableOrder") {
      const name = (element as any)?.tableName || "";
      return name ? `Table Order - ${name}` : "Table Order";
    }
    if (element?.online) {
      if (element.method === "pickupOrder") return "Online Pickup";
      if (element.method === "deliveryOrder") return "Online Delivery";
      return "Online Order";
    }
    if (element?.method === "pickupOrder") return "Phone Pickup";
    if (element?.method === "deliveryOrder") return "Phone Delivery";
    if (element?.method === "inStoreOrder") return "POS Order";
    return "Order";
  };

  const methodColor = getMethodColor();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => fadeOut(false)}>
          <FiChevronLeft size={18} color="#64748b" />
        </button>
        <span style={styles.title}>Order Details</span>
        <button style={styles.closeBtn} onClick={() => setongoingOrderListModal(false)}>
          <FiX size={16} color="#64748b" />
        </button>
      </div>

      {/* Order Info */}
      <div style={styles.infoSection}>
        <div style={styles.infoRow}>
          <div style={{
            ...styles.methodBadge,
            backgroundColor: methodColor + "14",
            borderColor: methodColor + "30",
          }}>
            <span style={{ ...styles.methodText, color: methodColor }}>
              {getMethodLabel()}
            </span>
          </div>
          <span style={styles.time}>
            {parsedDate?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Customer</span>
            <span style={styles.detailValue}>
              {element?.customer?.name || "Walk-in"}
            </span>
          </div>
          {element?.transNum && (
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Order #</span>
              <span style={styles.detailValue}>{element.transNum}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div style={styles.cartSection}>
        <div style={styles.cartHeader}>
          <span style={styles.cartTitle}>Items</span>
          {!element?.online && (
            <button
              style={styles.editOrderBtn}
              onClick={() => {
                if (storeDetails.settingsPassword?.length > 0) {
                  updatePosState({
                    authPasswordModal: true,
                    pendingAuthAction: `updateOrder${element?.id}`,
                    pendingAuthPermission: "manageOrders",
                  });
                } else if (element && element.id) {
                  updateOrderHandler({
                    ...element,
                    index: index,
                    isInStoreOrder: element?.isInStoreOrder ?? false,
                    id: element.id,
                    cart: element.cart ?? [],
                    cartNote: element.cartNote ?? "",
                    customer: element.customer ?? null,
                    method: element.method ?? "",
                    online: element.online ?? false,
                    transNum: element.transNum ?? "",
                    total: element.total ?? "",
                  });
                  fadeOut(false);
                }
              }}
            >
              <FiEdit3 size={13} color="#1470ef" />
              <span style={styles.editOrderTxt}>Edit Order</span>
            </button>
          )}
        </div>
        <div style={styles.cartScroll}>
          <span style={styles.cartDetails}>{cartString}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.footer}>
        <button
          style={styles.cancelOrderBtn}
          onClick={() => {
            if (storeDetails.settingsPassword?.length > 0) {
              updatePosState({
                authPasswordModal: true,
                pendingAuthAction: `cancelOrder${element?.id}`,
                pendingAuthPermission: "manageOrders",
              });
            } else {
              db.collection("users")
                .doc(auth.currentUser?.uid)
                .collection("pendingOrders")
                .doc(element?.id)
                .delete();
              fadeOut(false);
            }
          }}
        >
          <span style={styles.cancelOrderTxt}>Cancel Order</span>
        </button>
        <button
          style={styles.completeOrderBtn}
          onClick={() => {
            if (element?.online) {
              db.collection("users")
                .doc(auth.currentUser?.uid)
                .collection("pendingOrders")
                .doc(element.id)
                .delete();
              updateTransList(element);
              fadeOut(false);
            } else {
              if (element?.method === "pickupOrder") {
                setcurrentOrder({
                  element: element,
                  index: index,
                  type: "pay",
                  cartString: cartString,
                  date: date,
                });
              } else {
                db.collection("users")
                  .doc(auth.currentUser?.uid)
                  .collection("pendingOrders")
                  .doc(element?.id)
                  .delete();
                updateTransList({
                  ...element,
                  date: element?.date,
                });
                fadeOut(false);
              }
            }
          }}
        >
          <span style={styles.completeOrderTxt}>Complete Order</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  infoSection: {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flexShrink: 0,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodBadge: {
    padding: "4px 12px",
    borderRadius: 6,
    border: "1px solid",
  },
  methodText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  cartSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  cartHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    flexShrink: 0,
  },
  cartTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  editOrderBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  editOrderTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1470ef",
  },
  cartScroll: {
    flex: 1,
    overflow: "auto",
    padding: "0 20px 16px",
  },
  cartDetails: {
    fontSize: 13,
    color: "#334155",
    lineHeight: "1.7",
    whiteSpace: "pre-line" as const,
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  cancelOrderBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  cancelOrderTxt: {
    fontWeight: "600",
    color: "#ef4444",
    fontSize: 14,
  },
  completeOrderBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#10b981",
    border: "none",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  completeOrderTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 14,
  },
};

export default PendingOrderDetails;
