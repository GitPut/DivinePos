import React, { useRef, useState } from "react";
import { FiX, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import PendingOrderItem from "./PendingOrderItem";
import PendingOrderDetails from "./PendingOrderDetails";
import FinishPaymentCash from "./FinishPaymentCash";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { setCartState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { CurrentOrderProp, OngoingListStateProp } from "types";
import { parseDate } from "utils/dateFormatting";
import KitchenViewOrders from "./KitchenView/KitchenViewOrders";
import useWindowSize from "shared/hooks/useWindowSize";

const PendingOrdersModal = () => {
  const { width, height } = useWindowSize();
  const [currentOrder, setcurrentOrder] = useState<CurrentOrderProp>({
    element: null,
    index: null,
    cart: [],
    date: null,
  });
  const opacityRef = useRef(0);
  const [opacity, setOpacity] = useState(0);
  const { ongoingListState, ongoingOrderListModal } = posState.use();
  const [maximizeScreen, setmaximizeScreen] = useState(false);

  const updateOrderHandler = (order: OngoingListStateProp) => {
    setCartState(order.cart);
    if (order.cartNote) {
      updatePosState({ cartNote: order.cartNote });
    }
    if (order.isInStoreOrder) {
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .doc(order.id)
        .delete();
      updatePosState({
        ongoingOrderListModal: false,
      });
    } else {
      updatePosState({
        name: order.customer?.name ? order.customer?.name : "",
      });
      updatePosState({
        phone: order.customer?.phone ? order.customer?.phone : "",
      });
      updatePosState({
        address: order.customer?.address ? order.customer?.address : null,
      });
      updatePosState({
        deliveryChecked: order.method === "deliveryOrder",
      });
      updatePosState({
        ongoingDelivery: true,
        updatingOrder: order,
        ongoingOrderListModal: false,
      });
    }
  };

  const fadeIn = () => {
    opacityRef.current = 1;
    setOpacity(1);
  };

  const fadeOut = (customFuncAfter: boolean) => {
    opacityRef.current = 0;
    setOpacity(0);
    if (!customFuncAfter) {
      setcurrentOrder({ element: null, index: null, cart: [], date: null });
    }
  };

  const close = () => updatePosState({ ongoingOrderListModal: false });

  return (
    <Modal
      isVisible={ongoingOrderListModal}
      onBackdropPress={close}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={
            maximizeScreen
              ? { ...styles.containerMax, width, height }
              : styles.container
          }
        >
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.title}>Pending Orders</span>
            <div style={styles.headerRight}>
              <span style={styles.orderCount}>
                {ongoingListState?.length ?? 0} order{(ongoingListState?.length ?? 0) !== 1 ? "s" : ""}
              </span>
              <button style={styles.iconBtn} onClick={() => setmaximizeScreen(!maximizeScreen)} title={maximizeScreen ? "Exit kitchen view" : "Kitchen view"}>
                {maximizeScreen ? <FiMinimize2 size={16} color="#64748b" /> : <FiMaximize2 size={16} color="#64748b" />}
              </button>
              <button style={styles.iconBtn} onClick={close}>
                <FiX size={16} color="#64748b" />
              </button>
            </div>
          </div>

          {/* Content */}
          {maximizeScreen ? (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <KitchenViewOrders />
            </div>
          ) : (
            <div style={styles.listScroll}>
              {ongoingListState?.length > 0 ? (
                ongoingListState.map((element, index) => {
                  let date = null;
                  const parsedDate = parseDate(element.date);
                  if (parsedDate !== null) date = parsedDate;

                  let cartString = "";
                  element.cart?.map((cartItem, idx) => {
                    cartString += `${idx + 1}. ${cartItem.name}\n`;
                    if (cartItem.quantity) {
                      cartString += `   Qty: ${cartItem.quantity}  •  $${(parseFloat(cartItem.price) * parseFloat(cartItem.quantity)).toFixed(2)}\n`;
                    } else {
                      cartString += `   $${cartItem.price}\n`;
                    }
                    if (cartItem.options) {
                      cartItem.options.map((option) => {
                        cartString += `   ${option}\n`;
                      });
                    }
                    if (cartItem.extraDetails) {
                      cartString += `   Note: ${cartItem.extraDetails}\n`;
                    }
                    cartString += "\n";
                  });
                  if (element.cartNote?.length ?? 0 > 0) {
                    cartString += `Order Note: ${element.cartNote}`;
                  }

                  return (
                    <PendingOrderItem
                      element={element}
                      index={index}
                      date={date}
                      cartString={cartString}
                      key={element.id ?? index}
                      setcurrentOrder={setcurrentOrder}
                      fadeIn={fadeIn}
                    />
                  );
                })
              ) : (
                <div style={styles.emptyState}>
                  <span style={styles.emptyTitle}>No pending orders</span>
                  <span style={styles.emptySubtitle}>Orders will appear here when placed</span>
                </div>
              )}
            </div>
          )}

          {/* Order Details Overlay */}
          {currentOrder.element && (
            <div style={{ ...styles.detailOverlay, opacity }}>
              {currentOrder.type === "view" ? (
                <PendingOrderDetails
                  currentOrder={currentOrder}
                  updateOrderHandler={updateOrderHandler}
                  fadeOut={fadeOut}
                  setcurrentOrder={setcurrentOrder}
                  setongoingOrderListModal={(val: boolean) =>
                    updatePosState({ ongoingOrderListModal: val })
                  }
                />
              ) : (
                <FinishPaymentCash
                  currentOrder={currentOrder}
                  updateOrderHandler={updateOrderHandler}
                  fadeIn={fadeIn}
                  fadeOut={fadeOut}
                  setcurrentOrder={setcurrentOrder}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PendingOrdersModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 520,
    height: 620,
    backgroundColor: "#fff",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  containerMax: {
    backgroundColor: "#fff",
    borderRadius: 0,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
    marginRight: 4,
  },
  iconBtn: {
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
  listScroll: {
    flex: 1,
    overflow: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  detailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    transition: "opacity 200ms",
    overflow: "hidden",
  },
};
