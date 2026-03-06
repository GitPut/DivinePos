import { CartItemProp } from "types";

const CHANNEL_NAME = "divine-pos-customer-display";

export interface CustomerDisplayData {
  cart: CartItemProp[];
  discountAmount: string | null;
  deliveryChecked: boolean | null;
  cartSub: number;
}

export function broadcastCartUpdate(data: CustomerDisplayData): void {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(data);
    channel.close();
  } catch {
    // BroadcastChannel not supported — silently ignore
  }
}

export function onCartUpdate(
  callback: (data: CustomerDisplayData) => void
): () => void {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<CustomerDisplayData>) => {
      callback(event.data);
    };
    return () => channel.close();
  } catch {
    return () => {};
  }
}
