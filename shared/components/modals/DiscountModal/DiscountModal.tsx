import React, { useEffect, useState } from "react";
import PercentageButton from "./PercentageButton";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import { cartState, storeDetailsState } from "store/appState";
import { useAlert } from "react-alert";
import { verifyEmployeePin, logEmployeeActivity } from "utils/employeeAuth";
import { calculateCartTotals } from "utils/cartCalculations";

const DiscountModal = () => {
  const { discountModal, discountAmount, deliveryChecked, cartSub } =
    posState.use(
      (s) => ({
        discountModal: s.discountModal,
        discountAmount: s.discountAmount,
        deliveryChecked: s.deliveryChecked,
        cartSub: s.cartSub,
      }),
      shallowEqual
    );
  const storeDetails = storeDetailsState.use();
  const cart = cartState.use();

  const [code, setCode] = useState("");
  const [totalWithoutDiscount, setTotalWithoutDiscount] = useState(0);
  const [totalWithNewDiscount, setTotalWithNewDiscount] = useState(0);
  const [localDiscountAmount, setLocalDiscountAmount] = useState(
    discountAmount ? discountAmount : ""
  );
  const alertP = useAlert();

  const tryApplyDiscount = () => {
    if (
      !storeDetails.settingsPassword ||
      storeDetails.settingsPassword === code
    ) {
      updatePosState({
        discountAmount: localDiscountAmount,
        discountModal: false,
      });
      return;
    }
    const employee = verifyEmployeePin(code, "discount");
    if (employee) {
      logEmployeeActivity(employee.id, employee.name, `Applied discount: ${localDiscountAmount}`);
      updatePosState({
        discountAmount: localDiscountAmount,
        discountModal: false,
      });
      return;
    }
    alertP.error("Incorrect Code");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      tryApplyDiscount();
    }
  };

  useEffect(() => {
    const totals = calculateCartTotals(
      cart,
      storeDetails.taxRate,
      storeDetails.deliveryPrice,
      deliveryChecked ?? false
    );
    setTotalWithoutDiscount(totals.subtotal);
  }, [cart, deliveryChecked]);

  useEffect(() => {
    const totals = calculateCartTotals(
      cart,
      storeDetails.taxRate,
      storeDetails.deliveryPrice,
      deliveryChecked ?? false,
      localDiscountAmount || null
    );
    setTotalWithNewDiscount(totals.subtotal);
  }, [localDiscountAmount]);

  return (
    <Modal
      isVisible={discountModal}
      onBackdropPress={() => {
        updatePosState({ discountModal: false });
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          {/* Title */}
          <span style={styles.title}>Apply Discount</span>

          {/* Totals */}
          <div style={styles.totalsRow}>
            <div style={styles.totalItem}>
              <span style={styles.totalLabel}>Current Total</span>
              <span style={styles.totalValue}>
                ${totalWithoutDiscount.toFixed(2)}
              </span>
            </div>
            <div style={styles.totalItem}>
              <span style={styles.totalLabel}>New Total</span>
              <span style={styles.totalValueGreen}>
                ${totalWithNewDiscount
                  ? totalWithNewDiscount.toFixed(2)
                  : cartSub.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Discount input + percentage pills */}
          <div style={styles.inputRow}>
            <input
              style={styles.discountInput}
              placeholder="Amount or percentage (e.g. 5%)"
              onChange={(e) => setLocalDiscountAmount(e.target.value)}
              value={localDiscountAmount}
              onKeyDown={handleKeyDown}
            />
            <div style={styles.pillsRow}>
              <PercentageButton
                percentageAmount="5%"
                onPress={() => setLocalDiscountAmount("5%")}
                isSelected={localDiscountAmount === "5%"}
              />
              <PercentageButton
                percentageAmount="10%"
                onPress={() => setLocalDiscountAmount("10%")}
                isSelected={localDiscountAmount === "10%"}
              />
              <PercentageButton
                percentageAmount="15%"
                onPress={() => setLocalDiscountAmount("15%")}
                isSelected={localDiscountAmount === "15%"}
              />
            </div>
          </div>

          {/* Manager code input */}
          <input
            placeholder="Manager code"
            onChange={(e) => setCode(e.target.value)}
            style={styles.managerCodeInput}
            onKeyDown={(e) => handleKeyDown(e)}
          />

          {/* Buttons */}
          <div style={styles.buttonsRow}>
            <button
              disabled={
                (!storeDetails.settingsPassword &&
                  discountAmount !== "") ||
                (code.length > 0 && discountAmount !== "")
                  ? false
                  : true
              }
              onClick={tryApplyDiscount}
              style={{
                ...styles.applyBtn,
                ...(!(
                  (!storeDetails.settingsPassword &&
                    discountAmount !== "") ||
                  (code.length > 0 && discountAmount !== "")
                ) && { opacity: 0.5, cursor: "not-allowed" }),
              }}
            >
              <span style={styles.applyBtnLabel}>Apply Discount</span>
            </button>
            <button
              onClick={() => {
                updatePosState({ discountModal: false });
              }}
              style={styles.cancelBtn}
            >
              <span style={styles.cancelBtnLabel}>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DiscountModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    width: 440,
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxSizing: "border-box" as const,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  totalsRow: {
    flexDirection: "row",
    display: "flex",
    gap: 24,
  },
  totalItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  totalValueGreen: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
  inputRow: {
    flexDirection: "row",
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  discountInput: {
    flex: 1,
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 15,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  pillsRow: {
    flexDirection: "row",
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  managerCodeInput: {
    width: "100%",
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 15,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  buttonsRow: {
    flexDirection: "row",
    display: "flex",
    gap: 10,
    marginTop: 4,
  },
  applyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#1470ef",
    borderRadius: 10,
    border: "none",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    cursor: "pointer",
  },
  applyBtnLabel: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    cursor: "pointer",
  },
  cancelBtnLabel: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 15,
  },
};
