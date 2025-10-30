import {
  CustomerProp,
  StatsDataProps,
  StoreDetailsProps,
  TransListStateItem,
} from "types/global";
import { auth, db } from "./firebaseConfig";
import firebase from "firebase/compat/app";

export const signIn = (email: string, password: string) =>
  auth.signInWithEmailAndPassword(email, password);

export const signUp = (
  email: string,
  password: string,
  name: string,
  phoneNumber: string
) =>
  auth.createUserWithEmailAndPassword(email, password).then((userAuth) => {
    if (userAuth.user) {
      db.collection("users")
        .doc(userAuth.user.uid)
        .set({
          categories: [],
          wooCredentials: { ck: null, cs: null, useWoocommerce: false },
          storeDetails: {
            name: null,
            address: null,
            phoneNumber: null,
            website: null,
            deliveryPrice: null,
            taxRate: 13,
          },
          ownerDetails: {
            name: name,
            address: null,
            phoneNumber: phoneNumber,
            email: email,
          },
        });
      userAuth.user.updateProfile({
        displayName: name,
      });
    }
  });

export const updateData = (categories: string[]) => {
  db.collection("users").doc(auth.currentUser?.uid).update({
    categories: categories,
  });
};

const initializeStatsData = () => ({
  totalRevenue: 0,
  totalOrders: 0,
  days: {} as Record<
    string,
    {
      revenue: number;
      orders: number;
      inStore: number;
      inStoreRevenue: number;
      delivery: number;
      deliveryRevenue: number;
      pickup: number;
      pickupRevenue: number;
      productCounts: { [itemName: string]: number };
      totalWaitTime: number;
      waitCount: number;
      averageWaitTime?: number;
    }
  >,
});

const updateStats = async (
  userId: string,
  receipt: Partial<TransListStateItem>
) => {
  const statsRef = db
    .collection("users")
    .doc(userId)
    .collection("stats")
    .doc("monthly");

  await db.runTransaction(async (transaction) => {
    const statsDoc = await transaction.get(statsRef);

    const statsData: StatsDataProps = statsDoc.exists
      ? (statsDoc.data() as StatsDataProps)
      : initializeStatsData();

    const transactionDate = receipt.date?.toDate().toISOString().slice(0, 10);

    if (transactionDate) {
      if (!statsData.days[transactionDate]) {
        statsData.days[transactionDate] = {
          revenue: 0,
          orders: 0,
          inStore: 0,
          inStoreRevenue: 0,
          delivery: 0,
          deliveryRevenue: 0,
          pickup: 0,
          pickupRevenue: 0,
          productCounts: {},
          totalWaitTime: 0,
          waitCount: 0,
        };
      }

      statsData.days[transactionDate].orders++;
      statsData.days[transactionDate].revenue += parseFloat(
        receipt.total ?? "0"
      );
      statsData.totalOrders++;
      statsData.totalRevenue += parseFloat(receipt.total ?? "0");

      if (receipt.method === "inStoreOrder") {
        statsData.days[transactionDate].inStore++;
        statsData.days[transactionDate].inStoreRevenue += parseFloat(
          receipt.total ?? "0"
        );
      } else if (receipt.method === "deliveryOrder") {
        statsData.days[transactionDate].delivery++;
        statsData.days[transactionDate].deliveryRevenue += parseFloat(
          receipt.total ?? "0"
        );
      } else if (receipt.method === "pickupOrder") {
        statsData.days[transactionDate].pickup++;
        statsData.days[transactionDate].pickupRevenue += parseFloat(
          receipt.total ?? "0"
        );
      }

      receipt.cart?.forEach((item) => {
        const itemName = item.name;
        statsData.days[transactionDate].productCounts[itemName] =
          (statsData.days[transactionDate].productCounts[itemName] || 0) + 1;
      });

      if (receipt.date && receipt.dateCompleted) {
        const startTime = receipt.date.toDate();
        const endTime = receipt.dateCompleted.toDate();

        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          const waitTime = (endTime.getTime() - startTime.getTime()) / 60000; // Convert milliseconds to minutes
          statsData.days[transactionDate].totalWaitTime += waitTime;
          statsData.days[transactionDate].waitCount += 1;
        }
      }

      // Calculate average wait time per day
      Object.keys(statsData.days).forEach((date) => {
        if (statsData.days[date].waitCount > 0) {
          statsData.days[date].averageWaitTime =
            statsData.days[date].totalWaitTime / statsData.days[date].waitCount;
        }
      });

      transaction.set(statsRef, statsData, { merge: true });
    }
  });
};

export const updateTransList = async (receipt: Partial<TransListStateItem>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const transListRef = db
    .collection("users")
    .doc(userId)
    .collection("transList");

  const newReceipt = {
    ...receipt,
    dateCompleted: firebase.firestore.Timestamp.now(),
  };

  await transListRef.add(newReceipt);
  await updateStats(userId, newReceipt);
};

export const updateStoreDetails = (
  storeDetails: Partial<StoreDetailsProps>
) => {
  db.collection("users").doc(auth.currentUser?.uid).update({
    storeDetails: storeDetails,
  });
  if (storeDetails.onlineStoreActive) {
    db.collection("public").doc(auth.currentUser?.uid).update({
      storeDetails: storeDetails,
    });
  }
};

export const updateFreeTrial = (endDate: Date | null) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("updateFreeTrial: no authenticated user");
    return;
  }

  const userRef = db.collection("users").doc(currentUser.uid);

  // 🛡️ Handle null safely — clears or ends the free trial
  if (!endDate) {
    console.log("updateFreeTrial called with null — clearing freeTrial field");

    return userRef
      .update({
        freeTrial: firebase.firestore.FieldValue.delete(),
      })
      .finally(() => {
        window.location.reload();
      });
  }

  // ✅ Normal behavior if we have a Date
  const timestamp = firebase.firestore.Timestamp.fromDate(endDate);

  return userRef
    .update({
      freeTrial: timestamp,
    })
    .finally(() => {
      window.location.reload();
    });
};

export const logout = () => {
  localStorage.removeItem("isAuthedBackend");
  localStorage.removeItem("savedUserState");
  auth.signOut();
  window.location.href = "https://divinepos.com";
};

export const addCustomerDetailsToDb = (customer: CustomerProp) =>
  db
    .collection("users")
    .doc(auth.currentUser?.uid)
    .collection("customers")
    .add({
      ...customer,
      createdAt: firebase.firestore.Timestamp.now(),
    });
