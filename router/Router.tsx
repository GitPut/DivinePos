import React, { Suspense, useEffect, useState } from "react";
import {
  deviceState,
  setCustomersState,
  setDeviceIdState,
  setDeviceTreeState,
  setDeviceState,
  setEmployeesState,
  setIngredientsState,
  setOnlineStoreState,
  setStoreDetailsState,
  setTablesState,
  setTableSectionsState,
  setTrialDetailsState,
  setStoreProductsState,
  setWooCommerceState,
  setActivePlanState,
  storeDetailsState,
  trialDetailsState,
  wooCommerceState,
} from "store/appState";
import { updatePosState } from "store/posState";
import { auth, db } from "services/firebase/config";
import { updateFreeTrial } from "services/firebase/functions";
import receiptPrint from "services/printing/receiptPrint";
import WooCommerceAPI from "woocommerce-api";
import tz from "moment-timezone";
import qz from "qz-tray";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { useAlert } from "react-alert";
import { CustomerProp, Device, Employee, Ingredient, ProductProp, TransListStateItem } from "types";
import useInterval from "shared/hooks/useInterval";
import { prefetchImage } from "shared/components/ui/ProductImage";
import { parseDate } from "utils/dateFormatting";
import { logSystemEvent } from "services/firebase/systemLogging";
import Loader from "shared/components/ui/Loader";
const NavigationContent = React.lazy(() => import("./NavigationContent"));
const PublicRoute = React.lazy(() => import("./PublicRoute"));
const ScrollToTop = React.lazy(() => import("utils/scrollToTop"));

const AppRouter = () => {
  const savedUserState = JSON.parse(
    localStorage.getItem("savedUserState") as string
  );
  const [loading, setloading] = useState<boolean | null>(true);
  const [isNewUser, setisNewUser] = useState<boolean | null>(null);
  const [isSubscribed, setisSubscribed] = useState<boolean | null>(null);
  const [isCanceled, setisCanceled] = useState<boolean | null>(null);
  const wooCredentials = wooCommerceState.use();
  const [wooOrders, setwooOrders] = useState<any[]>([]);
  const [wooErrorCount, setWooErrorCount] = useState(0);
  const trialDetails = trialDetailsState.use();
  const myDeviceDetails = deviceState.use();
  const storeDetails = storeDetailsState.use();
  const alertP = useAlert();

  // ─── Print Listener ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!myDeviceDetails.docID || !auth.currentUser) return;

    const unsubscribe = db
      .collection("users")
      .doc(auth.currentUser.uid)
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
              const config = qz.configs.create(myDeviceDetails.printToPrinter);
              return qz.print(config, doc.data()?.printData);
            })
            .then(qz.websocket.disconnect)
            .catch(function (err: Error) {
              if (err.message.includes("A printer must be specified before printing")) {
                alertP.error("You must specify a printer in device settings");
              } else if (err.message.includes("Unable to establish connection with QZ")) {
                alertP.error(
                  "You do not have Divine POS Helper installed. Please download from general settings"
                );
              } else if (err.message.includes("Cannot find printer with name")) {
                alertP.error("Printer not found. Please check your printer settings.");
              } else {
                alertP.error(
                  "An error occured while trying to print. Try refreshing the page and trying again."
                );
              }
            });

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

    return () => unsubscribe();
  }, [myDeviceDetails]);

  // ─── Pending Orders Listener (started early so data is ready for POS) ───
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsub = db
      .collection("users")
      .doc(auth.currentUser.uid)
      .collection("pendingOrders")
      .onSnapshot((snapshot) => {
        const list: TransListStateItem[] = [];
        const printBatch = db.batch();
        let hasPrintUpdates = false;

        snapshot.forEach((doc) => {
          list.push({
            ...doc.data(),
            id: doc.id,
            cart: doc.data().cart,
            cartNote: doc.data().cartNote,
            customer: doc.data().customer,
            date: doc.data().date,
            method: doc.data().method,
            online: doc.data().online,
            isInStoreOrder: doc.data().method === "inStoreOrder" || doc.data().method === "tableOrder",
            transNum: doc.data().transNum || "",
            tableId: doc.data().tableId,
            tableName: doc.data().tableName,
            tableNumber: doc.data().tableNumber,
            guests: doc.data().guests,
            server: doc.data().server,
            seatedAt: doc.data().seatedAt,
          });
          if (
            doc.data().online &&
            !doc.data().printed &&
            myDeviceDetails.printOnlineOrders
          ) {
            const data = receiptPrint(
              {
                ...doc.data(),
                cart: doc.data().cart,
                cartNote: doc.data().cartNote,
                date: doc.data().date,
                method: doc.data().method,
                paymentMethod: doc.data().paymentMethod,
                total: doc.data().total,
                transNum: doc.data().transNum,
                id: doc.data().id,
              },
              storeDetails
            );
            qz.websocket
              .connect()
              .then(function () {
                if (!myDeviceDetails.printToPrinter) {
                  alertP.error("You must specify a printer in device settings");
                  return;
                }
                const config = qz.configs.create(myDeviceDetails.printToPrinter);
                return qz.print(config, data.data);
              })
              .then(qz.websocket.disconnect)
              .catch(function (err: Error) {
                if (err.message.includes("A printer must be specified before printing")) {
                  alertP.error("You must specify a printer in device settings");
                } else if (err.message.includes("Unable to establish connection with QZ")) {
                  alertP.error(
                    "You do not have Divine POS Helper installed. Please download from general settings"
                  );
                } else if (err.message.includes("Cannot find printer with name")) {
                  alertP.error("Printer not found. Please check your printer settings.");
                } else {
                  alertP.error(
                    "An error occured while trying to print. Try refreshing the page and trying again."
                  );
                }
              });
            printBatch.update(doc.ref, { printed: true });
            hasPrintUpdates = true;
          }
        });

        if (hasPrintUpdates) {
          printBatch.commit().catch(() => {});
        }

        const sortedArray = list.sort((a, b) => {
          const parsedDateA = parseDate(a.date);
          const parsedDateB = parseDate(b.date);
          const dateA = parsedDateA ? parsedDateA.getTime() : 0;
          const dateB = parsedDateB ? parsedDateB.getTime() : 0;
          return dateB - dateA;
        });

        updatePosState({ ongoingListState: sortedArray });
      });

    return () => unsub();
  }, [myDeviceDetails, storeDetails]);

  // ─── Sort helper ─────────────────────────────────────────────────────────
  const sortByRank = (a: ProductProp, b: ProductProp) => {
    const rankA = parseInt(a.rank ?? "0") || Number.MAX_SAFE_INTEGER;
    const rankB = parseInt(b.rank ?? "0") || Number.MAX_SAFE_INTEGER;
    return rankA - rankB;
  };

  // ─── App Bootstrap ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        localStorage.removeItem("savedUserState");
        setStoreProductsState({ products: [], categories: [] });
        setisNewUser(false);
        setisSubscribed(false);
        setloading(false);
        return;
      }

      localStorage.setItem("savedUserState", "true");

      // Log login event (once per browser session to avoid duplicates on refresh)
      if (!sessionStorage.getItem("loginLogged")) {
        logSystemEvent("login");
        sessionStorage.setItem("loginLogged", "true");
      }

      try {
        const userRef = db.collection("users").doc(user.uid);

        // Preload route chunks in background while Firebase data loads
        import("./NavigationContent");
        import("./AuthRoute");
        import("features/pos/PosScreen");

        // Fetch user doc AND all subcollections in parallel (1 round-trip)
        const [doc, productDocs, employeeDocs, subDocs, customerDocs, deviceDocs, wooDocs, ingredientDocs] = await Promise.all([
          userRef.get(),
          userRef.collection("products").get().catch(() => null),
          userRef.collection("employees").get().catch(() => null),
          userRef.collection("subscriptions").get().catch(() => null),
          userRef.collection("customers").get().catch(() => null),
          userRef.collection("devices").get().catch(() => null),
          userRef.collection("wooOrders").get().catch(() => null),
          userRef.collection("ingredients").get().catch(() => null),
        ]);

        // ── Process products ──────────────────────────────────────────────
        const products: ProductProp[] = [];
        if (productDocs && !productDocs.empty) {
          productDocs.forEach((element) => {
            const d = element.data();
            products.push({
              ...d,
              name: d.name,
              price: d.price,
              description: d.description,
              options: d.options,
              id: d.id,
            });
          });
        }

        const sortedProducts = products.sort(sortByRank);

        setStoreProductsState({
          products: sortedProducts,
          categories: doc.data()?.categories ?? [],
        });

        // Fire-and-forget image prefetch — don't block loading screen.
        // ProductImage handles uncached images with skeleton → fade-in.
        Promise.all(
          sortedProducts
            .filter((p) => p.imageUrl)
            .map((p) => prefetchImage(p.imageUrl!))
        );

        // ── Process store details (BEFORE dismissing loading screen) ──────
        if (doc.data()?.storeDetails) {
          setStoreDetailsState(doc.data()?.storeDetails);
        }

        if (doc.data()?.wooCredentials) {
          setWooCommerceState(doc.data()?.wooCredentials);
        }


        // ── Load tables config ──────────────────────────────────────────
        const docData = doc.data();
        if (docData?.tables) {
          setTablesState(docData.tables);
        }
        if (docData?.tableSections) {
          setTableSectionsState(docData.tableSections);
        }

        // ── Process WooCommerce orders ────────────────────────────────────
        if (wooDocs && !wooDocs.empty) {
          const wooData: any[] = [];
          wooDocs.forEach((element) => {
            wooData.push(element.data());
          });
          setwooOrders(wooData);
        }

        // ── Process employees ─────────────────────────────────────────────
        if (employeeDocs && !employeeDocs.empty) {
          const localEmployees: Employee[] = [];
          employeeDocs.forEach((element) => {
            const d = element.data();
            localEmployees.push({ ...d, name: d.name, pin: d.pin, id: d.id });
          });
          setEmployeesState(localEmployees);
        }

        // ── Process subscriptions ─────────────────────────────────────────
        if (subDocs && !subDocs.empty) {
          let onlineStoreGrantedByPlan = false;

          for (const element of subDocs.docs) {
            const sub = element.data();

            // Starter plan (also backward-compat with old "Test Plan" / "Pos Software Plan")
            if (sub.role === "Starter Plan" || sub.role === "Test Plan" || sub.role === "Pos Software Plan") {
              if (sub.status === "active") {
                setisSubscribed(true);
                setisNewUser(false);
                setActivePlanState("starter");
                if (doc.data()?.freeTrial) {
                  setTrialDetailsState({ endDate: null, hasEnded: null });
                  updateFreeTrial(null);
                }
              } else if (sub.status === "canceled") {
                setisSubscribed(false);
                setisNewUser(false);
                setisCanceled(true);
              } else {
                setisSubscribed(false);
                setisNewUser(false);
              }
            }

            // Professional plan (also backward-compat with old "Premium Plan")
            // Includes online store access + unlimited devices
            if (sub.role === "Professional Plan" || sub.role === "Premium Plan") {
              if (sub.status === "active") {
                setisSubscribed(true);
                setisNewUser(false);
                setActivePlanState("professional");
                onlineStoreGrantedByPlan = true;
                setOnlineStoreState({
                  urlEnding: doc.data()?.urlEnding,
                  onlineStoreActive: doc.data()?.onlineStoreActive,
                  onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
                  stripePublicKey: doc.data()?.stripePublicKey,
                  stripeSecretKey: doc.data()?.stripeSecretKey,
                  paidStatus: "active",
                });
                if (doc.data()?.freeTrial) {
                  setTrialDetailsState({ endDate: null, hasEnded: null });
                  updateFreeTrial(null);
                }
              } else if (sub.status === "canceled") {
                setisSubscribed(false);
                setisNewUser(false);
                setisCanceled(true);
              } else {
                setisSubscribed(false);
                setisNewUser(false);
              }
            }

            if (sub.role === "Online Store") {
              if (sub.status !== "canceled") {
                // Any non-canceled status (active, trialing, past_due, etc.) grants access
                onlineStoreGrantedByPlan = true;
              }
            }
          }

          // After processing ALL subscriptions, set online store state
          if (onlineStoreGrantedByPlan) {
            setOnlineStoreState({
              urlEnding: doc.data()?.urlEnding,
              onlineStoreActive: doc.data()?.onlineStoreActive,
              onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
              stripePublicKey: doc.data()?.stripePublicKey,
              stripeSecretKey: doc.data()?.stripeSecretKey,
              paidStatus: "active",
            });
          } else {
            // No plan grants online store access — deactivate
            const batch = db.batch();
            batch.update(db.collection("users").doc(user.uid), { onlineStoreActive: false });
            batch.update(db.collection("public").doc(user.uid), { onlineStoreActive: false });
            batch.commit().catch(() => {});
            setOnlineStoreState({
              urlEnding: doc.data()?.urlEnding,
              onlineStoreActive: false,
              onlineStoreSetUp: doc.data()?.onlineStoreSetUp,
              stripePublicKey: doc.data()?.stripePublicKey,
              stripeSecretKey: doc.data()?.stripeSecretKey,
              paidStatus: "canceled",
            });
          }
        } else if (doc.data()?.freeTrial) {
          setisSubscribed(true);
          setisNewUser(false);
          setActivePlanState("trial");
        } else {
          setisNewUser(true);
          setisSubscribed(false);
        }

        // ── Process customers ─────────────────────────────────────────────
        if (customerDocs && !customerDocs.empty) {
          const customers: CustomerProp[] = [];
          customerDocs.forEach((element) => {
            const d = element.data();
            customers.push({
              ...d,
              name: d.name,
              phone: d.phone,
              address: d.address,
              buzzCode: d.buzzCode,
              unitNumber: d.unitNumber,
              orders: d.orders,
              id: element.id,
            });
          });
          setCustomersState(customers);
        }

        // ── Process ingredients ─────────────────────────────────────────
        if (ingredientDocs && !ingredientDocs.empty) {
          const ingredientsList: Ingredient[] = [];
          ingredientDocs.forEach((element) => {
            const d = element.data();
            ingredientsList.push({
              id: element.id,
              name: d.name ?? "",
              unit: d.unit ?? "count",
              stockQuantity: d.stockQuantity ?? 0,
              lowStockThreshold: d.lowStockThreshold ?? 0,
              costPerUnit: d.costPerUnit ?? "0",
              category: d.category ?? null,
            });
          });
          setIngredientsState(ingredientsList);
        }

        // ── Handle free trial status ──────────────────────────────────────
        if (doc.data()?.freeTrial) {
          setisNewUser(false);
          const trialEnd = new Date(doc.data()?.freeTrial.seconds * 1000);
          const today = new Date();
          setTrialDetailsState({
            endDate: doc.data()?.freeTrial,
            hasEnded: trialEnd <= today,
          });
        }

        // ── Resolve device ID from cookie ─────────────────────────────────
        function getCookie(name: string) {
          const match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]+)")
          );
          return match ? match[2] : undefined;
        }

        let deviceID = getCookie("deviceID");
        if (!deviceID) {
          deviceID =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          document.cookie = `deviceID=${deviceID}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        }
        setDeviceIdState(deviceID);

        // ── Process devices ───────────────────────────────────────────────
        if (deviceDocs && !deviceDocs.empty) {
          const devices: Device[] = [];
          deviceDocs.forEach((element) => {
            const d = element.data();
            const device: Device = {
              ...d,
              name: d.name,
              id: d.id,
              docID: element.id,
              useDifferentDeviceToPrint: d.useDifferentDeviceToPrint,
              printToPrinter: d.printToPrinter,
              sendPrintToUserID: d.sendPrintToUserID,
              printOnlineOrders: d.printOnlineOrders,
            };
            devices.push(device);

            if (d.id === deviceID) {
              setDeviceState({
                ...d,
                name: d.name,
                id: d.id,
                docID: element.id,
                useDifferentDeviceToPrint: d.useDifferentDeviceToPrint,
                printToPrinter: d.printToPrinter,
                sendPrintToUserID: d.sendPrintToUserID,
                printOnlineOrders: d.printOnlineOrders,
              });
            }
          });

          setDeviceTreeState({ devices });
        }

        // ── All data loaded, dismiss loading screen ───────────────────────
        setloading(false);
      } catch {
        alertP.error(
          "An error has occured with starting up the app. Please refresh the page. 4"
        );
      }
    });

    return () => unsubscribeAuth();
  }, [savedUserState]);

  // ─── WooCommerce Polling ──────────────────────────────────────────────────
  useInterval(() => {
    if (
      !wooCredentials.useWoocommerce ||
      !isSubscribed ||
      wooErrorCount >= 3 ||
      !myDeviceDetails.printOnlineOrders
    ) return;

    const WooCommerce = new WooCommerceAPI({
      url: wooCredentials.apiUrl,
      consumerKey: wooCredentials.ck,
      consumerSecret: wooCredentials.cs,
      wpAPI: true,
      version: "wc/v3",
    });

    let page = 1;
    let orders: any[] = [];

    const getOrders = async (): Promise<void> => {
      const response = await WooCommerce.getAsync(`orders?page=${page}&per_page=100&status=processing`);
      const data = JSON.parse(response.body);
      orders = [...orders, ...data];
      if (data.length === 100) {
        page++;
        await getOrders();
      }
    };

    getOrders()
      .then(() => {
        if (wooErrorCount > 0) setWooErrorCount(0);
        if (JSON.stringify(orders) === JSON.stringify(wooOrders)) return;

        for (let index = 0; index < orders.length; index++) {
          const order = orders[index];
          let orderIndex = wooOrders.length > 0
            ? wooOrders.findIndex((e) => e.id === order.id)
            : -1;

          if (orderIndex === -1 || !wooOrders[orderIndex].printed) {
            const userId = auth.currentUser?.uid;
            if (!userId) continue;

            if (orderIndex === -1) {
              db.collection("users")
                .doc(userId)
                .collection("wooOrders")
                .doc(order.id.toString())
                .set({ ...order, printed: true })
                .then(() => {
                  setwooOrders((prev) => [...prev, { ...order, printed: true }]);
                  wooOrders.push({ ...order, printed: true });
                })
                .catch(() => {});
            } else {
              db.collection("users")
                .doc(userId)
                .collection("wooOrders")
                .doc(order.id.toString())
                .update({ printed: true })
                .then(() => {
                  setwooOrders((prev) => {
                    const updated = [...prev];
                    updated[orderIndex].printed = true;
                    return updated;
                  });
                  wooOrders[orderIndex].printed = true;
                })
                .catch(() => {});
            }

            const CleanupOps = (metaList: { key: string; value: string }[]) => {
              const opsArray: { key: string; vals: string[] }[] = [];
              metaList.forEach((op: { key: string; value: string }) => {
                const existing = opsArray.filter((f) => f.key === op.key);
                if (existing.length > 0) {
                  opsArray.forEach((item, i) => {
                    if (item.key === op.key) opsArray[i].vals.push(op.value);
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
            const targetTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const resultDate = tz(newDate)
              .tz(targetTimezone, true)
              .format("dddd, MMMM Do YYYY, h:mm:ss a z");

            printData.push(
              "\x1B" + "\x40",
              "\x1B" + "\x61" + "\x31",
              storeDetails.name,
              "\x0A",
              storeDetails.address?.label + "\x0A",
              storeDetails.website + "\x0A",
              storeDetails.phoneNumber + "\x0A",
              resultDate + "\x0A",
              "\x0A",
              "Online Order" + "\x0A",
              `Transaction ID ${order.number}` + "\x0A",
              "\x0A",
              "\x0A",
              "\x0A",
              "\x1B" + "\x61" + "\x30"
            );

            order.line_items?.map((cartItem: any) => {
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
                  returnedItem.vals.map((val: string, i: number) => {
                    printData.push(`${val}`);
                    printData.push("\x0A");
                    if (i >= 0 && i < returnedItem.vals.length - 1) {
                      printData.push(", ");
                    }
                  });
                  printData.push("\x0A");
                });
              } else {
                printData.push("\x0A" + "\x0A");
              }
            });

            printData.push(
              "\x0A",
              "\x0A",
              `Customer Details:`,
              "\x0A",
              `Address: ${order.shipping.address_1}`,
              "\x0A",
              `City: ${order.shipping.city}`,
              "\x0A",
              `Zip/Postal Code: ${order.shipping.postcode}`,
              "\x0A",
              `Province/State: ${order.shipping.state}`,
              "\x0A",
              `Name: ${order.shipping.first_name} ${order.shipping.last_name}`,
              "\x0A",
              `Phone Number: ${order.billing.phone}`,
              "\x0A"
            );

            order.shipping_lines.map((line: any) => {
              printData.push(`Shipping Method: ${line.method_title}`);
              printData.push("\x0A");
            });

            if (order.customer_note) {
              printData.push(`Customer Note: ${order.customer_note}`);
              printData.push("\x0A");
            }

            printData.push(
              "\x0A",
              "\x0A",
              "\x0A",
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" + "\x0A",
              "\x0A" + "\x0A",
              "Payment Method: " + order.payment_method_title + "\x0A" + "\x0A",
              `Total Including (${storeDetails.taxRate ? storeDetails.taxRate : "13"}% Tax): ` +
                "$" + order.total + "\x0A" + "\x0A",
              "------------------------------------------" + "\x0A",
              "\x0A",
              "\x0A",
              "\x0A",
              "\x0A",
              "\x0A",
              "\x0A"
            );

            printData.push("\x1D" + "\x56" + "\x00");

            const doublePrint = printData.concat(printData);

            qz.websocket
              .connect()
              .then(function () {
                if (!myDeviceDetails.printToPrinter) {
                  alertP.error("You must specify a printer in device settings");
                  return;
                }
                const config = qz.configs.create(myDeviceDetails.printToPrinter);
                return qz.print(config, doublePrint);
              })
              .then(qz.websocket.disconnect)
              .catch(function (err: Error) {
                if (err.message.includes("A printer must be specified before printing")) {
                  alertP.error("You must specify a printer in device settings");
                } else if (err.message.includes("Unable to establish connection with QZ")) {
                  alertP.error(
                    "You do not have Divine POS Helper installed. Please download from general settings"
                  );
                } else if (err.message.includes("Cannot find printer with name")) {
                  alertP.error("Printer not found. Please check your printer settings.");
                } else {
                  alertP.error(
                    "An error occured while trying to print. Try refreshing the page and trying again."
                  );
                }
              });
          }
        }
      })
      .catch(() => {
        setWooErrorCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            alertP.error(
              "There was an error connecting to your WooCommerce store. Please check your credentials in settings."
            );
          }
          return next;
        });
      });
  }, 10000);

  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <Suspense fallback={<div />}>
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
          <Route path="/" component={PublicRoute} />
        )}
      </Suspense>
    </Router>
  );
};

export default AppRouter;
