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
    <div
      style={{
        ...styles.cartContainer,
        ...(width > 1300 ? { width: "30%" } : { width: "37%" }),
      }}
    >
      <div
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          display: "flex",
        }}
      >
        <span style={styles.myCartTxt}>My Cart</span>
        {cart.length > 0 ? (
          <button
            style={{
              borderRadius: 10,
              height: 40,
              width: 40,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#1a2951",
              border: "none",
              cursor: "pointer",
              display: "flex",
            }}
            onClick={() => {
              setCartState([]);
              updatePosState({ discountAmount: null });
            }}
          >
            <MdClear size={30} color="white" />
          </button>
        ) : (
          <div style={{ height: 40, width: 40 }} />
        )}
      </div>
      <div style={{ ...styles.cartItems, height: height * 0.4 }}>
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
            }}
          >
            <img
              src={noItemsImg}
              alt=""
              style={{
                width: 200,
                height: "80%",
                objectFit: "contain",
              }}
              key={"noItemsImg"}
            />
          </div>
        )}
      </div>
      <div style={styles.totalsContainer}>
        <div style={styles.topGroupTotalsContainer}>
          <div>
            <textarea
              placeholder="Write a note..."
              style={{
                height: 80,
                width: "100%",
                backgroundColor: "white",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                border: "none",
                resize: "none",
                fontFamily: "inherit",
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
                  style={{
                    borderRadius: 30,
                    height: 22,
                    width: 22,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "red",
                    position: "absolute",
                    right: -35,
                    top: 0,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                  }}
                  onClick={() => {
                    updatePosState({ discountAmount: null });
                  }}
                >
                  <MdClear size={20} color="white" />
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
          style={{
            width: 170,
            height: 48,
            backgroundColor: "#1a2951",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            opacity: cart.length < 1 ? 0.8 : 1,
            border: "none",
            cursor: "pointer",
            display: "flex",
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
              fontWeight: "700",
              color: "rgba(255,255,255,1)",
              fontSize: 20,
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
    width: "28%",
    backgroundColor: "rgba(255,255,255,1)",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.5)",
    alignSelf: "stretch",
    justifyContent: "space-around",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  myCartTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 24,
    width: "90%",
    height: 29,
    display: "inline-block",
  },
  cartItems: {
    width: "90%",
  },
  cartItems_contentContainerStyle: {
    height: "100%",
    width: "100%",
  },
  cartItem1: {
    width: "100%",
    marginBottom: 10,
  },
  cartItem2: {
    width: "100%",
    marginBottom: 10,
  },
  cartItem3: {
    height: 86,
    width: "100%",
    marginBottom: 10,
  },
  cartItem4: {
    height: 86,
    width: "100%",
    marginBottom: 10,
  },
  cartItem5: {
    height: 86,
    width: "100%",
    marginBottom: 10,
  },
  totalsContainer: {
    width: "90%",
    height: 250,
    backgroundColor: "rgba(238,242,255,1)",
    borderRadius: 20,
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  topGroupTotalsContainer: {
    width: 280,
    height: 120,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  discountRow: {
    height: 18,
    alignSelf: "stretch",
  },
  subtotalRow: {
    height: 18,
    alignSelf: "stretch",
  },
  taxRow: {
    height: 18,
    alignSelf: "stretch",
  },
  totalRowGroup: {
    width: 280,
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  totalRow: {
    flexDirection: "row",
    height: 18,
    alignSelf: "stretch",
    justifyContent: "space-between",
    display: "flex",
  },
  total2: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 18,
  },
  totalValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 18,
  },
  discountCodeBtn: {
    minWidth: 140,
    minHeight: 35,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  discountCode: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
};
