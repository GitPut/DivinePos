import React, { useState } from "react";
import Modal from "shared/components/ui/Modal";
import Print from "features/pos/components/Cart/print";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import {
  cartState,
  customersState,
  deviceState,
  storeDetailsState,
} from "store/appState";

const CashPaymentModal = () => {
  const [cash, setCash] = useState("");
  const {
    deliveryChecked,
    discountAmount,
    changeDue,
    savedCustomerDetails,
    name,
    phone,
    address,
    buzzCode,
    unitNumber,
    cartNote,
    cartSub,
    cashModal,
  } = posState.use(
    (s) => ({
      deliveryChecked: s.deliveryChecked,
      discountAmount: s.discountAmount,
      changeDue: s.changeDue,
      savedCustomerDetails: s.savedCustomerDetails,
      name: s.name,
      phone: s.phone,
      address: s.address,
      buzzCode: s.buzzCode,
      unitNumber: s.unitNumber,
      cartNote: s.cartNote,
      cartSub: s.cartSub,
      cashModal: s.cashModal,
    }),
    shallowEqual
  );
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const myDeviceDetails = deviceState.use();
  const customers = customersState.use();
  const total = (
    parseFloat(storeDetails.taxRate) >= 0
      ? cartSub * (1 + parseFloat(storeDetails.taxRate) / 100)
      : cartSub * 1.13
  ).toFixed(2);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      Print({
        method: "Cash",
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
      updatePosState({ cashModal: false });
      setCash("");
    }
  };

  return (
    <Modal
      isVisible={cashModal}
      onBackdropPress={() => {
        updatePosState({ cashModal: false });
        setCash("");
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          <span style={styles.paymentDetailsLabel}>Payment Details</span>
          <div style={styles.mainPartGroup}>
            <span style={styles.orderTotal}>Total: ${total}</span>
            <input
              style={styles.amountPaidTxtInput}
              placeholder="Enter Cash Recieved"
              value={cash}
              onChange={(e) => {
                const val = e.target.value;
                const re = /^-?\d*\.?\d*$/;

                if (re.test(val)) {
                  setCash(val.toString());
                  updatePosState({
                    changeDue: (
                      parseFloat(val) - parseFloat(total)
                    ).toFixed(2),
                  });
                } else if (!val) {
                  setCash("");
                  updatePosState({ changeDue: total });
                }
              }}
              onKeyDown={handleKeyDown}
              autoFocus={true}
            />
            <div style={styles.changeDueRow}>
              <span style={styles.changeDue}>Change Due:</span>
              <span style={styles.changeDueValue}>
                $
                {parseFloat(cash) > 0
                  ? (parseFloat(total) - parseFloat(cash)).toFixed(2)
                  : total}
              </span>
            </div>
          </div>
          <div style={styles.btnsGroup}>
            <button
              style={styles.finishPaymentBtn}
              onClick={() => {
                Print({
                  method: "Cash",
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
                updatePosState({ cashModal: false });
                setCash("");
              }}
            >
              <span style={styles.finishPayment}>Finish Payment</span>
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                updatePosState({ cashModal: false });
                setCash("");
              }}
            >
              <span style={styles.cancel}>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CashPaymentModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    width: 540,
    height: 609,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
  },
  paymentDetailsLabel: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    marginTop: 55,
    display: "block",
  },
  mainPartGroup: {
    width: 441,
    height: 157,
    justifyContent: "space-between",
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
  },
  orderTotal: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 23,
    display: "block",
  },
  amountPaidTxtInput: {
    height: 53,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a3a3a3",
    borderStyle: "solid" as const,
    padding: 10,
    width: "100%",
    boxSizing: "border-box" as const,
  },
  changeDueRow: {
    height: 24,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
  },
  changeDue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    marginRight: 10,
  },
  changeDueValue: {
    color: "#121212",
    fontSize: 18,
  },
  btnsGroup: {
    width: 283,
    height: 120,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    display: "flex",
    flexDirection: "column",
  },
  finishPaymentBtn: {
    width: 283,
    height: 44,
    backgroundColor: "#1d284e",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  finishPayment: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  cancelBtn: {
    width: 283,
    height: 44,
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  cancel: {
    fontWeight: "700",
    color: "rgba(0,0,0,1)",
    fontSize: 20,
  },
};
