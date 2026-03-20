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

  const isCompleteDisabled = !(parseFloat(total) > 0 && parseFloat(cash) > 0);
  const isRegisterDisabled =
    storeDetails.settingsPassword?.length > 0 &&
    managerCodeEntered.length < 1;

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
          <span style={styles.title}>Custom Payment</span>

          <div style={styles.formRow}>
            <span style={styles.label}>Total</span>
            <input
              style={styles.input}
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

          <div style={styles.formRow}>
            <span style={styles.label}>Cash Received</span>
            <input
              style={styles.input}
              placeholder="Enter Cash Received"
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
            <span style={styles.changeDueLabel}>Change Due</span>
            <span style={styles.changeDueValue}>
              $
              {parseFloat(cash) > 0 && parseFloat(total) > 0
                ? (parseFloat(total) - parseFloat(cash)).toFixed(2)
                : total}
            </span>
          </div>

          <div style={styles.formRow}>
            <span style={styles.label}>Manager Code</span>
            <input
              style={styles.input}
              placeholder="Enter Manager Code"
              value={managerCodeEntered}
              onChange={(e) => {
                setmanagerCodeEntered(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.divider} />

          <div style={styles.btnsGroup}>
            <button
              style={{
                ...styles.completeBtn,
                ...(isCompleteDisabled && { opacity: 0.5, cursor: "not-allowed" }),
              }}
              onClick={() => {
                CompletePayment();
              }}
              disabled={isCompleteDisabled}
            >
              Complete Payment
            </button>
            <button
              style={{
                ...styles.openRegisterBtn,
                ...(isRegisterDisabled && { opacity: 0.5, cursor: "not-allowed" }),
              }}
              onClick={() => {
                OpenRegister();
              }}
              disabled={isRegisterDisabled}
            >
              Open Register
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                updatePosState({ customCashModal: false });
                Reset();
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

export default CustomcustomCashModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 440,
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
  formRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    whiteSpace: "nowrap",
    minWidth: 100,
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
    flex: 1,
  },
  changeDueRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
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
  btnsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  completeBtn: {
    width: "100%",
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
  openRegisterBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1470ef",
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
    width: "100%",
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
