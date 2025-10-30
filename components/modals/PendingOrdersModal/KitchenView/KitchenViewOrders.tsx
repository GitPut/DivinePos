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
import PendingOrderItem from "../components/PendingOrderItem";
import PendingOrderShowDetails from "../PendingOrderShowDetails";
import FinishPaymentCash from "../FinishPaymentCash";
import Modal from "react-native-modal-web";
import { posHomeState, updatePosHomeState } from "state/posHomeState";
import { setCartState } from "state/state";
import { auth, db } from "state/firebaseConfig";
import { CurrentOrderProp, OngoingListStateProp } from "types/global";
import ParseDate from "components/functional/ParseDate";
import PendingOrderShowDetailsKitchenView from "./PendingOrderShowDetailsKitchenView";

const KitchenViewOrders = () => {
  const { height, width } = useWindowDimensions();
  const { ongoingListState, ongoingOrderListModal } = posHomeState.use();

  return (
    <ScrollView horizontal={true} contentContainerStyle={{ padding: 20 }}>
      {ongoingListState?.length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {ongoingListState?.map((element, index) => {
            let date = null;

            const parsedDate = ParseDate(element.date);
            if (parsedDate !== null) {
              date = parsedDate;
            }

            let cartString = "";

            element.cart?.map((cartItem, index) => {
              cartString += `${index + 1}. Name: ${cartItem.name}\n`;

              if (cartItem.quantity) {
                cartString += `     Quantity: ${cartItem.quantity}\n`;
                cartString += `     Price: $${
                  parseFloat(cartItem.price) * parseFloat(cartItem.quantity)
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

              cartString += `\n\n`;

            });

            if (element.cartNote?.length ?? 0 > 0) {
              cartString += `\nNote: ${element.cartNote}`;
            }

            return (
              <PendingOrderShowDetailsKitchenView
                style={[styles.pendingOrderItem1, { marginRight: 10 }]}
                element={element}
                index={index}
                date={date}
                cartString={cartString}
                key={index}
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
  );
};

export default KitchenViewOrders;

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
    backgroundColor: "white",
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
