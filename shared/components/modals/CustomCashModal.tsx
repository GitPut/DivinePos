import React, { useState } from "react";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { deviceState, storeDetailsState } from "store/appState";
import { useAlert } from "react-alert";
import qz from "qz-tray";
import { verifyEmployeePin, logEmployeeActivity } from "utils/employeeAuth";

const CustomcustomCashModal = () => {
  const { customCashModal } = posState.use();
  const storeDetails = storeDetailsState.use();
  const myDeviceDetails = deviceState.use();
  const [total, setTotal] = useState("");
  const [cash, setCash] = useState("");
  const [managerCodeEntered, setmanagerCodeEntered] = useState("");
  const alertP = useAlert();

  const Reset = () => {
    setTotal("");
    setCash("");
    setmanagerCodeEntered("");
  };

  const isCodeAuthorized = (action: string): boolean => {
    if (
      (storeDetails.settingsPassword?.length > 0 &&
        storeDetails.settingsPassword === managerCodeEntered) ||
      storeDetails.settingsPassword?.length === 0
    ) {
      return true;
    }
    const employee = verifyEmployeePin(managerCodeEntered, "customPayment");
    if (employee) {
      logEmployeeActivity(employee.id, employee.name, action);
      return true;
    }
    return false;
  };

  const CompletePayment = () => {
    if (!myDeviceDetails.id) {
      alertP.error("Please set up a device in Settings -> Devices");
      return;
    }
    if (isCodeAuthorized(`Custom payment: $${total}`)) {
      if (parseFloat(total) > 0 && parseFloat(cash) > 0) {
        qz.websocket
          .connect()
          .then(function () {
            if (!myDeviceDetails.printToPrinter) {
              alertP.error("You must specify a printer in device settings");
              return;
            }
            const config = qz.configs.create(myDeviceDetails.printToPrinter);
            return qz.print(config, [
              "\x1B" + "\x40", // init
              "                                                                              ", // line break
              "\x0A",
              "\x1B" + "\x61" + "\x31", // center align
              storeDetails.name,
              "\x0A",
              storeDetails.address?.label + "\x0A",
              storeDetails.website + "\x0A", // text and line break
              storeDetails.phoneNumber + "\x0A", // text and line break
              new Date().toLocaleDateString() + "\x0A",
              "\x0A",
              "Custom Cash Transaction" + "\x0A",
              "\x0A",
              "\x0A",
              "\x0A",
              "\x1B" + "\x61" + "\x30", // left align
              "Total: $" + total + "\x0A",
              "Cash Recieved: $" + cash + "\x0A",
              "Change Due: $" +
                (parseFloat(total) - parseFloat(cash)).toFixed(2),
              "\x0A", // line break
              "\x0A", // line break
              "\x0A", // line break
              "\x0A", // line break
              "\x0A", // line break
              "\x0A", // line break
              "\x1D" +
                "\x56" +
                "\x30" +
                "\x10" +
                "\x14" +
                "\x01" +
                "\x00" +
                "\x05",
            ]);
          })
          .then(qz.websocket.disconnect)
          .catch(function (err) {
            if (
              err.message.includes(
                "A printer must be specified before printing"
              )
            ) {
              alertP.error("You must specify a printer in device settings");
            } else if (
              err.message.includes("Unable to establish connection with QZ")
            ) {
              alertP.error(
                "You do not have Divine POS Helper installed. Please download from general settings"
              );
            } else if (err.message.includes("Cannot find printer with name")) {
              alertP.error(
                "Printer not found. Please check your printer settings."
              );
            } else {
              alertP.error(
                "An error occured while trying to print. Try refreshing the page and trying again."
              );
            }
          });
        updatePosState({ customCashModal: false });
        Reset();
      } else {
        alertP.error("Please Enter Total Amount");
      }
    } else {
      alertP.error("Incorrect Manager Code");
    }
  };

  const OpenRegister = () => {
    if (!myDeviceDetails.id) {
      alertP.error("Please set up a device in Settings -> Devices");
      return;
    }
    if (isCodeAuthorized("Opened register")) {
      qz.websocket
        .connect()
        .then(function () {
          if (!myDeviceDetails.printToPrinter) return;
          const config = qz.configs.create(myDeviceDetails.printToPrinter);
          return qz.print(config, [
            "\x1B" + "\x40", // init
            "                                                                              ", // line break
            "\x0A",
            "\x1B" + "\x61" + "\x31", // center align
            storeDetails.name,
            "\x0A",
            storeDetails.address?.label + "\x0A",
            storeDetails.website + "\x0A", // text and line break
            storeDetails.phoneNumber + "\x0A", // text and line break
            new Date().toLocaleDateString() + "\x0A",
            "\x0A",
            "Register Opened" + "\x0A",
            "\x0A",
            "\x0A",
            "\x0A",
            "\x1B" + "\x61" + "\x30", // left align
            "\x0A", // line break
            "\x0A", // line break
            "\x0A", // line break
            "\x0A", // line break
            "\x0A", // line break
            "\x0A", // line break
            "\x1D" +
              "\x56" +
              "\x30" +
              "\x10" +
              "\x14" +
              "\x01" +
              "\x00" +
              "\x05",
          ]);
        })
        .then(qz.websocket.disconnect)
        .catch(function (err) {
          if (
            err.message.includes("A printer must be specified before printing")
          ) {
            alertP.error("You must specify a printer in device settings");
          } else if (
            err.message.includes("Unable to establish connection with QZ")
          ) {
            alertP.error(
              "You do not have Divine POS Helper installed. Please download from general settings"
            );
          } else if (err.message.includes("Cannot find printer with name")) {
            alertP.error(
              "Printer not found. Please check your printer settings."
            );
          } else {
            alertP.error(
              "An error occured while trying to print. Try refreshing the page and trying again."
            );
          }
        });
      updatePosState({ customCashModal: false });
      Reset();
    } else {
      alertP.error("Incorrect Manager Code");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (parseFloat(total) > 0 && parseFloat(cash) > 0) {
        CompletePayment();
      } else {
        OpenRegister();
      }
    }
  };

  return (
    <Modal
      isVisible={customCashModal}
      onBackdropPress={() => {
        updatePosState({ customCashModal: false });
        Reset();
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          <span style={styles.paymentDetailsLabel}>
            Custom Payment Details
          </span>
          <div style={styles.mainPartGroup}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span style={styles.changeDue}>Total:</span>
              <input
                style={styles.amountPaidTxtInput}
                placeholder="Enter Total"
                value={total}
                onChange={(e) => {
                  const val = e.target.value;
                  const re = /^-?\d*\.?\d*$/;

                  if (re.test(val)) {
                    setTotal(val.toString());
                  } else if (!val) {
                    setTotal("");
                  }
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span style={styles.changeDue}>Recieved:</span>
              <input
                style={styles.amountPaidTxtInput}
                placeholder="Enter Cash Recieved"
                value={cash}
                onChange={(e) => {
                  const val = e.target.value;
                  const re = /^-?\d*\.?\d*$/;

                  if (re.test(val)) {
                    setCash(val.toString());
                  } else if (!val) {
                    setCash("");
                  }
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div style={styles.changeDueRow}>
              <span style={styles.changeDue}>Change Due:</span>
              <span style={styles.changeDueValue}>
                $
                {parseFloat(cash) > 0 && parseFloat(total) > 0
                  ? (parseFloat(total) - parseFloat(cash)).toFixed(2)
                  : total}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span style={styles.changeDue}>Manager Code:</span>
              <input
                style={styles.amountPaidTxtInput}
                placeholder="Enter Manger Code"
                value={managerCodeEntered}
                onChange={(e) => {
                  setmanagerCodeEntered(e.target.value);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <div style={styles.btnsGroup}>
            <button
              style={{
                ...styles.finishPaymentBtn,
                ...(!(parseFloat(total) > 0 && parseFloat(cash) > 0) && {
                  opacity: 0.8,
                }),
              }}
              onClick={() => {
                CompletePayment();
              }}
              disabled={!(parseFloat(total) > 0 && parseFloat(cash) > 0)}
            >
              <span style={styles.finishPayment}>Finish Payment</span>
            </button>
            <button
              style={{
                ...styles.finishPaymentBtn,
                ...(storeDetails.settingsPassword?.length > 0 &&
                  managerCodeEntered.length < 1 && { opacity: 0.8 }),
              }}
              onClick={() => {
                OpenRegister();
              }}
              disabled={
                storeDetails.settingsPassword?.length > 0 &&
                managerCodeEntered.length < 1
              }
            >
              <span style={styles.finishPayment}>Open Register</span>
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                updatePosState({ customCashModal: false });
                Reset();
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

export default CustomcustomCashModal;

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
    justifyContent: "space-between",
    marginTop: 20,
  },
  orderTotal: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 23,
  },
  amountPaidTxtInput: {
    height: 53,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a3a3a3",
    borderStyle: "solid" as const,
    padding: 10,
    width: "60%",
    boxSizing: "border-box" as const,
  },
  changeDueRow: {
    height: 24,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 20,
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
