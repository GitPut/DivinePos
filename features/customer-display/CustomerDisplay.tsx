import React, { useEffect, useState } from "react";
import { FiShoppingBag } from "react-icons/fi";
import { storeDetailsState } from "store/appState";
import CartAmountRow from "features/pos/components/Cart/CartAmountRow";
import {
  onCartUpdate,
  CustomerDisplayData,
} from "utils/customerDisplayBroadcast";
import { CartItemProp } from "types";

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
  const taxMultiplier =
    parseFloat(taxRate) >= 0 ? parseFloat(taxRate) / 100 : 0.13;
  const tax = cartSub * taxMultiplier;
  const total = cartSub + tax;
  const deliveryPrice = storeDetails?.deliveryPrice ?? "0";

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.storeName}>
          {storeDetails?.name ?? "Store"}
        </span>
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {cart.length > 0 ? (
          <>
            {/* Cart items */}
            <div style={styles.itemsList}>
              {cart.map((item, index) => {
                const qty = parseFloat(item.quantity ?? "1");
                const price = parseFloat(item.price ?? "0");

                return (
                  <div key={index} style={styles.cartItem}>
                    <div style={styles.cartItemLeft}>
                      <span style={styles.cartItemQty}>{qty}</span>
                      <span style={styles.cartItemX}>x</span>
                      <span style={styles.cartItemName}>{item.name}</span>
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
                <CartAmountRow
                  amountLbl="Discount"
                  amountValue={
                    discountAmount.includes("%")
                      ? discountAmount
                      : `$${discountAmount}`
                  }
                  style={styles.totalsRow}
                />
              )}
              {deliveryChecked && parseFloat(deliveryPrice) > 0 && (
                <CartAmountRow
                  amountLbl="Delivery"
                  amountValue={`$${parseFloat(deliveryPrice).toFixed(2)}`}
                  style={styles.totalsRow}
                />
              )}
              <CartAmountRow
                amountLbl="Subtotal"
                amountValue={
                  deliveryChecked && parseFloat(deliveryPrice) > 0 && cartSub > 0
                    ? `$${(cartSub - parseFloat(deliveryPrice)).toFixed(2)}`
                    : `$${cartSub.toFixed(2)}`
                }
                style={styles.totalsRow}
              />
              <CartAmountRow
                amountLbl={`Tax (${parseFloat(taxRate) >= 0 ? parseFloat(taxRate) : 13}%)`}
                amountValue={`$${tax.toFixed(2)}`}
                style={styles.totalsRow}
              />
              <div style={styles.totalDivider} />
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>${total.toFixed(2)}</span>
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
    width: "100vw",
    height: "100vh",
    backgroundColor: "#f8f9fc",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "24px 40px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  storeName: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 24,
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
    overflowY: "auto",
    paddingBottom: 16,
  },
  cartItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 8,
    border: "1px solid #f1f5f9",
  },
  cartItemLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartItemQty: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 20,
    minWidth: 28,
    textAlign: "center",
  },
  cartItemX: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 16,
  },
  cartItemName: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: 18,
  },
  cartItemPrice: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 20,
  },
  totalsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: "20px 24px",
    flexShrink: 0,
    border: "1px solid #e2e8f0",
  },
  totalsRow: {
    marginBottom: 8,
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginTop: 8,
    marginBottom: 12,
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 24,
  },
  totalValue: {
    fontWeight: "700",
    color: "#1e293b",
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
    color: "#64748b",
    fontSize: 22,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
  },
};

export default CustomerDisplay;
