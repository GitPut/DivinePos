import { CartItemProp } from "types";

const STORAGE_KEY = "divine-pos-cart-sync";

export interface CustomerDisplayData {
  cart: CartItemProp[];
  discountAmount: string | null;
  deliveryChecked: boolean | null;
  cartSub: number;
}

/**
 * POS side: write cart data to localStorage on every change.
 */
export function broadcastCartUpdate(data: CustomerDisplayData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Customer display side: poll localStorage every 500ms for cart changes.
 * Also reads immediately on setup so display is populated instantly.
 * Polling is more reliable than the storage event across all browsers/tab configs.
 */
export function onCartUpdate(
  callback: (data: CustomerDisplayData) => void
): () => void {
  let lastValue = "";

  const readAndUpdate = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && raw !== lastValue) {
        lastValue = raw;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.cart)) {
          callback(parsed);
        }
      }
    } catch {
      // Ignore
    }
  };

  // Read immediately
  readAndUpdate();

  // Poll every 500ms
  const interval = setInterval(readAndUpdate, 500);

  return () => clearInterval(interval);
}
