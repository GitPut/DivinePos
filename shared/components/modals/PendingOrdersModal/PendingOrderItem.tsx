import React, { useEffect } from "react";
import { FiEdit } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import { auth, db } from "services/firebase/config";
import { updateTransList } from "services/firebase/functions";
import { storeDetailsState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { CurrentOrderProp, TransListStateItem } from "types";

interface PendingOrderItemProps {
  element: TransListStateItem;
  index: number;
  style: React.CSSProperties;
  date: Date | null;
  setcurrentOrder: (val: CurrentOrderProp) => void;
  cartString: string;
  fadeIn: () => void;
}

function PendingOrderItem({
  element,
  index,
  style,
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

  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.customerDetailsContainer}>
        <div style={styles.orderNameContainer}>
          <span style={styles.orderNameLbl}>Order Name:</span>
          <span style={styles.orderNameValue}>
            {element.customer?.name?.length ?? 0 > 0
              ? element.customer?.name?.toUpperCase()
              : "N/A"}
          </span>
        </div>
        <div style={styles.orderNumberContainer}>
          <span style={styles.orderNumberLabel}>Order Number:</span>
          <span style={styles.orderNumberValue}>
            {element.transNum?.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={styles.divider}></div>
      <div style={styles.orderInfoContainer}>
        <div style={styles.orderInfoTextGroup}>
          {element.deliveryPlatform === "doordash" && (
            <span style={{ ...styles.orderTypeLabel, color: "#FF3008" }}>
              DoorDash
            </span>
          )}
          {element.deliveryPlatform === "ubereats" && (
            <span style={{ ...styles.orderTypeLabel, color: "#06C167" }}>
              Uber Eats
            </span>
          )}
          {element.deliveryPlatform === "skipthedishes" && (
            <span style={{ ...styles.orderTypeLabel, color: "#EC6730" }}>
              Skip The Dishes
            </span>
          )}
          {element.deliveryPlatform === "grubhub" && (
            <span style={{ ...styles.orderTypeLabel, color: "#F63440" }}>
              Grubhub
            </span>
          )}
          {!element.deliveryPlatform && element.online && (
            <span style={{ ...styles.orderTypeLabel, color: "#01C550" }}>
              Online Order
            </span>
          )}
          {!element.deliveryPlatform && !element.online && element.method !== "inStoreOrder" && element.method !== "tableOrder" && (
            <span style={{ ...styles.orderTypeLabel, color: "#FF0F00" }}>
              Phone Order
            </span>
          )}
          {element.method === "tableOrder" && (
            <span style={{ ...styles.orderTypeLabel, color: "#6366f1" }}>
              Table Order
              {(element as any).tableName ? ` - ${(element as any).tableName}` : ""}
            </span>
          )}
          {!element.deliveryPlatform && element.method === "inStoreOrder" && (
            <span style={styles.orderTypeLabel}>POS Order</span>
          )}
          <span style={styles.orderTime}>
            {element.method === "pickupOrder" && "Pickup"}
            {element.method === "deliveryOrder" && "Delivery"}
          </span>
          <span style={styles.orderDate}>{date?.toLocaleTimeString()}</span>
        </div>
      </div>
      <div style={styles.orderOptionContainer}>
        <div style={styles.optionIconsRow}>
          <button
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
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <FiEdit style={styles.editIcon} />
          </button>
          <button
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
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <MdCancel style={styles.cancelIcon} />
          </button>
          <button
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
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <FiCheck style={styles.finishIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.2)",
    display: "flex",
  },
  customerDetailsContainer: {
    width: 158,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
  },
  orderNameContainer: {
    width: "100%",
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 10,
    display: "flex",
  },
  orderNameLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
    marginRight: 5,
  },
  orderNameValue: {
    color: "#121212",
  },
  orderNumberContainer: {
    width: "100%",
    height: 36,
    justifyContent: "flex-start",
    paddingLeft: 10,
    display: "flex",
    flexDirection: "column",
  },
  orderNumberLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
  },
  orderNumberValue: {
    color: "#121212",
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 53,
    backgroundColor: "rgba(0,0,0,1)",
  },
  orderInfoContainer: {
    width: 113,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    display: "flex",
  },
  orderInfoTextGroup: {
    width: 96,
    height: 53,
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  orderTypeLabel: {
    fontWeight: "700",
    color: "#0529ff",
    fontSize: 13,
  },
  orderTime: {
    color: "#121212",
    fontSize: 13,
  },
  orderDate: {
    color: "#121212",
    fontSize: 13,
  },
  orderOptionContainer: {
    width: 143,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    display: "flex",
  },
  optionIconsRow: {
    width: 98,
    height: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  editIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 22,
  },
  cancelIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 24,
  },
  finishIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
};

export default PendingOrderItem;
