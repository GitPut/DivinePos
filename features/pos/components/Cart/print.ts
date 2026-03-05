import { receiptPrint } from "services/printing/receiptPrint";
import { auth, db } from "services/firebase/config";
import { resetPosState, updatePosState } from "store/posState";
import { setCartState, setCustomersState } from "store/appState";
import qz from "qz-tray";
import {
  AddressType,
  CartItemProp,
  CustomerProp,
  CustomersOrdersProp,
  MyDeviceDetailsProps,
  StoreDetailsProps,
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
  printData: any[],
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
    let newVal = 0;
    const finalCart = cart;
    for (let i = 0; i < cart.length; i++) {
      const element = cart[i];
      const quantity = parseFloat(element.quantity ?? "1");
      try {
        newVal += parseFloat(cart[i].price) * quantity;
      } catch (error) {
      }
    }
    if (deliveryChecked) {
      newVal += parseFloat(storeDetails.deliveryPrice);
    }

    if (discountAmount) {
      if (discountAmount.includes("%")) {
        const discount = parseFloat(discountAmount.replace("%", "")) / 100;
        finalCart.push({
          name: "Cart Discount: " + discount * 100 + "%",
          price: (-(newVal * discount)).toString(),
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
      const newCustomers = structuredClone(customers);
      newCustomers[indexOfCustomer].orders = newOrders;
      setCustomersState(newCustomers);
    }

    const transNum = Math.random().toString(36).substr(2, 9);

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
  }
};

export default Print;
