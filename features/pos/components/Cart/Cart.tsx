import React, { useCallback, useEffect, useState } from "react";
import noItemsImg from "assets/images/noItemsImg.png";
import CartItem from "./CartItem";
import CartAmountRow from "./CartAmountRow";
import { MdClear } from "react-icons/md";
import { FiShoppingBag } from "react-icons/fi";
import CheckoutButton from "./CheckoutButton";
import TableCartHeader from "../Tables/TableCartHeader";
import {
  orderDetailsState,
  productBuilderState,
  cartState,
  setCartState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import firebase from "firebase/compat/app";
import { calculateCartTotals } from "utils/cartCalculations";
import { broadcastCartUpdate } from "utils/customerDisplayBroadcast";
import useWindowSize from "shared/hooks/useWindowSize";

const Cart = () => {
  const { discountAmount, deliveryChecked, cartSub, cartNote, activeTableId } =
    posState.use(
      (s) => ({
        discountAmount: s.discountAmount,
        deliveryChecked: s.deliveryChecked,
        cartSub: s.cartSub,
        cartNote: s.cartNote,
        activeTableId: s.activeTableId,
      }),
      shallowEqual
    );
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const { width, height } = useWindowSize();
  const [total, setTotal] = useState(0);
  const isOnlineOrder = productBuilderState.use().isOnlineOrder;
  const orderDetails = orderDetailsState.use();

  useEffect(() => {
    if (isOnlineOrder) {
      if (cart.length > 0) {
        const totals = calculateCartTotals(
          cart,
          storeDetails.taxRate,
          storeDetails.deliveryPrice,
          orderDetails.delivery ?? false
        );
        updatePosState({
          cartSub: totals.subtotal,
          deliveryChecked: orderDetails.delivery,
        });
      } else {
        updatePosState({
          cartSub: 0,
          deliveryChecked: orderDetails.delivery,
        });
      }
    }
  }, [isOnlineOrder, cart, orderDetails]);

  useEffect(() => {
    if (cartSub > 0) {
      const totals = calculateCartTotals(
        cart,
        storeDetails.taxRate,
        storeDetails.deliveryPrice,
        deliveryChecked ?? false,
        discountAmount
      );
      setTotal(totals.total);
    } else {
      setTotal(0);
    }
  }, [cart, discountAmount, deliveryChecked, cartSub, cartNote, storeDetails]);

  useEffect(() => {
    broadcastCartUpdate({ cart, discountAmount, deliveryChecked, cartSub });
  }, [cart, discountAmount, deliveryChecked, cartSub]);

  const handleRemove = useCallback((index: number) => {
    const local = structuredClone(cartState.get());
    local.splice(index, 1);
    setCartState(local);
  }, []);

  const handleDecrease = useCallback((index: number) => {
    const local = structuredClone(cartState.get());
    const quantity = local[index].quantity ?? false;
    if (quantity && parseFloat(quantity) > 1) {
      local[index].quantity = (parseFloat(quantity) - 1).toString();
    } else {
      local[index].quantity = "1";
    }
    setCartState(local);
  }, []);

  const handleIncrease = useCallback((index: number) => {
    const local = structuredClone(cartState.get());
    const quantity = local[index].quantity ?? false;
    local[index].quantity = (quantity ? parseFloat(quantity) + 1 : 2).toString();
    setCartState(local);
  }, []);

  return (
    <div style={styles.cartContainer}>
      {activeTableId && <TableCartHeader />}
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <FiShoppingBag size={18} color="#1e293b" />
          <span style={styles.myCartTxt}>Current Order</span>
        </div>
        {cart.length > 0 && (
          <button
            className="pos-clear-btn"
            style={styles.clearBtn}
            onClick={() => {
              setCartState([]);
              updatePosState({ discountAmount: null });
            }}
          >
            <MdClear size={16} color="#64748b" />
          </button>
        )}
      </div>
      <div style={styles.cartItems}>
        {cart.length > 0 ? (
          <div
            style={{ overflow: "auto", height: "100%", width: "100%" }}
          >
            {cart?.map((cartItem, index) => (
              <CartItem
                style={styles.cartItem1}
                key={index}
                cartItem={cartItem}
                index={index}
                removeAction={() => handleRemove(index)}
                decreaseAction={() => handleDecrease(index)}
                increaseAction={() => handleIncrease(index)}
              />
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconCircle}>
              <FiShoppingBag size={28} color="#cbd5e1" />
            </div>
            <span style={styles.emptyTitle}>No items yet</span>
            <span style={styles.emptySubtitle}>Add items from the menu to get started</span>
          </div>
        )}
      </div>
      <div style={styles.totalsContainer}>
        <div style={styles.topGroupTotalsContainer}>
          <div>
            <textarea
              className="pos-note-textarea"
              placeholder="Write a note..."
              style={{
                height: 52,
                width: "100%",
                backgroundColor: "white",
                borderRadius: 8,
                padding: 8,
                marginBottom: 8,
                border: "1px solid #eee",
                resize: "none",
                fontFamily: "inherit",
                fontSize: 13,
                boxSizing: "border-box",
              }}
              value={cartNote ? cartNote : ""}
              onChange={(e) => {
                updatePosState({ cartNote: e.target.value });
              }}
            />
            <div style={{ position: "relative" }}>
              <CartAmountRow
                amountValue={
                  discountAmount
                    ? discountAmount.includes("%")
                      ? discountAmount
                      : `$${discountAmount}`
                    : "N/A"
                }
                amountLbl="Discount"
                style={styles.discountRow}
              />
              {discountAmount && (
                <button
                  className="pos-remove-btn"
                  style={{
                    borderRadius: 30,
                    height: 18,
                    width: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#ef4444",
                    position: "absolute",
                    right: -28,
                    top: 1,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                  onClick={() => {
                    updatePosState({ discountAmount: null });
                  }}
                >
                  <MdClear size={14} color="white" />
                </button>
              )}
            </div>
          </div>
          {deliveryChecked && parseFloat(storeDetails.deliveryPrice) && (
            <CartAmountRow
              amountValue={`$${parseFloat(storeDetails.deliveryPrice).toFixed(
                2
              )}`}
              amountLbl="Delivery"
              style={styles.discountRow}
            />
          )}
          <CartAmountRow
            amountValue={
              deliveryChecked &&
              parseFloat(storeDetails.deliveryPrice) &&
              cartSub > 0
                ? `$${(
                    cartSub - parseFloat(storeDetails.deliveryPrice)
                  ).toFixed(2)}`
                : `$${cartSub.toFixed(2)}`
            }
            amountLbl="Subtotal"
            style={styles.subtotalRow}
          />
          <CartAmountRow
            amountValue={`$${(total > 0 ? (total - cartSub) : 0).toFixed(2)}`}
            amountLbl={`Tax (${
              parseFloat(storeDetails.taxRate) >= 0
                ? parseFloat(storeDetails.taxRate)
                : 13
            }%)`}
            style={styles.taxRow}
          />
        </div>
        <div style={styles.totalRowGroup}>
          <div style={styles.totalRow}>
            <span style={styles.total2}>Total</span>
            <span style={styles.totalValue}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {isOnlineOrder ? (
        <button
          className="pos-checkout-btn pos-checkout-filled"
          style={{
            width: "88%",
            height: 44,
            backgroundColor: "#1e293b",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            opacity: cart.length < 1 ? 0.5 : 1,
            border: "none",
            cursor: "pointer",
            display: "flex",
            marginBottom: 12,
          }}
          disabled={cart.length < 1}
          onClick={() => {
            const today = firebase.firestore.Timestamp.now();
            const transNum = Math.random().toString(36).substr(2, 9);

            if (orderDetails.delivery) {
              setOrderDetailsState({
                date: today,
                transNum: transNum,
                total: total.toFixed(2),
                method: "deliveryOrder",
                online: true,
                cart: cart,
                page: 5,
              });
            } else {
              setOrderDetailsState({
                date: today,
                transNum: transNum,
                total: total.toFixed(2),
                method: "pickupOrder",
                online: true,
                cart: cart,
                customer: {
                  ...orderDetails.customer,
                  address: null,
                },
                page: 5,
              });
            }
          }}
        >
          <span
            style={{
              fontWeight: "600",
              color: "#fff",
              fontSize: 15,
            }}
          >
            Checkout
          </span>
        </button>
      ) : (
        <CheckoutButton />
      )}
    </div>
  );
};

export default Cart;

const styles: Record<string, React.CSSProperties> = {
  cartContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderLeft: "1px solid #e8eaed",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "88%",
    display: "flex",
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  myCartTxt: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 16,
    display: "inline-block",
  },
  clearBtn: {
    borderRadius: 8,
    height: 28,
    width: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    display: "flex",
  },
  cartItems: {
    width: "88%",
    flex: 1,
    minHeight: 0,
  },
  cartItem1: {
    width: "100%",
    marginBottom: 8,
  },
  emptyState: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
  },
  totalsContainer: {
    width: "88%",
    backgroundColor: "#f8f9fc",
    borderRadius: 12,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 8,
  },
  topGroupTotalsContainer: {
    width: "100%",
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  discountRow: {
    alignSelf: "stretch",
  },
  subtotalRow: {
    alignSelf: "stretch",
  },
  taxRow: {
    alignSelf: "stretch",
  },
  totalRowGroup: {
    width: "100%",
    borderTop: "1px solid #e2e8f0",
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
  },
  totalRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    display: "flex",
  },
  total2: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
  },
  totalValue: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
  },
};
