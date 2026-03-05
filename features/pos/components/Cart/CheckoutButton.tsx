import React from "react";
import { auth, db } from "services/firebase/config";
import Print from "./print";
import {
  cartState,
  customersState,
  deviceState,
  storeDetailsState,
} from "store/appState";
import {
  posState,
  resetPosState,
  updatePosState,
} from "store/posState";

const CheckoutButton = () => {
  const {
    deliveryChecked,
    ongoingDelivery,
    updatingOrder,
    discountAmount,
    changeDue,
    savedCustomerDetails,
    name,
    phone,
    address,
    buzzCode,
    unitNumber,
    cartNote,
  } = posState.use();
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const myDeviceDetails = deviceState.use();
  const customers = customersState.use();

  if (updatingOrder) {
    return (
      <div
        style={{
          flexDirection: "row",
          width: "90%",
          alignSelf: "center",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          display: "flex",
        }}
      >
        <button
          style={{ ...styles.checkoutBtn, ...(cart.length < 1 ? { opacity: 0.8 } : {}) }}
          disabled={cart.length < 1}
          onClick={() => {
            db.collection("users")
              .doc(auth.currentUser?.uid)
              .collection("pendingOrders")
              .doc(updatingOrder.id)
              .delete();

            Print({
              method: deliveryChecked ? "deliveryOrder" : "pickupOrder",
              dontAddToOngoing: false,
              discountAmount: discountAmount as string,
              deliveryChecked: deliveryChecked ? true : false,
              changeDue,
              savedCustomerDetails,
              name,
              phone,
              address,
              buzzCode,
              unitNumber,
              cartNote,
              customers,
              cart,
              storeDetails,
              myDeviceDetails,
            });
          }}
        >
          <span style={styles.checkoutLbl}>Update</span>
        </button>
        <button
          style={{ ...styles.checkoutBtn, backgroundColor: "red" }}
          onClick={() => {
            resetPosState();
          }}
        >
          <span style={styles.checkoutLbl}>Cancel</span>
        </button>
      </div>
    );
  }

  if (!ongoingDelivery) {
    return (
      <div
        style={{
          flexDirection: "row",
          width: "90%",
          alignSelf: "center",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          display: "flex",
        }}
      >
        <button
          style={{
            ...styles.checkoutBtn,
            ...((cart.length < 1 || ongoingDelivery) ? { opacity: 0.8 } : {}),
          }}
          onClick={() => {
            updatePosState({ cashModal: true });
          }}
          disabled={cart.length < 1 || ongoingDelivery}
        >
          <span style={styles.checkoutLbl}>Cash</span>
        </button>
        <button
          style={{
            ...styles.checkoutBtn,
            ...((cart.length < 1 || ongoingDelivery) ? { opacity: 0.8 } : {}),
          }}
          onClick={() => {
            Print({
              method: "Card",
              dontAddToOngoing: false,
              discountAmount,
              deliveryChecked: deliveryChecked ? true : false,
              changeDue,
              savedCustomerDetails,
              name,
              phone,
              address,
              buzzCode,
              unitNumber,
              cartNote,
              customers,
              cart,
              storeDetails,
              myDeviceDetails,
            });
          }}
          disabled={cart.length < 1 || ongoingDelivery}
        >
          <span style={styles.checkoutLbl}>Card</span>
        </button>
      </div>
    );
  }
  if (ongoingDelivery && cart.length > 0) {
    return (
      <button
        style={styles.checkoutBtn}
        onClick={() => {
          Print({
            method: deliveryChecked ? "deliveryOrder" : "pickupOrder",
            dontAddToOngoing: false,
            discountAmount,
            deliveryChecked: deliveryChecked ? true : false,
            changeDue,
            savedCustomerDetails,
            name,
            phone,
            address,
            buzzCode,
            unitNumber,
            cartNote,
            customers,
            cart,
            storeDetails,
            myDeviceDetails,
          });
        }}
      >
        <span style={styles.checkoutLbl}>Checkout</span>
      </button>
    );
  } else {
    return (
      <button
        style={styles.checkoutBtn}
        onClick={() => {
          resetPosState();
        }}
      >
        <span style={styles.checkoutLbl}>Cancel</span>
      </button>
    );
  }
};

export default CheckoutButton;

const styles: Record<string, React.CSSProperties> = {
  checkoutBtn: {
    width: 170,
    height: 48,
    backgroundColor: "#1a2951",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  checkoutLbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
};
