import React, { useEffect } from "react";
import noItemsImg from "assets/images/noItemsImg.png";
import Modal from "shared/components/ui/Modal";
import {
  orderDetailsState,
  productBuilderState,
  cartState,
  setCartState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import CartAmountRow from "./Cart/CartAmountRow";
import CartItem from "./Cart/CartItem";
import { FiChevronDown, FiShoppingCart } from "react-icons/fi";
import { updatePosState } from "store/posState";
import firebase from "firebase/compat/app";
import useWindowSize from "shared/hooks/useWindowSize";

interface CartMobileProps {
  cartOpen: boolean;
  setcartOpen: (arg: boolean) => void;
  cartSub: number;
}

const CartMobile = ({ cartOpen, setcartOpen, cartSub }: CartMobileProps) => {
  const { height, width } = useWindowSize();
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const isOnlineOrder = productBuilderState.use().isOnlineOrder;

  useEffect(() => {
    if (isOnlineOrder) {
      if (cart.length > 0) {
        let newVal = 0;
        for (let i = 0; i < cart.length; i++) {
          try {
            if (cart[i].quantity ?? 0 > 1) {
              newVal +=
                parseFloat(cart[i].price) * parseFloat(cart[i].quantity ?? "1");
            } else {
              newVal += parseFloat(cart[i].price);
            }
          } catch (error) {
            // noop
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

  return (
    <Modal
      isVisible={cartOpen}
      onBackdropPress={() => setcartOpen(false)}
    >
      <div
        style={{
          width: width,
          height: height,
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            flexDirection: "row",
            width: "90%",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            display: "flex",
          }}
        >
          <button
            onClick={() => {
              setcartOpen(false);
            }}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <FiChevronDown
              size={40}
              color="grey"
            />
          </button>
          <div
            style={{
              backgroundColor: "#1D294E",
              borderRadius: 10,
              justifyContent: "space-between",
              alignItems: "center",
              width: 80,
              height: 40,
              flexDirection: "row",
              padding: 15,
              display: "flex",
              boxSizing: "border-box",
            }}
          >
            <FiShoppingCart
              size={22}
              color="white"
            />
            <span style={{ color: "white", fontSize: 20 }}>{cart.length}</span>
          </div>
        </div>
        <span style={styles.myCartTxt}>My Cart</span>
        {cart.length > 0 ? (
          <div style={styles.cartItems}>
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
                      setCartState(local);
                    }
                  }}
                  increaseAction={() => {
                    const local = structuredClone(cart);
                    const quantity = local[index].quantity ?? false;
                    if (quantity) {
                      local[index].quantity = (
                        parseFloat(quantity) + 1
                      ).toString();
                    } else {
                      local[index].quantity = "2";
                    }
                    setCartState(local);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <img
            src={noItemsImg}
            alt=""
            style={{ width: 200, height: "35%", objectFit: "contain" }}
            key={"noItemsImg"}
          />
        )}
        <div style={{ ...styles.totalsContainer, height: 150 }}>
          <div style={styles.topGroupTotalsContainer}>
            {orderDetails.delivery &&
              parseFloat(storeDetails.deliveryPrice) && (
                <CartAmountRow
                  amountValue={`$${parseFloat(
                    storeDetails.deliveryPrice
                  ).toFixed(2)}`}
                  amountLbl="Delivery"
                  style={styles.discountRow}
                />
              )}
            <CartAmountRow
              amountValue={
                orderDetails.delivery &&
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
                (storeDetails.taxRate
                  ? parseFloat(storeDetails.taxRate) / 100
                  : 0.13)
              ).toFixed(2)}`}
              amountLbl="Tax"
              style={styles.taxRow}
            />
            <div style={styles.totalRow}>
              <span style={styles.total2}>Total</span>
              <span style={styles.totalValue}>
                $
                {(
                  Math.ceil(
                    cartSub *
                      (storeDetails.taxRate
                        ? 1 + parseFloat(storeDetails.taxRate) / 100
                        : 1.13) *
                      10
                  ) / 10
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <button
          style={{
            ...styles.checkoutBtn,
            margin: 20,
            ...(cart.length < 1 ? { opacity: 0.8 } : {}),
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
              setcartOpen(false);
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
              setcartOpen(false);
            }
          }}
        >
          <span style={styles.checkoutLbl}>Checkout</span>
        </button>
      </div>
    </Modal>
  );
};

export default CartMobile;

const styles: Record<string, React.CSSProperties> = {
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
    height: "40%",
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
    height: 85,
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
    height: 66,
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
    minWidth: 120,
    minHeight: 32,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  discountCode: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  checkoutBtn: {
    width: 170,
    height: 48,
    backgroundColor: "#1a2951",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  checkoutLbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
};
