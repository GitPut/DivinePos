import {
  CartItemProp,
  CustomerProp,
  Ingredient,
  IngredientStockHistoryEntry,
  StatsDataProps,
  StockHistoryEntry,
  StoreDetailsProps,
  TransListStateItem,
} from "types";
import { auth, db, STRIPE_PUBLIC_KEY } from "./config";
import { loadStripe } from "@stripe/stripe-js";
import firebase from "firebase/compat/app";
import { Timestamp } from "firebase/firestore";
import {
  ingredientsState,
  onlineStoreState,
  setIngredientsState,
  storeProductsState,
  updateIngredientsBatch,
  updateIngredientStock,
  updateStoreProductsState,
} from "store/appState";

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

    if (!(receipt.date instanceof Timestamp)) {
      console.warn("Skipping stats update: receipt.date is not a valid Timestamp");
      return;
    }

    const transactionDate = receipt.date.toDate().toISOString().slice(0, 10);

    if (!statsData.days[transactionDate]) {
      statsData.days[transactionDate] = initializeDayStats();
    }

    const day = statsData.days[transactionDate];
    const total =
      Number(receipt.total?.toString().replace(/[^0-9.-]+/g, "")) || 0;

    day.orders += 1;
    day.revenue += total;
    statsData.totalOrders = (statsData.totalOrders || 0) + 1;
    statsData.totalRevenue = (statsData.totalRevenue || 0) + total;

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

    if (Array.isArray(receipt.cart)) {
      for (const item of receipt.cart) {
        const itemName = item.name || "Unknown Item";
        day.productCounts[itemName] = (day.productCounts[itemName] || 0) + 1;
      }
    }

    if (
      receipt.date instanceof Timestamp &&
      receipt.dateCompleted instanceof Timestamp
    ) {
      const start = receipt.date.toDate();
      const end = receipt.dateCompleted.toDate();
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const waitTime = (end.getTime() - start.getTime()) / 60000;
        day.totalWaitTime += waitTime;
        day.waitCount += 1;
        day.averageWaitTime = day.totalWaitTime / day.waitCount;
      }
    }

    transaction.set(statsRef, statsData);
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

  const docRef = await transListRef.add(newReceipt);
  await updateStats(userId, newReceipt);

  if (receipt.cart && receipt.cart.length > 0) {
    await deductStockForCart(userId, receipt.cart, docRef.id).catch(() => {
      console.warn("Stock deduction failed for transaction", docRef.id);
    });
  }
};

// -------------------
// 📦 INVENTORY
// -------------------
const deductStockForCart = async (
  userId: string,
  cart: CartItemProp[],
  transactionId: string
): Promise<void> => {
  const products = storeProductsState.get().products;
  const ingredients = ingredientsState.get();
  const isOnlineStore = onlineStoreState.get().onlineStoreSetUp;
  const batch = db.batch();
  const historyWrites: { ref: firebase.firestore.DocumentReference; data: any }[] = [];
  const productStockUpdates: { productId: string; newStock: number }[] = [];
  const ingredientDeductions: Map<string, { currentStock: number; totalDeducted: number }> = new Map();

  for (const item of cart) {
    const productId = item.editableObj?.id;
    if (!productId) continue;

    const product = products.find((p) => p.id === productId);
    if (!product || product.trackStock !== true) continue;

    const qty = parseFloat(item.quantity ?? "1") || 1;

    // ── Path A: Product has a recipe → deduct ingredients ──
    if (product.recipe && product.recipe.length > 0) {
      for (const recipeItem of product.recipe) {
        const totalNeeded = recipeItem.quantity * qty;
        if (!ingredientDeductions.has(recipeItem.ingredientId)) {
          const ing = ingredients.find((i) => i.id === recipeItem.ingredientId);
          ingredientDeductions.set(recipeItem.ingredientId, {
            currentStock: ing?.stockQuantity ?? 0,
            totalDeducted: 0,
          });
        }
        const entry = ingredientDeductions.get(recipeItem.ingredientId)!;
        entry.totalDeducted += totalNeeded;
      }
    }
    // ── Path B: Simple product-level tracking (no recipe) ──
    else {
      const currentStock = product.stockQuantity ?? 0;
      const newStock = Math.max(0, currentStock - qty);

      const productRef = db
        .collection("users")
        .doc(userId)
        .collection("products")
        .doc(productId);

      batch.update(productRef, { stockQuantity: newStock });

      if (isOnlineStore) {
        const publicRef = db
          .collection("public")
          .doc(userId)
          .collection("products")
          .doc(productId);
        batch.set(publicRef, { stockQuantity: newStock }, { merge: true });
      }

      historyWrites.push({
        ref: productRef.collection("stockHistory").doc(),
        data: {
          type: "sale",
          quantityChange: -qty,
          quantityBefore: currentStock,
          quantityAfter: newStock,
          transactionId,
          createdAt: firebase.firestore.Timestamp.now(),
          createdBy: "system",
        },
      });

      productStockUpdates.push({ productId, newStock });
    }
  }

  // ── Write ingredient deductions ──
  for (const [ingredientId, data] of ingredientDeductions) {
    const newStock = Math.max(0, data.currentStock - data.totalDeducted);
    const ingredientRef = db
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .doc(ingredientId);

    batch.update(ingredientRef, { stockQuantity: newStock });

    historyWrites.push({
      ref: ingredientRef.collection("stockHistory").doc(),
      data: {
        type: "sale",
        quantityChange: -data.totalDeducted,
        quantityBefore: data.currentStock,
        quantityAfter: newStock,
        transactionId,
        createdAt: firebase.firestore.Timestamp.now(),
        createdBy: "system",
      },
    });
  }

  if (productStockUpdates.length === 0 && ingredientDeductions.size === 0) return;

  await batch.commit();

  // Write history entries (non-fatal)
  if (historyWrites.length > 0) {
    const histBatch = db.batch();
    for (const hw of historyWrites) {
      histBatch.set(hw.ref, hw.data);
    }
    await histBatch.commit().catch(() => {});
  }

  // Update local state for products
  if (productStockUpdates.length > 0) {
    const updatedProducts = products.map((p) => {
      const update = productStockUpdates.find((u) => u.productId === p.id);
      return update ? { ...p, stockQuantity: update.newStock } : p;
    });
    updateStoreProductsState({ products: updatedProducts });
  }

  // Update local state for ingredients
  if (ingredientDeductions.size > 0) {
    const batchUpdates = Array.from(ingredientDeductions).map(
      ([ingredientId, data]) => ({
        ingredientId,
        newStock: Math.max(0, data.currentStock - data.totalDeducted),
      })
    );
    updateIngredientsBatch(batchUpdates);
  }
};

export const adjustStockManually = async (
  productId: string,
  newQuantity: number,
  type: "restock" | "adjustment" | "correction",
  note?: string
): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const products = storeProductsState.get().products;
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");

  const currentStock = product.stockQuantity ?? 0;
  const isOnlineStore = onlineStoreState.get().onlineStoreSetUp;

  const productRef = db
    .collection("users")
    .doc(userId)
    .collection("products")
    .doc(productId);

  await productRef.update({ stockQuantity: newQuantity });

  if (isOnlineStore) {
    try {
      await db
        .collection("public")
        .doc(userId)
        .collection("products")
        .doc(productId)
        .set({ stockQuantity: newQuantity }, { merge: true });
    } catch {
      // Public doc may not exist — non-fatal
    }
  }

  // Write history entry
  await productRef.collection("stockHistory").add({
    type,
    quantityChange: newQuantity - currentStock,
    quantityBefore: currentStock,
    quantityAfter: newQuantity,
    note: note ?? "",
    createdAt: firebase.firestore.Timestamp.now(),
    createdBy: userId,
  });

  // Update local state
  const updatedProducts = products.map((p) =>
    p.id === productId ? { ...p, stockQuantity: newQuantity } : p
  );
  updateStoreProductsState({ products: updatedProducts });
};

export const fetchStockHistory = async (
  productId: string,
  limit = 50
): Promise<StockHistoryEntry[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const snap = await db
    .collection("users")
    .doc(userId)
    .collection("products")
    .doc(productId)
    .collection("stockHistory")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<StockHistoryEntry, "id">),
  }));
};

// -------------------
// 🥫 INGREDIENTS
// -------------------
export const addIngredient = async (
  ingredient: Omit<Ingredient, "id">
): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const id = Math.random().toString(36).substr(2, 9);
  const fullIngredient: Ingredient = { ...ingredient, id };

  await db
    .collection("users")
    .doc(userId)
    .collection("ingredients")
    .doc(id)
    .set(fullIngredient);

  const current = ingredientsState.get();
  setIngredientsState([...current, fullIngredient]);

  return id;
};

export const updateIngredient = async (
  ingredientId: string,
  updates: Partial<Ingredient>
): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  await db
    .collection("users")
    .doc(userId)
    .collection("ingredients")
    .doc(ingredientId)
    .update(updates);

  const current = ingredientsState.get();
  setIngredientsState(
    current.map((ing) =>
      ing.id === ingredientId ? { ...ing, ...updates } : ing
    )
  );
};

export const deleteIngredient = async (
  ingredientId: string
): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  await db
    .collection("users")
    .doc(userId)
    .collection("ingredients")
    .doc(ingredientId)
    .delete();

  const current = ingredientsState.get();
  setIngredientsState(current.filter((ing) => ing.id !== ingredientId));
};

export const adjustIngredientStockManually = async (
  ingredientId: string,
  newQuantity: number,
  type: "restock" | "adjustment" | "correction",
  note?: string
): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const ingredients = ingredientsState.get();
  const ingredient = ingredients.find((i) => i.id === ingredientId);
  if (!ingredient) throw new Error("Ingredient not found");

  const currentStock = ingredient.stockQuantity ?? 0;

  const ingredientRef = db
    .collection("users")
    .doc(userId)
    .collection("ingredients")
    .doc(ingredientId);

  await ingredientRef.update({ stockQuantity: newQuantity });

  await ingredientRef.collection("stockHistory").add({
    type,
    quantityChange: newQuantity - currentStock,
    quantityBefore: currentStock,
    quantityAfter: newQuantity,
    note: note ?? "",
    createdAt: firebase.firestore.Timestamp.now(),
    createdBy: userId,
  });

  updateIngredientStock(ingredientId, newQuantity);
};

export const fetchIngredientStockHistory = async (
  ingredientId: string,
  limit = 50
): Promise<IngredientStockHistoryEntry[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const snap = await db
    .collection("users")
    .doc(userId)
    .collection("ingredients")
    .doc(ingredientId)
    .collection("stockHistory")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<IngredientStockHistoryEntry, "id">),
  }));
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

  if (storeDetails.onlineStoreActive) {
    await db.collection("public").doc(uid).update({ storeDetails });
  }
};

// -------------------
// 🎁 FREE TRIAL
// -------------------
export const updateFreeTrial = async (endDate: Date | null) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const userRef = db.collection("users").doc(currentUser.uid);

  if (!endDate) {
    await userRef.update({
      freeTrial: firebase.firestore.FieldValue.delete(),
    });
  } else {
    const timestamp = firebase.firestore.Timestamp.fromDate(endDate);
    await userRef.update({ freeTrial: timestamp });
  }
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

  return await db
    .collection("users")
    .doc(uid)
    .collection("customers")
    .add({
      ...customer,
      createdAt: firebase.firestore.Timestamp.now(),
    });
};

// -------------------
// 💳 STRIPE CHECKOUT
// -------------------
export const createCheckoutSession = async (
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  onError?: (msg: string) => void,
  quantity?: number
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onError?.("User not authenticated");
    return;
  }

  const sessionData: Record<string, any> = {
    price: priceId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  };
  if (quantity !== undefined) {
    sessionData.quantity = quantity;
  }

  const docRef = await db
    .collection("users")
    .doc(uid)
    .collection("checkout_sessions")
    .add(sessionData);

  const unsubscribe = docRef.onSnapshot(async (snap) => {
    const { error, sessionId } = snap.data() ?? {};

    if (error) {
      unsubscribe();
      onError?.(error.message || "An error occurred");
      return;
    }

    if (sessionId) {
      unsubscribe();
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      if (!stripe) return;
      await stripe.redirectToCheckout({ sessionId });
    }
  });
};
