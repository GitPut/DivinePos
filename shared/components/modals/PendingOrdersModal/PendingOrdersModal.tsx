import React, { useRef, useState } from "react";
import { IoClose, IoOpenOutline } from "react-icons/io5";
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

  return (
    <Modal
      isVisible={ongoingOrderListModal}
      onBackdropPress={() => updatePosState({ ongoingOrderListModal: false })}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={
            maximizeScreen
              ? {
                  ...styles.pendingOrdersModalContainerMaximize,
                  width: width,
                  height: height,
                }
              : styles.pendingOrdersModalContainer
          }
        >
          <div
            style={
              maximizeScreen
                ? styles.closeIconContainerMaximize
                : styles.closeIconContainer
            }
          >
            <button
              onClick={() => setmaximizeScreen(!maximizeScreen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <IoOpenOutline style={styles.closeIcon} />
            </button>
            <button
              onClick={() =>
                updatePosState({ ongoingOrderListModal: false })
              }
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <IoClose style={styles.closeIcon} />
            </button>
          </div>
          <div style={styles.secondAreaContainer}>
            <span style={styles.pendingOrderLabel}>Pending Orders</span>
            <div
              style={
                maximizeScreen
                  ? {
                      height: height * 0.9,
                      width: width * 0.9,
                    }
                  : styles.pendingOrderScrollView
              }
            >
              {maximizeScreen ? (
                <KitchenViewOrders />
              ) : (
                <div
                  style={{
                    overflow: "auto",
                    width: 421,
                    height: "100%",
                    alignItems: "center",
                    paddingTop: 3,
                    paddingRight: 25,
                    marginLeft: 25,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {ongoingListState?.length > 0 ? (
                    <div
                      style={
                        maximizeScreen
                          ? {
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "wrap",
                            }
                          : {}
                      }
                    >
                      {ongoingListState?.map((element, index) => {
                        let date = null;

                        const parsedDate = parseDate(element.date);
                        if (parsedDate !== null) {
                          date = parsedDate;
                        }

                        let cartString = "";

                        element.cart?.map((cartItem, index) => {
                          cartString += `${index + 1}. Name: ${
                            cartItem.name
                          }\n`;

                          if (cartItem.quantity) {
                            cartString += `     Quantity: ${cartItem.quantity}\n`;
                            cartString += `     Price: $${
                              parseFloat(cartItem.price) *
                              parseFloat(cartItem.quantity)
                            }`;
                          } else {
                            cartString += `    Price: $${cartItem.price}`;
                          }

                          if (cartItem.description) {
                            cartString += `     \n${cartItem.description}`;
                          }

                          if (cartItem.options) {
                            cartString += `\n`;
                            cartItem.options.map((option) => {
                              cartString += `    ${option}\n`;
                            });
                          }

                          if (cartItem.extraDetails) {
                            cartString += `     Note: ${cartItem.extraDetails}\n`;
                          }
                        });

                        if (element.cartNote?.length ?? 0 > 0) {
                          cartString += `\nNote: ${element.cartNote}`;
                        }
                        return (
                          <PendingOrderItem
                            style={{
                              ...styles.pendingOrderItem1,
                              ...(maximizeScreen ? { marginRight: 10 } : {}),
                            }}
                            element={element}
                            index={index}
                            date={date}
                            cartString={cartString}
                            key={index}
                            setcurrentOrder={setcurrentOrder}
                            fadeIn={fadeIn}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                      }}
                    >
                      <span>No Orders Yet</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {currentOrder.element && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                borderRadius: 10,
                justifyContent: "flex-start",
                alignItems: "center",
                width: 540,
                height: 609,
                backgroundColor: "white",
                opacity: opacity,
                transition: "opacity 200ms",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {currentOrder.type === "view" ? (
                <PendingOrderDetails
                  currentOrder={currentOrder}
                  updateOrderHandler={updateOrderHandler}
                  fadeOut={fadeOut}
                  setcurrentOrder={setcurrentOrder}
                  setongoingOrderListModal={(val: boolean) =>
                    updatePosState({
                      ongoingOrderListModal: val,
                    })
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
  pendingOrdersModalContainer: {
    width: 540,
    height: 609,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  pendingOrdersModalContainerMaximize: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  closeIconContainer: {
    width: 540,
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
  },
  closeIconContainerMaximize: {
    width: "95%",
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
  },
  closeIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
    margin: 20,
  },
  secondAreaContainer: {
    width: 421,
    height: 523,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  pendingOrderLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    display: "block",
  },
  pendingOrderScrollView: {
    height: 470,
    margin: 0,
  },
  pendingOrderItem1: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
};
