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
          <span style={styles.title}>Cash Payment</span>

          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Order Total</span>
            <span style={styles.totalValue}>${total}</span>
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Cash Received</span>
            <input
              style={styles.input}
              placeholder="Enter amount"
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
          </div>

          <div style={styles.changeDueRow}>
            <span style={styles.changeDueLabel}>Change Due</span>
            <span style={styles.changeDueValue}>
              $
              {parseFloat(cash) > 0
                ? (parseFloat(total) - parseFloat(cash)).toFixed(2)
                : total}
            </span>
          </div>

          <div style={styles.divider} />

          <div style={styles.btnsRow}>
            <button
              style={styles.completeBtn}
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
              Complete Payment
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                updatePosState({ cashModal: false });
                setCash("");
              }}
            >
              Cancel
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
    width: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    padding: 28,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 24,
  },
  totalRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: "16px 0",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  input: {
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 15,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    width: "100%",
  },
  changeDueRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 20,
  },
  changeDueLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
  },
  changeDueValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 20,
  },
  btnsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  completeBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#10b981",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    color: "#344054",
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
