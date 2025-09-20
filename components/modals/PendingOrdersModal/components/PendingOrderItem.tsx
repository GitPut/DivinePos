import React, { useEffect } from "react";
import { StyleSheet, View, Text, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "state/firebaseConfig";
import { updateTransList } from "state/firebaseFunctions";
import { storeDetailState } from "state/state";
import { posHomeState, updatePosHomeState } from "state/posHomeState";
import { CurrentOrderProp, TransListStateItem } from "types/global";

interface PendingOrderItemProps {
  element: TransListStateItem;
  index: number;
  style: ViewStyle;
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
  const storeDetails = storeDetailState.use();
  const { managerAuthorizedStatus, pendingAuthAction } = posHomeState.use();

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
      updatePosHomeState({
        managerAuthorizedStatus: false,
        pendingAuthAction: "",
      });
    }
  }, [managerAuthorizedStatus, pendingAuthAction]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.customerDetailsContainer}>
        <View style={styles.orderNameContainer}>
          <Text style={styles.orderNameLbl}>Order Name:</Text>
          <Text style={styles.orderNameValue}>
            {element.customer?.name?.length ?? 0 > 0
              ? element.customer?.name?.toUpperCase()
              : "N/A"}
          </Text>
        </View>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumberLabel}>Order Number:</Text>
          <Text style={styles.orderNumberValue}>
            {element.transNum?.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.divider}></View>
      <View style={styles.orderInfoContainer}>
        <View style={styles.orderInfoTextGroup}>
          {element.online && (
            <Text style={[styles.orderTypeLabel, { color: "#01C550" }]}>
              Online Order
            </Text>
          )}
          {!element.online && element.method !== "inStoreOrder" && (
            <Text style={[styles.orderTypeLabel, { color: "#FF0F00" }]}>
              Phone Order
            </Text>
          )}
          {element.method === "inStoreOrder" && (
            <Text style={[styles.orderTypeLabel]}>POS Order</Text>
          )}
          <Text style={styles.orderTime}>
            {element.method === "pickupOrder" && "Pickup"}
            {element.method === "deliveryOrder" && "Delivery"}
          </Text>
          <Text style={styles.orderDate}>{date?.toLocaleTimeString()}</Text>
        </View>
      </View>
      <View style={styles.orderOptionContainer}>
        <View style={styles.optionIconsRow}>
          {/* {element.method !== "inStoreOrder" && !element.online && ( */}
          <Pressable
            onPress={() => {
              fadeIn();
              setcurrentOrder({
                element: element,
                index: index.toString(),
                type: "view",
                cartString: cartString,
                date: date,
              });
            }}
          >
            <Feather name="edit" style={styles.editIcon}></Feather>
          </Pressable>
          {/* )} */}
          <Pressable
            onPress={() => {
              if (storeDetails.settingsPassword?.length > 0) {
                updatePosHomeState({
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
          >
            <MaterialCommunityIcons name="cancel" style={styles.cancelIcon} />
          </Pressable>
          <Pressable
            onPress={() => {
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
                  // console.log("element", element);
                  updateTransList(element);
                }
              }
            }}
          >
            <Entypo name="check" style={styles.finishIcon}></Entypo>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 9,
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  customerDetailsContainer: {
    width: 158,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  orderNameContainer: {
    width: "100%",
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 10,
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
  },
  orderInfoTextGroup: {
    width: 96,
    height: 53,
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  optionIconsRow: {
    width: 98,
    height: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});

export default PendingOrderItem;
