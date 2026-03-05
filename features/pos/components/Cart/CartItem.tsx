import React, { useState } from "react";
import { MdEdit } from "react-icons/md";
import ProductImage from "shared/components/ui/ProductImage";
import { FiMinus, FiPlus } from "react-icons/fi";
import { setProductBuilderState } from "store/appState";
import { CartItemProp } from "types";

interface CartItemProps {
  cartItem: CartItemProp;
  index: number;
  removeAction: () => void;
  decreaseAction: () => void;
  increaseAction: () => void;
  style?: React.CSSProperties;
}

function CartItem({
  cartItem,
  index,
  removeAction,
  decreaseAction,
  increaseAction,
  style,
}: CartItemProps) {
  const [isOpen, setisOpen] = useState(false);

  return (
    <div style={{ ...styles.container, ...style }}>
      <button
        style={{
          ...styles.topRowWithImgContainer,
          ...(isOpen && { paddingTop: 15, marginBottom: 30 }),
        }}
        onClick={() => {
          cartItem.options.length > 0 && setisOpen((prev) => !prev);
        }}
      >
        {cartItem.imageUrl && (
          <ProductImage
            source={cartItem.imageUrl}
            style={styles.cartItemImg}
          />
        )}
        <div
          style={{
            ...styles.group,
            ...(!cartItem.imageUrl && {
              width: "100%",
            }),
          }}
        >
          <div style={styles.topRowTxt}>
            <span style={styles.cartItemQuantity}>
              {parseFloat(cartItem.quantity ?? "1")}
            </span>
            <div style={styles.xPlusNameGroup}>
              <span style={styles.txtX}>x</span>
              <span style={styles.veggiePizza}>{cartItem.name}</span>
            </div>
            <div style={{ flexDirection: "row", alignItems: "flex-end", display: "flex" }}>
              <span style={styles.cartItemPrice}>
                ${parseFloat(cartItem.price).toFixed(2)}
              </span>
              <span style={{ ...styles.cartItemPrice, fontSize: 8 }}>/EA.</span>
            </div>
          </div>

          <div style={styles.bottomBtnRow}>
            {!cartItem.editableObj && <div />}
            {cartItem.editableObj && (
              <button
                style={styles.cartItemEditBtn}
                onClick={() => {
                  if (!cartItem.editableObj) return;
                  setProductBuilderState({
                    product: {
                      name: cartItem.editableObj.name,
                      price: cartItem.editableObj.price,
                      description: cartItem.editableObj.description,
                      options: cartItem.editableObj.options,
                      total: cartItem.editableObj.price,
                      extraDetails: cartItem.editableObj.extraDetails,
                      id: cartItem.editableObj.id,
                    },
                    itemIndex: index,
                    imageUrl: cartItem.imageUrl ? cartItem.imageUrl : null,
                    isOpen: true,
                  });
                }}
              >
                <MdEdit
                  size={20}
                  color="rgba(0,0,0,1)"
                />
              </button>
            )}
            <button
              style={styles.cartItemDecreaseBtn}
              onClick={() => {
                if (parseFloat(cartItem.quantity ?? "0") === 1 || !cartItem.quantity) {
                  removeAction();
                } else {
                  decreaseAction();
                }
              }}
            >
              <FiMinus size={25} color="rgba(0,0,0,1)" />
            </button>
            <button
              style={styles.cartItemIncreaseBtn}
              onClick={increaseAction}
            >
              <FiPlus size={25} color="rgba(0,0,0,1)" />
            </button>
          </div>
        </div>
      </button>
      {isOpen && (
        <div
          style={{
            width: "90%",
            padding: 15,
            backgroundColor: "rgba(238,242,255,1)",
            borderRadius: 20,
          }}
        >
          {cartItem.options &&
            cartItem.options.map((option, key) => (
              <span
                key={key}
              >
                {option}
              </span>
            ))}
          {cartItem.description && (
            <span
            >
              Description: {cartItem.description}
            </span>
          )}
          {cartItem.extraDetails && (
            <span
            >
              Written Note: {cartItem.extraDetails}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "rgba(238,242,255,1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
    display: "flex",
    flexDirection: "column",
  },
  topRowWithImgContainer: {
    width: "90%",
    height: 61,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    display: "flex",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  cartItemImg: {
    height: 61,
    width: 61,
    objectFit: "contain",
  },
  group: {
    width: "80%",
    height: 33,
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
  },
  topRowTxt: {
    width: "95%",
    height: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
    display: "flex",
  },
  cartItemQuantity: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 19,
  },
  xPlusNameGroup: {
    width: "60%",
    height: 24,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
  },
  txtX: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 16,
    marginRight: 10,
    display: "inline-block",
  },
  veggiePizza: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  cartItemPrice: {
    fontWeight: "700",
    color: "#00c93b",
    fontSize: 18,
  },
  bottomBtnRow: {
    width: 120,
    height: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    display: "flex",
  },
  cartItemIncreaseBtn: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  cartItemDecreaseBtn: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  cartItemEditBtn: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
};

export default CartItem;
