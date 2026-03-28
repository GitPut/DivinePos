import {
  CartItemProp,
  StoreDetailsProps,
  TransListStateItem,
} from "types";
import { parseDate } from "utils/dateFormatting";

// ESC/POS control codes
const LF = "\x0A";
const INIT = "\x1B" + "\x40";
const CENTER = "\x1B" + "\x61" + "\x31";
const LEFT = "\x1B" + "\x61" + "\x30";
const CUT = "\x1D" + "\x56" + "\x30";
const CASH_DRAWER = "\x10" + "\x14" + "\x01" + "\x00" + "\x05";
const DIVIDER = "------------------------------------------";

function receiptPrint(
  element: TransListStateItem,
  storeDetails: StoreDetailsProps,
  reprint?: boolean
): { data: string[]; total: number } {
  const data: string[] = [];
  let subtotal = 0;

  // Parse date
  let dateStr = "";
  const parsedDate = parseDate(element.date);
  if (parsedDate) {
    dateStr = parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  }

  const isDelivery = element.method === "deliveryOrder";
  const isPickup = element.method === "pickupOrder";
  const isTable = element.method === "tableOrder";
  const isInStore = !isDelivery && !isPickup && !isTable;
  const isOnline = !!element.online;
  const taxRate =
    parseFloat(storeDetails.taxRate) >= 0
      ? parseFloat(storeDetails.taxRate)
      : 13;
  const deliveryFee = isDelivery
    ? parseFloat(storeDetails.deliveryPrice || "0")
    : 0;

  // ──────── HEADER (centered) ────────
  data.push(
    INIT,
    "                                                                              ",
    LF,
    CENTER,
    storeDetails.name,
    LF
  );
  if (storeDetails.address?.label) data.push(storeDetails.address.label + LF);
  if (storeDetails.website) data.push(storeDetails.website + LF);
  if (storeDetails.phoneNumber) data.push(storeDetails.phoneNumber + LF);
  if (dateStr) data.push(dateStr + LF);
  data.push(LF);

  if (isOnline) data.push("Online Order" + LF);
  data.push("Transaction ID " + element.transNum + LF, LF);

  // Order type label
  if (isDelivery) {
    data.push("DELIVERY ORDER" + LF);
  } else if (isPickup) {
    data.push("PICKUP ORDER" + LF);
  } else if (isTable) {
    if (element.tableName) data.push(element.tableName + LF);
    if (element.tableNumber) data.push("Table #" + element.tableNumber + LF);
    if (element.server) data.push("Server: " + element.server + LF);
    if (element.guests) data.push("Guests: " + element.guests + LF);
  }

  data.push(LF, DIVIDER + LF, LF, LEFT);

  // ──────── CART ITEMS ────────
  element.cart?.forEach((cartItem: CartItemProp) => {
    const qty = parseFloat(cartItem.quantity ?? "1");
    const price = parseFloat(cartItem.price ?? "0");
    const lineTotal = price * qty;

    if (cartItem.price) subtotal += lineTotal;

    // Item name with quantity prefix if > 1
    const qtyPrefix = qty !== 1 ? qty + "x " : "";
    data.push(qtyPrefix + cartItem.name + LF);

    if (cartItem.price) {
      data.push("   $" + lineTotal.toFixed(2) + LF);
    }

    if (cartItem.description) {
      data.push("  " + cartItem.description + LF);
    }

    if (cartItem.options) {
      cartItem.options.forEach((option) => {
        data.push("  - " + option + LF);
      });
    }

    if (cartItem.extraDetails) {
      data.push("  * Note: " + cartItem.extraDetails + LF);
    }

    data.push(LF);
  });

  // ──────── FOOTER ────────
  data.push(DIVIDER + LF, LF);

  // Order note
  if (element.cartNote) {
    data.push("Note: " + element.cartNote + LF, LF);
  }

  // Customer info (delivery/pickup)
  if (isDelivery || isPickup) {
    if (element.customer?.name)
      data.push("Customer: " + element.customer.name + LF);
    if (element.customer?.phone)
      data.push("Phone: " + element.customer.phone + LF);
    if (isDelivery) {
      if (element.customer?.address?.label)
        data.push("Address: " + element.customer.address.label + LF);
      data.push(
        "Unit: " +
          (element.customer?.unitNumber || "N/A") +
          "   Buzz: " +
          (element.customer?.buzzCode || "N/A") +
          LF
      );
    }
    data.push(LF);
  }

  // Payment method (table/in-store only)
  if ((isTable || isInStore) && element.paymentMethod) {
    data.push("Payment: " + element.paymentMethod + LF, LF);
  }

  // Totals breakdown
  data.push("Subtotal: $" + subtotal.toFixed(2) + LF);
  if (isDelivery && deliveryFee > 0) {
    data.push("Delivery: $" + deliveryFee.toFixed(2) + LF);
  }
  const totalBeforeTax = subtotal + deliveryFee;
  const taxAmount = totalBeforeTax * (taxRate / 100);
  const total = totalBeforeTax + taxAmount;
  data.push("Tax (" + taxRate + "%): $" + taxAmount.toFixed(2) + LF);
  data.push(LF);
  data.push("Total: $" + total.toFixed(2) + LF);

  // Change due (cash payments for table/in-store)
  if ((isTable || isInStore) && element.paymentMethod === "Cash") {
    data.push("Change Due: $" + (element.changeDue || "0.00") + LF);
  }

  data.push(LF, DIVIDER + LF, LF);

  // Thank you (centered)
  data.push(CENTER, "Thank you!" + LF, LF);

  // Paper feed
  data.push(LF, LF, LF, LF, LF);

  // Cut + cash drawer kick (only in-store cash, non-reprint)
  if (isInStore && element.paymentMethod === "Cash" && reprint !== true) {
    data.push(CUT + CASH_DRAWER);
  } else {
    data.push(CUT);
  }

  return { data, total };
}

export { receiptPrint };
export default receiptPrint;
