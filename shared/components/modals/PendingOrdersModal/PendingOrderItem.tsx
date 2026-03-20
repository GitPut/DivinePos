import React, { useEffect } from "react";
import { FiEye, FiCheck, FiTrash2 } from "react-icons/fi";
import { auth, db } from "services/firebase/config";
import { updateTransList } from "services/firebase/functions";
import { storeDetailsState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { CurrentOrderProp, TransListStateItem } from "types";
import { parseDate } from "utils/dateFormatting";

interface PendingOrderItemProps {
  element: TransListStateItem;
  index: number;
  date: Date | null;
  setcurrentOrder: (val: CurrentOrderProp) => void;
  cartString: string;
  fadeIn: () => void;
}

function PendingOrderItem({
  element,
  index,
  date,
  setcurrentOrder,
  cartString,
  fadeIn,
}: PendingOrderItemProps) {
  const storeDetails = storeDetailsState.use();
  const { managerAuthorizedStatus, pendingAuthAction } = posState.use();

  useEffect(() => {
    if (
      managerAuthorizedStatus &&
      pendingAuthAction === `cancelOrder${element.id}`
    ) {
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .doc(element.id)
        .delete();
      updatePosState({
        managerAuthorizedStatus: false,
        pendingAuthAction: "",
      });
    }
  }, [managerAuthorizedStatus, pendingAuthAction]);

  const getMethodColor = (): string => {
    if (element.method === "tableOrder") return "#8b5cf6";
    if (element.method === "deliveryOrder" || element.method === "delivery") return "#f59e0b";
    if (element.method === "pickupOrder" || element.method === "pickup") return "#1D294E";
    if (element.online) return "#06b6d4";
    return "#10b981";
  };

  const getMethodLabel = (): string => {
    if (element.method === "tableOrder") {
      const name = (element as any).tableName || (element as any).tableNumber || "";
      return name ? `Table ${name}` : "Table";
    }
    if (element.online) return "Online";
    if (element.method === "pickupOrder") return "Pickup";
    if (element.method === "deliveryOrder") return "Delivery";
    if (element.method === "inStoreOrder") return "In-Store";
    return "Order";
  };

  const methodColor = getMethodColor();
  const itemCount = element.cart?.reduce(
    (sum, item) => sum + parseFloat(item.quantity ?? "1"),
    0
  ) ?? 0;

  return (
    <div style={styles.container}>
      {/* Color accent */}
      <div style={{ ...styles.accent, backgroundColor: methodColor }} />

      {/* Main content */}
      <div style={styles.body}>
        <div style={styles.topRow}>
          <div style={styles.leftInfo}>
            <div style={{
              ...styles.methodBadge,
              backgroundColor: methodColor + "14",
              borderColor: methodColor + "30",
            }}>
              <span style={{ ...styles.methodText, color: methodColor }}>
                {getMethodLabel()}
              </span>
            </div>
            {element.transNum && (
              <span style={styles.orderNum}>#{element.transNum}</span>
            )}
          </div>
          <span style={styles.time}>
            {date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          </span>
        </div>

        <div style={styles.bottomRow}>
          <div style={styles.details}>
            <span style={styles.customerName}>
              {element.customer?.name || "Walk-in"}
            </span>
            <span style={styles.itemCount}>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={styles.actions}>
            <button
              style={styles.viewBtn}
              onClick={() => {
                fadeIn();
                setcurrentOrder({
                  element: element,
                  index: index.toString(),
                  type: "view",
                  cartString: cartString,
                  date: date,
                });
              }}
              title="View order"
            >
              <FiEye size={14} color="#64748b" />
            </button>
            <button
              style={styles.completeBtn}
              onClick={() => {
                if (element.online) {
                  db.collection("users")
                    .doc(auth.currentUser?.uid)
                    .collection("pendingOrders")
                    .doc(element.id)
                    .delete();
                  updateTransList(element);
                } else {
                  if (element.method === "pickupOrder") {
                    setcurrentOrder({
                      element: element,
                      index: index.toString(),
                      type: "pay",
                      cartString: cartString,
                      date: date,
                    });
                    fadeIn();
                  } else {
                    db.collection("users")
                      .doc(auth.currentUser?.uid)
                      .collection("pendingOrders")
                      .doc(element.id)
                      .delete();
                    updateTransList(element);
                  }
                }
              }}
              title="Complete order"
            >
              <FiCheck size={14} color="#fff" />
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                if (storeDetails.settingsPassword?.length > 0) {
                  updatePosState({
                    authPasswordModal: true,
                    pendingAuthAction: `cancelOrder${element.id}`,
                  });
                } else {
                  db.collection("users")
                    .doc(auth.currentUser?.uid)
                    .collection("pendingOrders")
                    .doc(element.id)
                    .delete();
                }
              }}
              title="Cancel order"
            >
              <FiTrash2 size={14} color="#ef4444" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  accent: {
    width: 4,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftInfo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  methodBadge: {
    padding: "2px 10px",
    borderRadius: 5,
    border: "1px solid",
  },
  methodText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  orderNum: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  details: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  itemCount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  completeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #fee2e2",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
};

export default PendingOrderItem;
