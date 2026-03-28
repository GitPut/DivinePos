import React, { useEffect, useState } from "react";
import { FiShoppingBag } from "react-icons/fi";
import { storeDetailsState } from "store/appState";
import {
  onCartUpdate,
  CustomerDisplayData,
} from "utils/customerDisplayBroadcast";
import { CartItemProp } from "types";
import { calculateCartTotals } from "utils/cartCalculations";

function CustomerDisplay() {
  const storeDetails = storeDetailsState.use();
  const [cart, setCart] = useState<CartItemProp[]>([]);
  const [discountAmount, setDiscountAmount] = useState<string | null>(null);
  const [deliveryChecked, setDeliveryChecked] = useState<boolean | null>(null);
  const [cartSub, setCartSub] = useState<number>(0);

  useEffect(() => {
    const cleanup = onCartUpdate((data: CustomerDisplayData) => {
      setCart(data.cart);
      setDiscountAmount(data.discountAmount);
      setDeliveryChecked(data.deliveryChecked);
      setCartSub(data.cartSub);
    });
    return cleanup;
  }, []);

  const taxRate = storeDetails?.taxRate ?? "13";
  const deliveryPrice = storeDetails?.deliveryPrice ?? "0";
  const totals = calculateCartTotals(
    cart,
    taxRate,
    deliveryPrice,
    deliveryChecked ?? false,
    discountAmount
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + parseFloat(item.quantity ?? "1"),
    0
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.storeName}>
          {storeDetails?.name ?? "Store"}
        </span>
        {cart.length > 0 && (
          <span style={styles.itemCount}>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {cart.length > 0 ? (
          <>
            {/* Cart items — scrollable */}
            <div style={styles.itemsList}>
              {cart.map((item, index) => {
                const qty = parseFloat(item.quantity ?? "1");
                const price = parseFloat(item.price ?? "0");

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.cartItem,
                      ...(index < cart.length - 1
                        ? { borderBottom: "1px solid #f1f5f9" }
                        : {}),
                    }}
                  >
                    <div style={styles.cartItemLeft}>
                      <div style={styles.qtyBadge}>
                        <span style={styles.qtyText}>{qty}</span>
                      </div>
                      <div style={styles.itemInfo}>
                        <span style={styles.cartItemName}>{item.name}</span>
                        {item.options && item.options.length > 0 && (
                          <span style={styles.itemOptions}>
                            {item.options.join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={styles.cartItemPrice}>
                      ${(price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div style={styles.totalsCard}>
              {discountAmount && (
                <div style={styles.totalsRow}>
                  <span style={styles.totalsLabel}>Discount</span>
                  <span style={styles.totalsValue}>
                    {discountAmount.includes("%")
                      ? discountAmount
                      : `-$${discountAmount}`}
                  </span>
                </div>
              )}
              {deliveryChecked && parseFloat(deliveryPrice) > 0 && (
                <div style={styles.totalsRow}>
                  <span style={styles.totalsLabel}>Delivery</span>
                  <span style={styles.totalsValue}>
                    ${parseFloat(deliveryPrice).toFixed(2)}
                  </span>
                </div>
              )}
              <div style={styles.totalsRow}>
                <span style={styles.totalsLabel}>Subtotal</span>
                <span style={styles.totalsValue}>
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div style={styles.totalsRow}>
                <span style={styles.totalsLabel}>
                  Tax ({parseFloat(taxRate) >= 0 ? parseFloat(taxRate) : 13}%)
                </span>
                <span style={styles.totalsValue}>
                  ${totals.tax.toFixed(2)}
                </span>
              </div>
              <div style={styles.totalDivider} />
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalAmount}>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconCircle}>
              <FiShoppingBag size={48} color="#cbd5e1" />
            </div>
            <span style={styles.emptyTitle}>Your order will appear here</span>
            <span style={styles.emptySubtitle}>
              Items added at the register will show up on this screen
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100vh",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 40px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  storeName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 24,
  },
  itemCount: {
    fontSize: 15,
    fontWeight: "500",
    color: "#94a3b8",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "24px 40px",
    overflow: "hidden",
  },
  itemsList: {
    flex: 1,
    overflowY: "auto" as const,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "8px 24px",
    marginBottom: 16,
  },
  cartItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
  },
  cartItemLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  qtyBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  cartItemName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 18,
  },
  itemOptions: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  cartItemPrice: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 18,
    flexShrink: 0,
    marginLeft: 16,
  },
  totalsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: "20px 28px",
    flexShrink: 0,
    border: "1px solid #e2e8f0",
  },
  totalsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalsLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  totalsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginTop: 6,
    marginBottom: 14,
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 22,
  },
  totalAmount: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 32,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center" as const,
  },
};

export default CustomerDisplay;
