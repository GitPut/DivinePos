import React, { Suspense, useEffect, useState } from "react";
import {
  myDeviceDetailsState,
  setCustomersList,
  setDeviceIdState,
  setDeviceTreeState,
  setEmployeesState,
  setMyDeviceDetailsState,
  setOnlineStoreState,
  setStoreDetailState,
  setTrialDetailsState,
  setUserStoreState,
  setWoocommerceState,
  storeDetailState,
  trialDetailsState,
  woocommerceState,
} from "state/state";
import { auth, db } from "state/firebaseConfig";
import { updateFreeTrial } from "state/firebaseFunctions";
import { Image, View } from "react-native";
import qz from "qz-tray";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { useAlert } from "react-alert";
import { CustomerProp, Device, Employee, ProductProp } from "types/global";
import * as Font from "expo-font";
import {
  Feather,
  Entypo,
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  SimpleLineIcons,
} from "@expo/vector-icons";
import Loader from "components/Loader";
import useInterval from "components/functional/useInterval";
const NavigationContent = React.lazy(() => import("./NavigationContent"));
const NonAuthRoute = React.lazy(() => import("./non-authed/NonAuthRoute"));
const ScrollToTop = React.lazy(
  () => import("components/functional/ScrollToTop")
);

const RouteManager = () => {
  const savedUserState = JSON.parse(
    localStorage.getItem("savedUserState") as string
  );
  const [loading, setloading] = useState<boolean | null>(true);
  const [isNewUser, setisNewUser] = useState<boolean | null>(null);
  const [isSubscribed, setisSubscribed] = useState<boolean | null>(null);
  const [isCanceled, setisCanceled] = useState<boolean | null>(null);
  const wooCredentials = woocommerceState.use();
  const [wooOrders, setwooOrders] = useState([]);
  const [isWooError, setisWooError] = useState(false);
  const trialDetails = trialDetailsState.use();
  const myDeviceDetails = myDeviceDetailsState.use();
  const storeDetails = storeDetailState.use();
  const alertP = useAlert();

  async function preloadFonts() {
    await Font.loadAsync({
      // Load Feather and other fonts you use here
      ...Feather.font,
      ...Entypo.font,
      ...MaterialIcons.font,
      ...Ionicons.font,
      ...MaterialCommunityIcons.font,
      ...FontAwesome.font,
      ...SimpleLineIcons.font,
    });
  }

  useEffect(() => {
    console.log("Website updated");
    if (myDeviceDetails.docID && auth.currentUser) {
      // console.log("Listening for print requests");
      db.collection("users")
        .doc(auth.currentUser?.uid)
        .collection("devices")
        .doc(myDeviceDetails.docID)
        .collection("printRequests")
        .onSnapshot((snapshot) => {
          if (snapshot.empty) return;

          snapshot.forEach((doc) => {
            qz.websocket
              .connect()
              .then(function () {
                if (!myDeviceDetails.printToPrinter) {
                  alertP.error("You must specify a printer in device settings");
                  return;
                }
                const config = qz.configs.create(
                  myDeviceDetails.printToPrinter
                );
                return qz.print(config, doc.data()?.printData);
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
                } else if (
                  err.message.includes("Cannot find printer with name")
                ) {
                  alertP.error(
                    "Printer not found. Please check your printer settings."
                  );
                } else {
                  alertP.error(
                    "An error occured while trying to print. Try refreshing the page and trying again."
                  );
                }
              });
            //print then delete

            if (!myDeviceDetails.docID) return;

            db.collection("users")
              .doc(auth.currentUser?.uid)
              .collection("devices")
              .doc(myDeviceDetails.docID)
              .collection("printRequests")
              .doc(doc.id)
              .delete();
          });
        });
    }
  }, [myDeviceDetails]);

  const customSort = (a: ProductProp, b: ProductProp) => {
    // Handle cases where one or both items don't have a rank
    const rankA = parseInt(a.rank ?? "0") || Number.MAX_SAFE_INTEGER;
    const rankB = parseInt(b.rank ?? "0") || Number.MAX_SAFE_INTEGER;

    // Compare based on ranks
    return rankA - rankB;
  };

  useEffect(() => {
    const unsubscribeAuthStateChanged = auth.onAuthStateChanged((user) => {
      if (user) {
        localStorage.setItem("savedUserState", "true");

        db.collection("users")
          .doc(user.uid)
          .get()
          .then(async (doc) => {
            let extraDevicesPayingFor = 0;
            const products: ProductProp[] = [];

            await preloadFonts();

            await doc.ref
              .collection("products")
              .get()
              .then((docs) => {
                if (!docs.empty) {
                  docs.forEach((element) => {
                    const productData = element.data();

                    products.push({
                      ...productData,
                      name: productData.name,
                      price: productData.price,
                      description: productData.description,
                      options: productData.options,
                      id: productData.id,
                    });
                  });
                }
              })
              .catch(() =>
                // console.log("Error has occured with db products: ", e)
                alertP.error(
                  "An error has occured with starting up the app. Please refresh the page. 1"
                )
              );

            const sortedProducts = products.sort(customSort);

            setUserStoreState({
              products: sortedProducts,
              categories: doc.data()?.categories ? doc.data()?.categories : [],
            });

            if (doc.data()?.wooCredentials) {
              setWoocommerceState(doc.data()?.wooCredentials);
            }

            doc.ref
              .collection("wooOrders")
              .get()
              .then((docs) => {
                if (!docs.empty) {
                  docs.forEach((element) => {
                    setwooOrders((prev) => [...prev, element.data()]);
                  });
                }
              })
              .catch((e) =>
                console.log("Error has occured with db wooorders: ", e)
              );

            setloading(false);

            if (doc.data()?.storeDetails) {
              setStoreDetailState(doc.data()?.storeDetails);
            }

            await doc.ref
              .collection("employees")
              .get()
              .then((docs) => {
                if (!docs.empty) {
                  const localEmployees: Employee[] = [];
                  docs.forEach((element) => {
                    const employeeData = element.data();

                    localEmployees.push({
                      ...employeeData,
                      name: employeeData.name,
                      pin: employeeData.pin,
                      id: employeeData.id,
                    });
                  });
                  setEmployeesState(localEmployees);
                }
              })
              .catch((e) =>
                console.log("Error has occured with db employees: ", e)
              );

            await doc.ref
              .collection("subscriptions")
              .get()
              .then((docs) => {
                if (!docs.empty) {
                  console.log("Files: ", docs.docs);
                  docs.forEach((element) => {
                    console.log("SUBSCRIPTION ELEMENT: ", element.data());
                    if (element.data().role === "Extra Device") {
                      console.log("Extra device found");
                      if (element.data().status === "active") {
                        extraDevicesPayingFor += 1;
                      }
                    }

                    if (element.data().role === "Test Plan") {
                      if (element.data().status === "active") {
                        setisSubscribed(true);
                        setisNewUser(false);
                        if (doc.data()?.freeTrial) {
                          setTrialDetailsState({
                            endDate: null,
                            hasEnded: null,
                          });
                          updateFreeTrial(null);
                        }
                      } else if (element.data().status === "canceled") {
                        setisSubscribed(false);
                        setisNewUser(false);
                        setisCanceled(true);
                      } else {
                        setisSubscribed(false);
                        setisNewUser(false);
                      }
                    }

                    //if they are subscribed to pos plan
                    if (element.data().role === "Pos Software Plan") {
                      if (element.data().status === "active") {
                        setisSubscribed(true);
                        setisNewUser(false);
                        if (doc.data()?.freeTrial) {
                          setTrialDetailsState({
                            endDate: null,
                            hasEnded: null,
                          });
                          updateFreeTrial(null);
                        }
                      } else if (element.data().status === "canceled") {
                        setisSubscribed(false);
                        setisNewUser(false);
                        setisCanceled(true);
                      } else {
                        setisSubscribed(false);
                        setisNewUser(false);
                      }
                    }

                    //if they are subscribed to pos plan
                    if (element.data().role === "Premium Plan") {
                      if (element.data().status === "active") {
                        setisSubscribed(true);
                        setisNewUser(false);
                        setOnlineStoreState({
                          urlEnding: doc.data()?.urlEnding,
                          onlineStoreActive: doc.data()?.onlineStoreActive,
                          onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
                          stripePublicKey: doc.data()?.stripePublicKey,
                          stripeSecretKey: doc.data()?.stripeSecretKey,
                          paidStatus: "active",
                        });
                        extraDevicesPayingFor += 1;
                        if (doc.data()?.freeTrial) {
                          setTrialDetailsState({
                            endDate: null,
                            hasEnded: null,
                          });
                          updateFreeTrial(null);
                        }
                      } else if (element.data().status === "canceled") {
                        setisSubscribed(false);
                        setisNewUser(false);
                        setisCanceled(true);
                      } else {
                        setisSubscribed(false);
                        setisNewUser(false);
                      }
                    }

                    //if they are subscribed to online store
                    if (element.data().role === "Online Store") {
                      if (element.data().status === "active") {
                        setOnlineStoreState({
                          urlEnding: doc.data()?.urlEnding,
                          onlineStoreActive: doc.data()?.onlineStoreActive,
                          onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
                          stripePublicKey: doc.data()?.stripePublicKey,
                          stripeSecretKey: doc.data()?.stripeSecretKey,
                          paidStatus: "active",
                        });
                      } else if (element.data().status === "canceled") {
                        db.collection("users")
                          .doc(auth.currentUser?.uid)
                          .update({
                            onlineStoreActive: false,
                          });
                        db.collection("public")
                          .doc(auth.currentUser?.uid)
                          .update({
                            onlineStoreActive: false,
                          });
                        setOnlineStoreState({
                          urlEnding: doc.data()?.urlEnding,
                          onlineStoreActive: false,
                          onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
                          stripePublicKey: doc.data()?.stripePublicKey,
                          stripeSecretKey: doc.data()?.stripeSecretKey,
                          paidStatus: "canceled",
                        });
                      } else {
                        db.collection("users")
                          .doc(auth.currentUser?.uid)
                          .update({
                            onlineStoreActive: false,
                          });
                        db.collection("public")
                          .doc(auth.currentUser?.uid)
                          .update({
                            onlineStoreActive: false,
                          });
                        setOnlineStoreState({
                          urlEnding: doc.data()?.urlEnding,
                          onlineStoreActive: false,
                          onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
                          stripePublicKey: doc.data()?.stripePublicKey,
                          stripeSecretKey: doc.data()?.stripeSecretKey,
                          paidStatus: null,
                        });
                      }
                    }
                  });
                  // const devicesAmount = docs.docs.filter(
                  //   (e) =>
                  //     e.data().role === "Extra Device" &&
                  //     e.data().status === "active"
                  // ).length;
                  // extraDevicesPayingFor = devicesAmount;
                } else if (doc.data()?.freeTrial) {
                  setisSubscribed(true);
                  setisNewUser(false);
                } else {
                  setisNewUser(true);
                  setisSubscribed(false);
                }
              })
              .catch((e) =>
                // console.log("Error has occured with db extra devices")
                {
                  console.log("ERROR: ", e);
                  // alertP.error(
                  //   "An error has occured with starting up the app. Please refresh the page. 2"
                  // );
                }
              );

            await doc.ref
              .collection("customers")
              .get()
              .then((docs) => {
                const newCustomerList: CustomerProp[] = [];

                docs.forEach((element) => {
                  const customerData = element.data();

                  newCustomerList.push({
                    ...element.data(),
                    name: customerData.name,
                    phone: customerData.phone,
                    address: customerData.address,
                    buzzCode: customerData.buzzCode,
                    unitNumber: customerData.unitNumber,
                    orders: customerData.orders,
                    id: element.id,
                  });
                });

                setCustomersList(newCustomerList);
              })
              .catch(() =>
                // console.log("Error has occured with db customers: ", e)
                alertP.error(
                  "An error has occured with starting up the app. Please refresh the page. 3"
                )
              );

            if (doc.data()?.freeTrial) {
              setisNewUser(false);
              const firstDate = new Date(doc.data()?.freeTrial.seconds * 1000);
              const today = new Date();
              if (firstDate <= today) {
                setTrialDetailsState({
                  endDate: doc.data()?.freeTrial,
                  hasEnded: true,
                });
              } else {
                setTrialDetailsState({
                  endDate: doc.data()?.freeTrial,
                  hasEnded: false,
                });
              }
            }

            function getCookie(name: string) {
              const match = document.cookie.match(
                new RegExp("(^| )" + name + "=([^;]+)")
              );
              if (match) return match[2];
            }

            const deviceID = getCookie("deviceID");

            if (!deviceID) {
              // Generate a random device ID
              const yourDeviceID =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

              // Set a cookie
              document.cookie = `deviceID=${yourDeviceID}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;

              setDeviceIdState(yourDeviceID);
            } else {
              setDeviceIdState(deviceID);
            }

            await doc.ref
              .collection("devices")
              .get()
              .then((docs) => {
                const devices: Device[] = [];

                docs.forEach((element) => {
                  const deviceData = element.data();

                  devices.push({
                    ...element.data(),
                    name: deviceData.name,
                    id: deviceData.id,
                    docID: element.id,
                    useDifferentDeviceToPrint:
                      deviceData.useDifferentDeviceToPrint,
                    printToPrinter: deviceData.printToPrinter,
                    sendPrintToUserID: deviceData.sendPrintToUserID,
                    printOnlineOrders: deviceData.printOnlineOrders,
                  });

                  if (element.data().id === deviceID) {
                    setMyDeviceDetailsState({
                      ...element.data(),
                      name: deviceData.name,
                      id: deviceData.id,
                      docID: element.id,
                      useDifferentDeviceToPrint:
                        deviceData.useDifferentDeviceToPrint,
                      printToPrinter: deviceData.printToPrinter,
                      sendPrintToUserID: deviceData.sendPrintToUserID,
                      printOnlineOrders: deviceData.printOnlineOrders,
                    });
                  }
                });

                //tonys uid for extra devices
                // console.log("USER UID ", user.uid);
                if (user.uid == "J6rAf2opwnSKAhefbOZW6HJdx1h2") {
                  // console.log("Matches uid");
                  extraDevicesPayingFor = 3;
                }

                setDeviceTreeState({ devices: devices, extraDevicesPayingFor });
              });
          })
          .catch(() => {
            // console.log("Error has occured with db users: ", e)
            alertP.error(
              "An error has occured with starting up the app. Please refresh the page. 4"
            );
          });
      } else {
        localStorage.removeItem("savedUserState");
        setUserStoreState({ products: [], categories: [] });
        setisNewUser(false);
        setisSubscribed(false);
        setloading(false);
      }
    });

    return () => {
      unsubscribeAuthStateChanged();
    };
  }, [savedUserState]);

  useInterval(() => {
    if (
      wooCredentials.useWoocommerce &&
      isSubscribed &&
      !isWooError &&
      myDeviceDetails.printOnlineOrders
    ) {
      const WooCommerceAPI = require("woocommerce-api");

      const WooCommerce = new WooCommerceAPI({
        url: wooCredentials.apiUrl,
        consumerKey: wooCredentials.ck,
        consumerSecret: wooCredentials.cs,
        wpAPI: true,
        version: "wc/v3",
      });

      let page = 1;
      let orders = [];

      const getOrders = async () => {
        const response = await WooCommerce.getAsync(
          `orders?page=${page}&per_page=100`
        );
        const data = JSON.parse(response.body);
        orders = [...orders, ...data];
        if (data.length === 100) {
          page++;
          getOrders();
        } else {
          //console.log("WOO ORDERS: ", orders);
        }
        // console.log("WOO ORDERS: ", orders);
      };

      getOrders()
        .then(() => {
          if (JSON.stringify(orders) === JSON.stringify(wooOrders)) return;
          for (let index = 0; index < orders.length; index++) {
            const order = orders[index];
            let orderIndex;
            if (wooOrders.length > 0) {
              orderIndex = wooOrders.findIndex((e) => e.id === order.id);
            } else {
              orderIndex = -1;
            }

            if (orderIndex === -1 || !wooOrders[orderIndex].printed) {
              if (orderIndex === -1) {
                db.collection("users")
                  .doc(userS.uid)
                  .collection("wooOrders")
                  .doc(order.id.toString())
                  .set({ ...order, printed: true })
                  .then(() => {
                    setwooOrders((prev) => [
                      ...prev,
                      { ...order, printed: true },
                    ]);
                    wooOrders.push({ ...order, printed: true });
                  })
                  .catch((e) =>
                    console.log(
                      "Error has occured with db wooOrders print: ",
                      e
                    )
                  );
              } else {
                db.collection("users")
                  .doc(userS.uid)
                  .collection("wooOrders")
                  .doc(order.id.toString())
                  .update({ printed: true })
                  .then(() => {
                    setwooOrders((prev) => {
                      const newOrders = [...prev];
                      newOrders[orderIndex].printed = true;
                      return newOrders;
                    });
                    wooOrders[index].printed = true;
                  })
                  .catch((e) =>
                    console.log(
                      "Error has occured with db wooOrder print second if: ",
                      e
                    )
                  );
              }

              const CleanupOps = (metaList) => {
                const opsArray = [];

                metaList.forEach((op) => {
                  const arrContaingMe = opsArray.filter(
                    (filterOp) => filterOp.key === op.key
                  );

                  if (arrContaingMe.length > 0) {
                    opsArray.forEach((opsArrItem, index) => {
                      if (opsArrItem.key === op.key) {
                        opsArray[index].vals.push(op.value);
                      }
                    });
                  } else {
                    opsArray.push({ key: op.key, vals: [op.value] });
                  }
                });
                return opsArray;
              };

              const printData = [];
              const dateString = order.date_created;
              const newDate = new Date(dateString + "Z");
              const targetTimezone =
                Intl.DateTimeFormat().resolvedOptions().timeZone;
              const resultDate = tz(newDate)
                .tz(targetTimezone, true)
                .format("dddd, MMMM Do YYYY, h:mm:ss a z");

              printData.push(
                "\x1B" + "\x40", // init
                "\x1B" + "\x61" + "\x31", // center align
                storeDetails.name,
                "\x0A",
                storeDetails.address?.label + "\x0A",
                storeDetails.website + "\x0A", // text and line break
                storeDetails.phoneNumber + "\x0A", // text and line break
                resultDate + "\x0A",
                "\x0A",
                "Online Order" + "\x0A", // text and line break
                `Transaction ID ${order.number}` + "\x0A",
                "\x0A",
                "\x0A",
                "\x0A",
                "\x1B" + "\x61" + "\x30" // left align
              );

              order.line_items?.map((cartItem) => {
                printData.push("\x0A");
                printData.push(`Name: ${cartItem.name}`);
                printData.push("\x0A");
                printData.push(`Quantity: ${cartItem.quantity}`);
                printData.push("\x0A");
                printData.push(`Price: $${cartItem.price}`);
                printData.push("\x0A");

                if (cartItem.meta) {
                  CleanupOps(cartItem.meta).map((returnedItem) => {
                    printData.push(`${returnedItem.key} : `);
                    printData.push("\x0A");
                    returnedItem.vals.map((val, index) => {
                      printData.push(`${val}`);
                      printData.push("\x0A");
                      if (index >= 0 && index < returnedItem.vals.length - 1) {
                        printData.push(", ");
                      }
                    });
                    printData.push("\x0A");
                  });
                } else {
                  printData.push("\x0A" + "\x0A");
                }
              });

              printData.push("\x0A");
              printData.push("\x0A");
              printData.push(`Customer Details:`);
              printData.push("\x0A");
              printData.push(`Address: ${order.shipping.address_1}`);
              printData.push("\x0A");
              printData.push(`City: ${order.shipping.city}`);
              printData.push("\x0A");
              printData.push(`Zip/Postal Code: ${order.shipping.postcode}`);
              printData.push("\x0A");
              printData.push(`Province/State: ${order.shipping.state}`);
              printData.push("\x0A");
              printData.push(
                `Name: ${order.shipping.first_name} ${order.shipping.last_name}`
              );
              printData.push("\x0A");
              printData.push(`Phone Number: ${order.billing.phone}`);
              printData.push("\x0A");
              order.shipping_lines.map((line) => {
                printData.push(`Shipping Method: ${line.method_title}`);
                printData.push("\x0A");
              });
              if (order.customer_note) {
                printData.push(`Customer Note: ${order.customer_note}`);
                printData.push("\x0A");
              }
              printData.push("\x0A");
              printData.push("\x0A");

              printData.push(
                "\x0A",
                "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
                "\x0A" + "\x0A",
                "Payment Method: " +
                  order.payment_method_title +
                  "\x0A" +
                  "\x0A",
                `Total Including (${
                  storeDetails.taxRate >= 0 ? storeDetails.taxRate : "13"
                }% Tax): ` +
                  "$" +
                  order.total +
                  "\x0A" +
                  "\x0A",
                "------------------------------------------" + "\x0A",
                "\x0A", // line break
                "\x0A", // line break
                "\x0A", // line break
                "\x0A", // line break
                "\x0A", // line break
                "\x0A" // line break
              );

              printData.push("\x1D" + "\x56" + "\x00");

              const doublePrint = printData.concat(printData);

              qz.websocket
                .connect()
                .then(function () {
                  const config = qz.configs.create(
                    myDeviceDetails.printToPrinter
                  );
                  return qz.print(config, doublePrint);
                })
                .then(qz.websocket.disconnect)
                .catch(function (err) {
                  if (
                    err.message.includes(
                      "A printer must be specified before printing"
                    )
                  ) {
                    alertP.error(
                      "You must specify a printer in device settings"
                    );
                  } else if (
                    err.message.includes(
                      "Unable to establish connection with QZ"
                    )
                  ) {
                    alertP.error(
                      "You do not have Divine POS Helper installed. Please download from general settings"
                    );
                  } else if (
                    err.message.includes("Cannot find printer with name")
                  ) {
                    alertP.error(
                      "Printer not found. Please check your printer settings."
                    );
                  } else {
                    alertP.error(
                      "An error occured while trying to print. Try refreshing the page and trying again."
                    );
                  }
                });
            }
          }
        })
        .catch((e) => {
          console.log("Error has occured when trying to get WooOrders: ", e);
          alertP.error(
            "There was an error connecting to your woocommerce store. Please refresh the page to try again."
          );
          setisWooError(true);
        });
    }
  }, 10000);

  // Return the loader while loading is true
  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <ScrollToTop />
        {auth.currentUser && !loading && (
          <NavigationContent
            isNewUser={isNewUser ?? false}
            isCanceled={isCanceled ?? false}
            isSubscribed={isSubscribed ?? false}
            trialDetails={trialDetails ?? { hasEnded: false }}
          />
        )}
        {!auth.currentUser && !loading && (
          <Route path="/" component={NonAuthRoute} />
        )}
      </Suspense>
    </Router>
  );
};

export default RouteManager;
