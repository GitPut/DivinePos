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
      <span style={styles.paymentDetailsLabel}>Payment Details</span>
      <div style={styles.mainPartGroup}>
        <span style={styles.orderTotal}>
          Total: ${parseFloat(total ?? "0").toFixed(2)}
        </span>
        <input
          style={styles.amountPaidTxtInput}
          placeholder="Enter Cash Recieved"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
        />
        <div style={styles.changeDueRow}>
          <span style={styles.changeDue}>Change Due:</span>
          <span style={styles.changeDueValue}>
            $
            {isNaN(parseFloat(cash))
              ? -total
              : (parseFloat(total) - parseFloat(cash)).toFixed(2)}
          </span>
        </div>
      </div>
      <div style={styles.btnsGroup}>
        <button style={styles.finishPaymentBtn} onClick={PayByCash}>
          <span style={styles.finishPayment}>Finish Payment</span>
        </button>
        <button style={styles.payByCardBtn} onClick={PayByCard}>
          <span style={styles.payByCard}>Pay By Card</span>
        </button>
        <button style={styles.cancelBtn} onClick={() => fadeOut(false)}>
          <span style={styles.cancel}>Cancel</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    width: 540,
    height: 609,
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
    height: 185,
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
  payByCardBtn: {
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
  payByCard: {
    fontWeight: "700",
    color: "rgba(0,0,0,1)",
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

export default FinishPaymentCash;
