import React, { useEffect, useState } from "react";
import PercentageButton from "./PercentageButton";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { cartState, storeDetailsState } from "store/appState";
import { useAlert } from "react-alert";
import { verifyEmployeePin, logEmployeeActivity } from "utils/employeeAuth";

const DiscountModal = () => {
  const { discountModal, discountAmount, deliveryChecked, cartSub } =
    posState.use();
  const storeDetails = storeDetailsState.use();
  const cart = cartState.use();

  const [code, setcode] = useState("");
  const [totalWithoutDiscount, settotalWithoutDiscount] = useState(0);
  const [totalWithNewDiscount, settotalWithNewDiscount] = useState(0);
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
    let newVal = 0;
    for (let i = 0; i < cart.length; i++) {
      try {
        if (cart[i].quantity ?? 0 > 1) {
          newVal += parseFloat(cart[i].price) * parseFloat(cart[i].quantity ?? '1');
        } else {
          newVal += parseFloat(cart[i].price);
        }
      } catch (error) {
        // error handled silently
      }
    }
    if (deliveryChecked) {
      newVal += parseFloat(storeDetails.deliveryPrice);
    }

    settotalWithoutDiscount(newVal);
  }, [cart, deliveryChecked]);

  useEffect(() => {
    if (localDiscountAmount.includes("%")) {
      const discount = parseFloat(localDiscountAmount.replace("%", "")) / 100;
      settotalWithNewDiscount(
        totalWithoutDiscount - totalWithoutDiscount * discount
      );
    } else {
      settotalWithNewDiscount(
        totalWithoutDiscount - parseFloat(localDiscountAmount)
      );
    }
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
          <div style={styles.innerContentContainer}>
            <div style={styles.labelAndInnerGroup}>
              <span style={styles.containerLbl}>Discount</span>
              <div style={styles.innerGroup}>
                <span style={styles.currentTotalLbl}>
                  Total Without Discount: $
                  {totalWithoutDiscount.toFixed(2)}
                </span>
                <div style={styles.inputWithPercentageRow}>
                  <input
                    style={styles.customPercentageInput}
                    placeholder="Enter Custom Amount or Percentage"
                    onChange={(e) => setLocalDiscountAmount(e.target.value)}
                    value={localDiscountAmount}
                    onKeyDown={handleKeyDown}
                  />
                  <div style={styles.percentageBtnsRow}>
                    <PercentageButton
                      percentageAmount="5%"
                      style={styles.percentageBtn5}
                      onPress={() => setLocalDiscountAmount("5%")}
                      isSelected={localDiscountAmount === "5%"}
                    />
                    <PercentageButton
                      percentageAmount="10%"
                      style={styles.percentageBtn10}
                      onPress={() => setLocalDiscountAmount("10%")}
                      isSelected={localDiscountAmount === "10%"}
                    />
                    <PercentageButton
                      percentageAmount="15%"
                      style={styles.percentageBtn15}
                      onPress={() => setLocalDiscountAmount("15%")}
                      isSelected={localDiscountAmount === "15%"}
                    />
                  </div>
                </div>
                <span style={styles.newTotalLbl}>
                  New Total: $
                  {totalWithNewDiscount
                    ? totalWithNewDiscount.toFixed(2)
                    : cartSub.toFixed(2)}
                </span>
                <input
                  placeholder="Enter Manager's Code"
                  onChange={(e) => setcode(e.target.value)}
                  style={styles.managerCodeInput}
                  onKeyDown={(e) => handleKeyDown(e)}
                />
              </div>
            </div>
            <div style={styles.confirmAndCancelBtnGroup}>
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
                  ...styles.confirmBtn,
                  ...(!(
                    (!storeDetails.settingsPassword &&
                      discountAmount !== "") ||
                    (code.length > 0 && discountAmount !== "")
                  ) && { opacity: 0.8 }),
                }}
              >
                <span style={styles.confirmLbl}>Confirm</span>
              </button>
              <button
                onClick={() => {
                  updatePosState({ discountModal: false });
                }}
                style={styles.cancelBtn}
              >
                <span style={styles.cancelLbl}>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DiscountModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,1)",
    width: 540,
    height: 439,
    display: "flex",
    flexDirection: "column",
  },
  innerContentContainer: {
    width: 439,
    height: 382,
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  labelAndInnerGroup: {
    width: 439,
    height: 246,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  containerLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    display: "block",
  },
  innerGroup: {
    width: 439,
    height: 202,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  currentTotalLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 14,
  },
  inputWithPercentageRow: {
    width: 439,
    height: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  customPercentageInput: {
    width: 259,
    height: 52,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9e9e9e",
    borderStyle: "solid" as const,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  percentageBtnsRow: {
    width: 156,
    height: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  percentageBtn5: {
    height: 46,
    width: 46,
  },
  percentageBtn10: {
    height: 46,
    width: 46,
  },
  percentageBtn15: {
    height: 46,
    width: 46,
  },
  newTotalLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 14,
  },
  managerCodeInput: {
    width: 438,
    height: 52,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9e9e9e",
    borderStyle: "solid" as const,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  confirmAndCancelBtnGroup: {
    width: 284,
    height: 101,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  confirmBtn: {
    width: 284,
    height: 42,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  confirmLbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  cancelBtn: {
    width: 284,
    height: 42,
    backgroundColor: "#edf1fe",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  cancelLbl: {
    fontWeight: "700",
    color: "rgba(0,0,0,1)",
    fontSize: 18,
  },
};
