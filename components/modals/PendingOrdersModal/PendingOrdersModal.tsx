import {
  Animated,
  ScrollView,
  StyleSheet,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useRef, useState } from "react";
import { Text } from "@react-native-material/core";
import { Ionicons } from "@expo/vector-icons";
import PendingOrderItem from "./components/PendingOrderItem";
import PendingOrderShowDetails from "./PendingOrderShowDetails";
import FinishPaymentCash from "./FinishPaymentCash";
import Modal from "react-native-modal-web";
import { posHomeState, updatePosHomeState } from "state/posHomeState";
import { setCartState } from "state/state";
import { auth, db } from "state/firebaseConfig";
import { CurrentOrderProp, OngoingListStateProp } from "types/global";
import ParseDate from "components/functional/ParseDate";
import KitchenViewOrders from "./KitchenView/KitchenViewOrders";

const PendingOrdersModal = () => {
  const { height, width } = useWindowDimensions();
  const [currentOrder, setcurrentOrder] = useState<CurrentOrderProp>({
    element: null,
    index: null,
    cart: [],
    date: null,
  });
  const xPos = useRef(new Animated.Value(0)).current;
  const { ongoingListState, ongoingOrderListModal } = posHomeState.use();
  const [maximizeScreen, setmaximizeScreen] = useState(false);

  const updateOrderHandler = (order: OngoingListStateProp) => {
    setCartState(order.cart);
    if (order.cartNote) {
      updatePosHomeState({ cartNote: order.cartNote });
    }
    if (order.isInStoreOrder) {
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .doc(order.id)
        .delete();
      updatePosHomeState({
        ongoingOrderListModal: false,
      });
    } else {
      updatePosHomeState({
        name: order.customer?.name ? order.customer?.name : "",
      });
      updatePosHomeState({
        phone: order.customer?.phone ? order.customer?.phone : "",
      });
      updatePosHomeState({
        address: order.customer?.address ? order.customer?.address : null,
      });
      updatePosHomeState({
        deliveryChecked: order.method === "deliveryOrder",
      });
      updatePosHomeState({
        ongoingDelivery: true,
        updatingOrder: order,
        ongoingOrderListModal: false,
      });
    }
  };

  const fadeIn = () => {
    Animated.timing(xPos, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const fadeOut = (customFuncAfter: boolean) => {
    Animated.timing(xPos, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      if (customFuncAfter) {
        //   customFuncAfter();
        console.log("I turned this off because i dont know what it does");
      } else {
        setcurrentOrder({ element: null, index: null, cart: [], date: null });
      }
    });
  };

  return (
    <Modal
      isVisible={ongoingOrderListModal}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => updatePosHomeState({ ongoingOrderListModal: false })}
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: height,
            width: width,
          }}
        >
          <Pressable>
            <div style={{ cursor: "default" }}>
              <View
                style={
                  maximizeScreen
                    ? [
                        styles.pendingOrdersModalContainerMaximize,
                        { width: width, height: height },
                      ]
                    : styles.pendingOrdersModalContainer
                }
              >
                <View
                  style={
                    maximizeScreen
                      ? styles.closeIconContainerMaximize
                      : styles.closeIconContainer
                  }
                >
                  <Pressable onPress={() => setmaximizeScreen(!maximizeScreen)}>
                    <Ionicons name="open" style={styles.closeIcon} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      updatePosHomeState({ ongoingOrderListModal: false })
                    }
                  >
                    <Ionicons name="close" style={styles.closeIcon} />
                  </Pressable>
                </View>
                <View style={styles.secondAreaContainer}>
                  <Text style={styles.pendingOrderLabel}>Pending Orders</Text>
                  <View
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
                      <ScrollView
                        horizontal={false}
                        contentContainerStyle={
                          maximizeScreen
                            ? { backgroundColor: "black", padding: 20 }
                            : styles.pendingOrderScrollView_contentContainerStyle
                        }
                      >
                        {ongoingListState?.length > 0 ? (
                          <View
                            style={
                              maximizeScreen
                                ? {
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                  }
                                : {}
                            }
                          >
                            {ongoingListState?.map((element, index) => {
                              let date = null;

                              const parsedDate = ParseDate(element.date);
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
                                  style={[
                                    styles.pendingOrderItem1,
                                    maximizeScreen && { marginRight: 10 },
                                  ]}
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
                          </View>
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text>No Orders Yet</Text>
                          </View>
                        )}
                      </ScrollView>
                    )}
                  </View>
                </View>
                {currentOrder.element && (
                  <Animated.View
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
                      opacity: xPos,
                    }}
                  >
                    {currentOrder.type === "view" ? (
                      <PendingOrderShowDetails
                        currentOrder={currentOrder}
                        updateOrderHandler={updateOrderHandler}
                        fadeOut={fadeOut}
                        setcurrentOrder={setcurrentOrder}
                        setongoingOrderListModal={(val: boolean) =>
                          updatePosHomeState({
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
                  </Animated.View>
                )}
              </View>
            </div>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
};

export default PendingOrdersModal;

const styles = StyleSheet.create({
  pendingOrdersModalContainer: {
    width: 540,
    height: 609,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    // position: "absolute",
    // left: 270,
    // top: 304,
  },
  pendingOrdersModalContainerMaximize: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    // position: "absolute",
    // left: 270,
    // top: 304,
  },
  closeIconContainer: {
    width: 540,
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeIconContainerMaximize: {
    width: "95%",
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  },
  pendingOrderLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  pendingOrderScrollView: {
    height: 470,
    margin: 0,
  },
  pendingOrderScrollViewMaximize: {
    height: "80%",
    margin: 0,
  },
  pendingOrderScrollView_contentContainerStyle: {
    width: 421,
    alignItems: "center",
    paddingTop: 3,
    paddingRight: 25,
    marginLeft: 25,
  },
  pendingOrderScrollView_contentContainerStyleMaximize: {
    height: "90%",
    width: "90%",
    alignItems: "center",
    paddingTop: 3,
    paddingRight: 25,
    marginLeft: 25,
    backgroundColor: "black",
  },
  pendingOrderItem: {
    height: 84,
    width: "100%",
    marginBottom: 10,
  },
  pendingOrderItem1: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem2: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem3: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem4: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem5: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem6: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem7: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem8: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem9: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem10: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem11: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
  pendingOrderItem12: {
    height: 84,
    width: 415,
    marginBottom: 10,
  },
});
