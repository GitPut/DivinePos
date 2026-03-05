import React, { useEffect } from "react";
import { FiChevronLeft, FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
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

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <div style={styles.topRowContainer}>
          <div style={styles.backIconContainer}>
            <button
              onClick={() => {
                fadeOut(false);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <FiChevronLeft style={styles.backIcon} />
            </button>
          </div>
          <span style={styles.pendingOrdersLabel}>Pending Orders</span>
          <button
            onClick={() => setongoingOrderListModal(false)}
            style={{ ...styles.closeIconContainer, background: "none", border: "none", cursor: "pointer" }}
          >
            <IoClose style={styles.closeIcon} />
          </button>
        </div>
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
          <div style={{ overflow: "auto", padding: 10, height: "100%" }}>
            <span style={styles.cartDetailsOrderLabel}>Order:</span>
            <button
              disabled={!!element?.online}
              onClick={() => {
                if (storeDetails.settingsPassword?.length > 0) {
                  updatePosState({
                    authPasswordModal: true,
                    pendingAuthAction: `updateOrder${element?.id}`,
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
              style={{ marginLeft: 370, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <FiEdit
                style={{
                  ...styles.editIcon,
                  ...(!element?.online ? { color: "black" } : { color: "grey" }),
                }}
              />
            </button>
            <span style={styles.cartDetails}>{cartString}</span>
          </div>
        </div>
        <div style={styles.bottomBtnRow}>
          <button
            style={styles.cancelBtn}
            onClick={() => {
              if (storeDetails.settingsPassword?.length > 0) {
                updatePosState({
                  authPasswordModal: true,
                  pendingAuthAction: `cancelOrder${element?.id}`,
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
            <span style={styles.cancelOrder}>Cancel Order</span>
          </button>
          <button
            style={styles.completeBtn}
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
            <span style={styles.completeOrder}>Complete Order</span>
          </button>
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
  topRowContainer: {
    width: 496,
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    display: "flex",
  },
  backIconContainer: {
    width: 50,
    height: 80,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
  },
  backIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 50,
  },
  pendingOrdersLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    height: 47,
    display: "inline-block",
  },
  closeIconContainer: {
    width: 58,
    height: 74,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    display: "flex",
  },
  closeIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
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
    height: 300,
  },
  cartDetailsOrderLabel: {
    color: "#121212",
    fontSize: 15,
  },
  editIcon: {
    fontSize: 30,
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
  bottomBtnRow: {
    width: 277,
    height: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  cancelBtn: {
    width: 128,
    height: 42,
    backgroundColor: "#ff0000",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  cancelOrder: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 15,
  },
  completeBtn: {
    width: 128,
    height: 42,
    backgroundColor: "#03c551",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  completeOrder: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 15,
  },
};

export default PendingOrderDetails;
