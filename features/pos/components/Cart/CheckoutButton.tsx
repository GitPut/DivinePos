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
      <div style={styles.btnRow}>
        <button
          className="pos-checkout-btn pos-checkout-filled"
          style={{ ...styles.checkoutBtn, ...styles.filledBtn, ...(cart.length < 1 ? { opacity: 0.5 } : {}) }}
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
          <span style={styles.filledLbl}>Update</span>
        </button>
        <button
          className="pos-checkout-btn pos-checkout-danger"
          style={{ ...styles.checkoutBtn, backgroundColor: "#ef4444" }}
          onClick={() => {
            resetPosState();
          }}
        >
          <span style={styles.filledLbl}>Cancel</span>
        </button>
      </div>
    );
  }

  if (!ongoingDelivery) {
    return (
      <div style={styles.btnRow}>
        <button
          className="pos-checkout-btn pos-checkout-outlined"
          style={{
            ...styles.checkoutBtn,
            ...styles.outlinedBtn,
            ...((cart.length < 1 || ongoingDelivery) ? { opacity: 0.5 } : {}),
          }}
          onClick={() => {
            updatePosState({ cashModal: true });
          }}
          disabled={cart.length < 1 || ongoingDelivery}
        >
          <span style={styles.outlinedLbl}>Cash</span>
        </button>
        <button
          className="pos-checkout-btn pos-checkout-filled"
          style={{
            ...styles.checkoutBtn,
            ...styles.filledBtn,
            ...((cart.length < 1 || ongoingDelivery) ? { opacity: 0.5 } : {}),
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
          <span style={styles.filledLbl}>Card</span>
        </button>
      </div>
    );
  }
  if (ongoingDelivery && cart.length > 0) {
    return (
      <div style={styles.btnRow}>
      <button
        className="pos-checkout-btn pos-checkout-filled"
        style={{ ...styles.checkoutBtn, ...styles.filledBtn, width: "100%" }}
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
        <span style={styles.filledLbl}>Checkout</span>
      </button>
      </div>
    );
  } else {
    return (
      <div style={styles.btnRow}>
      <button
        className="pos-checkout-btn pos-checkout-outlined"
        style={{ ...styles.checkoutBtn, ...styles.outlinedBtn, width: "100%" }}
        onClick={() => {
          resetPosState();
        }}
      >
        <span style={styles.outlinedLbl}>Cancel</span>
      </button>
      </div>
    );
  }
};

export default CheckoutButton;

const styles: Record<string, React.CSSProperties> = {
  btnRow: {
    flexDirection: "row",
    width: "88%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    display: "flex",
    gap: 10,
  },
  checkoutBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
  },
  filledBtn: {
    backgroundColor: "#1e293b",
    border: "none",
  },
  outlinedBtn: {
    backgroundColor: "#fff",
    border: "2px solid #1e293b",
  },
  filledLbl: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15,
  },
  outlinedLbl: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: 15,
  },
};
