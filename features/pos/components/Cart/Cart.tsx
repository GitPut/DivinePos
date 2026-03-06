import React, { useEffect, useState } from "react";
import noItemsImg from "assets/images/noItemsImg.png";
import CartItem from "./CartItem";
import CartAmountRow from "./CartAmountRow";
import { MdClear } from "react-icons/md";
import CheckoutButton from "./CheckoutButton";
import {
  orderDetailsState,
  productBuilderState,
  cartState,
  setCartState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import { posState, updatePosState } from "store/posState";
import firebase from "firebase/compat/app";
import { calculateCartTotals } from "utils/cartCalculations";
import useWindowSize from "shared/hooks/useWindowSize";

const Cart = () => {
  const { discountAmount, deliveryChecked, cartSub, cartNote } =
    posState.use();
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const { width, height } = useWindowSize();
  const [total, settotal] = useState(0);
  const isOnlineOrder = productBuilderState.use().isOnlineOrder;
  const orderDetails = orderDetailsState.use();

  useEffect(() => {
    if (isOnlineOrder) {
      if (cart.length > 0) {
        let newVal = 0;
        for (let i = 0; i < cart.length; i++) {
          try {
            if (cart[i].quantity ?? 0 > 1) {
              newVal +=
                parseFloat(cart[i].price ?? "0") *
                parseFloat(cart[i].quantity ?? "1");
            } else {
              newVal += parseFloat(cart[i].price ?? "0");
            }
          } catch (error) {
          }
        }
        if (orderDetails.delivery) {
          newVal += parseFloat(storeDetails.deliveryPrice);
        }

        updatePosState({
          cartSub: newVal,
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
      settotal(
        cartSub *
          (parseFloat(storeDetails.taxRate) >= 0
            ? 1 + parseFloat(storeDetails.taxRate) / 100
            : 1.13)
      );
    } else {
      settotal(0);
    }
  }, [cart, discountAmount, deliveryChecked, cartSub, cartNote, storeDetails]);

  return (
    <div style={styles.cartContainer}>
      <div
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "88%",
          display: "flex",
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <span style={styles.myCartTxt}>My Cart</span>
        {cart.length > 0 ? (
          <button
            className="pos-clear-btn"
            style={{
              borderRadius: 8,
              height: 30,
              width: 30,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#1e293b",
              border: "none",
              cursor: "pointer",
              display: "flex",
            }}
            onClick={() => {
              setCartState([]);
              updatePosState({ discountAmount: null });
            }}
          >
            <MdClear size={18} color="white" />
          </button>
        ) : (
          <div style={{ height: 30, width: 30 }} />
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
                removeAction={() => {
                  const local = structuredClone(cart);
                  local.splice(index, 1);
                  setCartState(local);
                }}
                decreaseAction={() => {
                  const local = structuredClone(cart);
                  const quantity = local[index].quantity ?? false;
                  if (quantity && parseFloat(quantity) > 1) {
                    local[index].quantity = (
                      parseFloat(quantity) - 1
                    ).toString();
                  } else {
                    local[index].quantity = "1";
                  }
                  setCartState(local);
                }}
                increaseAction={() => {
                  const local = structuredClone(cart);
                  const quantity = local[index].quantity ?? false;
                  local[index].quantity = (
                    quantity ? parseFloat(quantity) + 1 : 2
                  ).toString();
                  setCartState(local);
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <img
              src={noItemsImg}
              alt=""
              style={{
                width: 100,
                height: 100,
                objectFit: "contain",
                opacity: 0.6,
              }}
              key={"noItemsImg"}
            />
            <span style={{ color: "#aaa", fontSize: 13 }}>No items added</span>
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
            amountValue={`$${(
              cartSub *
              (parseFloat(storeDetails.taxRate) >= 0
                ? parseFloat(storeDetails.taxRate) / 100
                : 0.13)
            ).toFixed(2)}`}
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
                total: (
                  cartSub *
                  (storeDetails.taxRate
                    ? 1 + parseFloat(storeDetails.taxRate) / 100
                    : 1.13)
                ).toFixed(2),
                method: "deliveryOrder",
                online: true,
                cart: cart,
                page: 5,
              });
            } else {
              setOrderDetailsState({
                date: today,
                transNum: transNum,
                total: (
                  cartSub *
                  (storeDetails.taxRate
                    ? 1 + parseFloat(storeDetails.taxRate) / 100
                    : 1.13)
                ).toFixed(2),
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
  myCartTxt: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 18,
    display: "inline-block",
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
    borderTop: "1px solid #e0e0e0",
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
