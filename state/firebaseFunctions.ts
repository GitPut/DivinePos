import {
  CustomerProp,
  StatsDataProps,
  StoreDetailsProps,
  TransListStateItem,
} from "types/global";
import { auth, db } from "./firebaseConfig";
import firebase from "firebase/compat/app";
import { Timestamp } from "firebase/firestore";

// -------------------
// 🔐 AUTH FUNCTIONS
// -------------------
export const signIn = (email: string, password: string) =>
  auth.signInWithEmailAndPassword(email, password);

export const signUp = async (
  email: string,
  password: string,
  name: string,
  phoneNumber: string
) => {
  const userAuth = await auth.createUserWithEmailAndPassword(email, password);

  if (userAuth.user) {
    const userDoc = db.collection("users").doc(userAuth.user.uid);
    await userDoc.set({
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
        name,
        address: null,
        phoneNumber,
        email,
      },
    });

    await userAuth.user.updateProfile({ displayName: name });
  }
};

// -------------------
// 🧩 DATA UPDATES
// -------------------
export const updateData = async (categories: string[]) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await db.collection("users").doc(uid).update({ categories });
};

// -------------------
// 📊 STATS HELPERS
// -------------------
interface ProductCount {
  [productName: string]: number;
}

interface DayStats {
  revenue: number;
  orders: number;
  inStore: number;
  inStoreRevenue: number;
  delivery: number;
  deliveryRevenue: number;
  pickup: number;
  pickupRevenue: number;
  productCounts: ProductCount;
  totalWaitTime: number;
  waitCount: number;
  averageWaitTime?: number;
}

const initializeDayStats = (): DayStats => ({
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
});

const initializeStatsData = (): StatsDataProps => ({
  totalRevenue: 0,
  totalOrders: 0,
  days: {},
});

// -------------------
// 📈 UPDATE STATS
// -------------------
export const updateStats = async (
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

    // Must have valid Firestore Timestamp
    if (!(receipt.date instanceof Timestamp)) {
      console.warn("Skipping stats update: receipt.date is invalid");
      return;
    }

    const transactionDate = receipt.date.toDate().toISOString().slice(0, 10); // YYYY-MM-DD

    if (!statsData.days[transactionDate]) {
      statsData.days[transactionDate] = initializeDayStats();
    }

    const day = statsData.days[transactionDate];
    const total =
      Number(receipt.total?.toString().replace(/[^0-9.-]+/g, "")) || 0;

    // --- Update Totals ---
    day.orders += 1;
    day.revenue += total;
    statsData.totalOrders = (statsData.totalOrders || 0) + 1;
    statsData.totalRevenue = (statsData.totalRevenue || 0) + total;

    // --- Method-specific ---
    switch (receipt.method) {
      case "inStoreOrder":
        day.inStore++;
        day.inStoreRevenue += total;
        break;
      case "deliveryOrder":
        day.delivery++;
        day.deliveryRevenue += total;
        break;
      case "pickupOrder":
        day.pickup++;
        day.pickupRevenue += total;
        break;
    }

    // --- Product Counts ---
    if (Array.isArray(receipt.cart)) {
      for (const item of receipt.cart) {
        const itemName = item.name || "Unknown Item";
        day.productCounts[itemName] = (day.productCounts[itemName] || 0) + 1;
      }
    }

    // --- Wait Time ---
    if (
      receipt.date instanceof Timestamp &&
      receipt.dateCompleted instanceof Timestamp
    ) {
      const start = receipt.date.toDate();
      const end = receipt.dateCompleted.toDate();
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const waitTime = (end.getTime() - start.getTime()) / 60000; // minutes
        day.totalWaitTime += waitTime;
        day.waitCount += 1;
        day.averageWaitTime = day.totalWaitTime / day.waitCount;
      }
    }

    transaction.set(statsRef, statsData); // Atomic write
  });
};

// -------------------
// 💵 TRANSACTIONS
// -------------------
export const updateTransList = async (receipt: Partial<TransListStateItem>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

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

// -------------------
// 🏪 STORE DETAILS
// -------------------
export const updateStoreDetails = async (
  storeDetails: Partial<StoreDetailsProps>
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const userRef = db.collection("users").doc(uid);
  await userRef.update({ storeDetails });

  // If public profile should also be updated
  if (storeDetails.onlineStoreActive) {
    await db.collection("public").doc(uid).update({ storeDetails });
  }
};

// -------------------
// 🎁 FREE TRIAL
// -------------------
export const updateFreeTrial = async (endDate: Date | null) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("updateFreeTrial: no authenticated user");
    return;
  }

  const userRef = db.collection("users").doc(currentUser.uid);

  if (!endDate) {
    console.log("Clearing freeTrial field...");
    await userRef.update({
      freeTrial: firebase.firestore.FieldValue.delete(),
    });
  } else {
    const timestamp = firebase.firestore.Timestamp.fromDate(endDate);
    await userRef.update({ freeTrial: timestamp });
  }

  window.location.reload();
};

// -------------------
// 🚪 LOGOUT
// -------------------
export const logout = async () => {
  localStorage.removeItem("isAuthedBackend");
  localStorage.removeItem("savedUserState");
  await auth.signOut();
  window.location.href = "https://divinepos.com";
};

// -------------------
// 👥 CUSTOMERS
// -------------------
export const addCustomerDetailsToDb = async (customer: CustomerProp) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  await db
    .collection("users")
    .doc(uid)
    .collection("customers")
    .add({
      ...customer,
      createdAt: firebase.firestore.Timestamp.now(),
    });
};
