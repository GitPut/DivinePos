import { receiptPrint } from "services/printing/receiptPrint";
import { auth, db } from "services/firebase/config";
import { posState, resetPosState, updatePosState } from "store/posState";
import { setCartState, setCustomersState } from "store/appState";
import { updateTransList } from "services/firebase/functions";
import { calculateCartTotals } from "utils/cartCalculations";
import qz from "qz-tray";
import {
  AddressType,
  CartItemProp,
  CustomerProp,
  CustomersOrdersProp,
  MyDeviceDetailsProps,
  StoreDetailsProps,
  TransListStateItem,
} from "types";
import firebase from "firebase/compat/app";

interface PrintProps {
  dontAddToOngoing: boolean;
  method?: "deliveryOrder" | "pickupOrder" | "inStoreOrder" | "Card" | "Cash";
  discountAmount: string | null;
  deliveryChecked: boolean;
  changeDue: string;
  savedCustomerDetails: {
    id: string;
    orders: CustomersOrdersProp[];
  } | null;
  name: string;
  phone: string;
  address?: AddressType | null;
  buzzCode?: string | null;
  unitNumber?: string | null;
  cartNote: string;
  customers: CustomerProp[];
  cart: CartItemProp[];
  storeDetails: StoreDetailsProps;
  myDeviceDetails: MyDeviceDetailsProps;
}

const handleQzError = (err: Error) => {
  if (err.message.includes("A printer must be specified before printing")) {
    alert("You must specify a printer in device settings");
  } else if (err.message.includes("Unable to establish connection with QZ")) {
    alert(
      "You do not have Divine POS Helper installed. Please download from general settings"
    );
  } else if (err.message.includes("Cannot find printer with name")) {
    alert("Printer not found. Please check your printer settings.");
  } else {
    alert(
      "An error occured while trying to print. Try refreshing the page and trying again."
    );
  }
};

const printOrSend = (
  printData: string[],
  myDeviceDetails: MyDeviceDetailsProps
) => {
  if (
    myDeviceDetails.sendPrintToUserID &&
    myDeviceDetails.useDifferentDeviceToPrint
  ) {
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("devices")
      .doc(myDeviceDetails.sendPrintToUserID.value)
      .collection("printRequests")
      .add({ printData })
      .catch(() => alert("Failed to send print request to other device."));
  } else {
    qz.websocket
      .connect()
      .then(function () {
        if (!myDeviceDetails.printToPrinter) {
          alert("You must specify a printer in device settings");
          return;
        }
        const config = qz.configs.create(myDeviceDetails.printToPrinter);
        return qz.print(config, printData);
      })
      .then(qz.websocket.disconnect)
      .catch(handleQzError);
  }
};

const Print = ({ ...props }: PrintProps) => {
  const {
    dontAddToOngoing,
    method,
    discountAmount,
    deliveryChecked,
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
  } = props;

  try {
    const totals = calculateCartTotals(
      cart,
      storeDetails.taxRate,
      storeDetails.deliveryPrice,
      deliveryChecked
    );

    const finalCart = cart;

    if (discountAmount) {
      if (discountAmount.includes("%")) {
        const discount = parseFloat(discountAmount.replace("%", "")) / 100;
        finalCart.push({
          name: "Cart Discount: " + discount * 100 + "%",
          price: (-(totals.itemsSubtotal * discount)).toString(),
          description: "Discount Applied to Cart",
          options: [],
          extraDetails: null,
          quantityNotChangable: true,
          percent: discount.toString(),
        });
      } else {
        finalCart.push({
          name: "Cart Discount: " + discountAmount,
          price: (-parseFloat(discountAmount)).toString(),
          description: "Discount Applied to Cart",
          options: [],
          extraDetails: null,
          quantityNotChangable: true,
        });
      }
    }

    if (!myDeviceDetails.id) {
      return alert("Please set up a device in Settings -> Devices");
    }

    if (savedCustomerDetails) {
      const newOrders = savedCustomerDetails.orders?.length > 0
        ? [...savedCustomerDetails.orders, { cart: finalCart }]
        : [{ cart: finalCart }];

      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("customers")
        .doc(savedCustomerDetails.id)
        .update({ orders: newOrders })
        .catch(() => alert("Failed to update customer order history."));

      const indexOfCustomer = customers.findIndex(
        (customer) => customer.id === savedCustomerDetails.id
      );
      if (indexOfCustomer >= 0) {
        const newCustomers = structuredClone(customers);
        newCustomers[indexOfCustomer].orders = newOrders;
        setCustomersState(newCustomers);
      }
    }

    const transNum = Math.random().toString(36).substr(2, 9);

    // Handle table order final payment — process payment, free table
    const { activeTableSessionId, activeTableId, ongoingListState } = posState.get();
    if (activeTableSessionId) {
      const tableSession = ongoingListState.find(
        (o) => o.id === activeTableSessionId
      );
      const today = firebase.firestore.Timestamp.now();

      const element: TransListStateItem = {
        cartNote: cartNote,
        date: tableSession?.date || today,
        transNum: tableSession?.transNum || transNum,
        method: "tableOrder",
        cart: finalCart,
        customer: {
          name: name || "",
          phone: phone || "",
        },
        changeDue: changeDue,
        paymentMethod: method === "Cash" ? "Cash" : "Card",
        id: tableSession?.transNum || transNum,
        tableName: tableSession?.tableName,
        tableNumber: tableSession?.tableNumber,
        guests: tableSession?.guests,
        server: tableSession?.server,
        seatedAt: tableSession?.seatedAt,
      };

      const data = receiptPrint(element, storeDetails);
      printOrSend(data.data, myDeviceDetails);

      // Delete the pending order
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .doc(activeTableSessionId)
        .delete()
        .catch(() => {});

      // Add to completed transactions
      updateTransList({
        ...element,
        total: data.total.toFixed(2),
        date: today,
        dateCompleted: today,
      }).catch(() => {});

      setCartState([]);
      resetPosState();
      updatePosState({ tableViewActive: true });
      return;
    }

    if (method === "deliveryOrder") {
      const today = firebase.firestore.Timestamp.now();

      const element = {
        cartNote: cartNote,
        date: today,
        transNum: transNum,
        method: method,
        cart: finalCart,
        customer: {
          name: name,
          phone: phone,
          address: address ?? null,
          buzzCode: buzzCode ?? null,
          unitNumber: unitNumber ?? null,
        },
        id: transNum,
      };

      const data = receiptPrint(element, storeDetails);

      if (!dontAddToOngoing) {
        db.collection("users")
          .doc(auth.currentUser?.uid)
          .collection("pendingOrders")
          .add({
            date: today,
            transNum: transNum,
            method: "deliveryOrder",
            cart: finalCart,
            cartNote: cartNote,
            total: data.total.toFixed(2),
            customer: {
              name: name ?? null,
              phone: phone ?? null,
              address: address ?? null,
              buzzCode: buzzCode ?? null,
              unitNumber: unitNumber ?? null,
            },
            online: false,
          })
          .catch(() => alert("Failed to save pending order."));
      }

      printOrSend(data.data, myDeviceDetails);

      setCartState([]);
      updatePosState({
        discountAmount: null,
        deliveryModal: false,
      });
    } else if (method === "pickupOrder") {
      const today = firebase.firestore.Timestamp.now();

      const element = {
        cartNote: cartNote,
        date: today,
        transNum: transNum,
        method: method,
        cart: finalCart,
        customer: {
          name: name,
          phone: phone,
        },
        id: transNum,
      };

      const data = receiptPrint(element, storeDetails);

      if (!dontAddToOngoing) {
        db.collection("users")
          .doc(auth.currentUser?.uid)
          .collection("pendingOrders")
          .add({
            date: today,
            transNum: transNum,
            method: "pickupOrder",
            cart: finalCart,
            cartNote: cartNote,
            total: data.total.toFixed(2),
            customer: {
              name: name ?? null,
              phone: phone ?? null,
              address: address ?? null,
              buzzCode: buzzCode ?? null,
              unitNumber: unitNumber ?? null,
            },
            online: false,
          })
          .catch(() => alert("Failed to save pending order."));
      }

      printOrSend(data.data, myDeviceDetails);

      setCartState([]);
      resetPosState();
    } else {
      const today = firebase.firestore.Timestamp.now();
      const element = {
        cartNote: cartNote,
        date: today,
        transNum: transNum,
        method: "inStoreOrder" as const,
        cart: finalCart,
        customer: {
          name: name,
          phone: phone,
          address: address ?? null,
          buzzCode: buzzCode ?? null,
          unitNumber: unitNumber ?? null,
        },
        changeDue: changeDue,
        paymentMethod: method,
        id: transNum,
      };

      const data = receiptPrint(element, storeDetails);

      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("pendingOrders")
        .add({
          date: today,
          transNum: transNum,
          method: "inStoreOrder",
          paymentMethod: method,
          cart: finalCart,
          cartNote: cartNote,
          total: data.total.toFixed(2),
          customer: {
            name: name ?? null,
            phone: phone ?? null,
            address: address ?? null,
            buzzCode: buzzCode ?? null,
            unitNumber: unitNumber ?? null,
          },
          online: false,
        })
        .catch(() => alert("Failed to save pending order."));

      printOrSend(data.data, myDeviceDetails);
    }

    setCartState([]);
    resetPosState();
  } catch (error) {
    console.error("Print/order error:", error);
    alert("An error occurred while processing the order. Please try again.");
  }
};

export default Print;

/** Send only NEW (unsent) items to the kitchen. Table stays active. */
export const sendTableOrder = async (props: {
  cart: CartItemProp[];
  storeDetails: StoreDetailsProps;
  myDeviceDetails: MyDeviceDetailsProps;
  cartNote: string;
}) => {
  const { cart, storeDetails, myDeviceDetails, cartNote } = props;
  const { activeTableSessionId, ongoingListState } = posState.get();

  if (!activeTableSessionId || !auth.currentUser) return;

  const tableSession = ongoingListState.find(
    (o) => o.id === activeTableSessionId
  );

  // Find items not yet sent to kitchen
  const unsentItems = cart.filter((item) => !item.sent);
  if (unsentItems.length === 0) return;

  // Mark all items as sent
  const savedCart = cart.map((item) => ({ ...item, sent: true }));

  // Print kitchen ticket with only the new items
  const element: TransListStateItem = {
    cartNote,
    date: tableSession?.date || firebase.firestore.Timestamp.now(),
    transNum: tableSession?.transNum || "",
    method: "tableOrder",
    cart: unsentItems,
    customer: { name: "", phone: "" },
    id: tableSession?.transNum || "",
    tableName: tableSession?.tableName,
    tableNumber: tableSession?.tableNumber,
    server: tableSession?.server,
    guests: tableSession?.guests,
  };

  const data = receiptPrint(element, storeDetails);
  printOrSend(data.data, myDeviceDetails);

  // Calculate full cart total for the pending order
  const totals = calculateCartTotals(cart, storeDetails.taxRate, storeDetails.deliveryPrice, false);

  // Save cart to pending order — await to ensure write completes before clearing state
  try {
    await db
      .collection("users")
      .doc(auth.currentUser?.uid)
      .collection("pendingOrders")
      .doc(activeTableSessionId)
      .update({
        cart: savedCart,
        cartNote,
        total: totals.itemsSubtotal.toFixed(2),
      });
  } catch {
    alert("Failed to send order.");
    return;
  }

  // Clear cart and go back to table view
  setCartState([]);
  resetPosState();
  updatePosState({ tableViewActive: true });
};
