import React, { Dispatch, SetStateAction, useState } from "react";
import { auth, db } from "services/firebase/config";
import { updateTransList } from "services/firebase/functions";
import { deviceState, storeDetailsState } from "store/appState";
import { useAlert } from "react-alert";
import qz from "qz-tray";
import { CurrentOrderProp, OngoingListStateProp } from "types";

interface FinishPaymentCashProps {
  currentOrder: CurrentOrderProp;
  fadeIn: () => void;
  fadeOut: (customFuncAfter: boolean) => void;
  setcurrentOrder: Dispatch<SetStateAction<CurrentOrderProp>>;
  updateOrderHandler: (order: OngoingListStateProp) => void;
}

function FinishPaymentCash({
  currentOrder,
  fadeOut,
  setcurrentOrder,
}: FinishPaymentCashProps) {
  const { element } = currentOrder;
  const total = element?.total ? element?.total : "0";
  const [cash, setCash] = useState("");
  const storeDetails = storeDetailsState.use();
  const myDeviceDetails = deviceState.use();
  const alertP = useAlert();

  const PayByCash = () => {
    if (cash === "") {
      alertP.error("Please enter the amount of cash recieved");
      return;
    }
    if (parseFloat(cash) < parseFloat(total)) {
      alertP.error("The amount of cash recieved is less than the total");
      return;
    }
    const data = [
      "\x1B" + "\x40", // init
      "                                                                              ", // line break
      "\x0A",
      "\x1B" + "\x61" + "\x31", // center align
      storeDetails.name,
      "\x0A",
      storeDetails.address?.label + "\x0A",
      storeDetails.website + "\x0A", // text and line break
      storeDetails.phoneNumber + "\x0A", // text and line break
      "\x0A",
      "Pickup Order Paid" + "\x0A", // text and line break
      `Transaction ID ${element?.transNum}` + "\x0A",
      "\x0A",
      `Customer Name: ${element?.customer?.name}` + "\x0A", // text and line break
      "\x0A",
      `Customer Phone: ${element?.customer?.phone}` + "\x0A", // text and line break
      "\x0A",
      "\x0A",
      "\x0A",
      "\x0A",
      "\x1B" + "\x61" + "\x30", // left align
      `Total: $${total}` + "\x0A",
      `Cash Given: $${cash}` + "\x0A",
      `Change Due: $${(parseFloat(cash) - parseFloat(total)).toFixed(2)}` +
        "\x0A",
      "------------------------------------------" + "\x0A",
      "\x0A", // line break
      "\x0A", // line break
      "\x0A", // line break
      "\x0A", // line break
      "\x0A", // line break
      "\x0A", // line break
      "\x1D" + "\x56" + "\x30",
      "\x10" + "\x14" + "\x01" + "\x00" + "\x05",
    ];

    if (
      myDeviceDetails.sendPrintToUserID &&
      myDeviceDetails.useDifferentDeviceToPrint
    ) {
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("devices")
        .doc(myDeviceDetails.sendPrintToUserID.value)
        .collection("printRequests")
        .add({
          printData: data,
        });
    } else if (myDeviceDetails.printToPrinter) {
      qz.websocket
        .connect()
        .then(function () {
          if (!myDeviceDetails.printToPrinter) {
            alertP.error("You must specify a printer in device settings");
            return;
          }
          const config = qz.configs.create(myDeviceDetails.printToPrinter);
          return qz.print(config, data);
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
    } else {
      alertP.error(
        'Please set up a device and printer in "Settings -> Devices"'
      );
    }

    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("pendingOrders")
      .doc(currentOrder?.element?.id)
      .delete();
    if (!currentOrder.element) return;
    updateTransList(currentOrder.element);
    setcurrentOrder({ element: null, index: null, date: null });
  };

  const PayByCard = () => {
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("pendingOrders")
      .doc(currentOrder.element?.id)
      .delete();
    if (!currentOrder.element) return;
    updateTransList(currentOrder.element);
    setcurrentOrder({ element: null, index: null, date: null });
  };

  return (
    <div style={styles.container}>
      <span style={styles.title}>Payment Details</span>

      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Order Total</span>
        <span style={styles.totalValue}>
          ${parseFloat(total ?? "0").toFixed(2)}
        </span>
      </div>

      <div style={styles.fieldGroup}>
        <span style={styles.label}>Cash Received</span>
        <input
          style={styles.input}
          placeholder="Enter amount"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
        />
      </div>

      <div style={styles.changeDueRow}>
        <span style={styles.changeDueLabel}>Change Due</span>
        <span style={styles.changeDueValue}>
          $
          {isNaN(parseFloat(cash))
            ? -total
            : (parseFloat(total) - parseFloat(cash)).toFixed(2)}
        </span>
      </div>

      <div style={styles.divider} />

      <div style={styles.btnsGroup}>
        <button style={styles.payCashBtn} onClick={PayByCash}>
          Pay Cash
        </button>
        <button style={styles.payCardBtn} onClick={PayByCard}>
          Pay By Card
        </button>
        <button style={styles.cancelBtn} onClick={() => fadeOut(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: 28,
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
  btnsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  payCashBtn: {
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
  payCardBtn: {
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

export default FinishPaymentCash;
