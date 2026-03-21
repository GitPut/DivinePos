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
    <div className="pos-cart-item" style={{ ...styles.container, ...style }}>
      <div
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
                className="pos-cart-action-btn"
                style={styles.cartItemEditBtn}
                onClick={(e) => {
                  e.stopPropagation();
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
                  size={16}
                  color="#555"
                />
              </button>
            )}
            <button
              className="pos-cart-action-btn"
              style={styles.cartItemDecreaseBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (parseFloat(cartItem.quantity ?? "0") === 1 || !cartItem.quantity) {
                  removeAction();
                } else {
                  decreaseAction();
                }
              }}
            >
              <FiMinus size={16} color="#555" />
            </button>
            <button
              className="pos-cart-action-btn"
              style={styles.cartItemIncreaseBtn}
              onClick={(e) => {
                e.stopPropagation();
                increaseAction();
              }}
            >
              <FiPlus size={16} color="#555" />
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          style={{
            width: "90%",
            padding: 10,
            backgroundColor: "#f0f2f8",
            borderRadius: 8,
            fontSize: 12,
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
    backgroundColor: "#f4f5f9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 0",
    display: "flex",
    flexDirection: "column",
  },
  topRowWithImgContainer: {
    width: "90%",
    height: 50,
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
    height: 48,
    width: 48,
    objectFit: "contain" as const,
    borderRadius: 6,
  },
  group: {
    width: "80%",
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
  },
  topRowTxt: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    display: "flex",
  },
  cartItemQuantity: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
  },
  xPlusNameGroup: {
    width: "55%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
  },
  txtX: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 13,
    marginRight: 6,
    display: "inline-block",
  },
  veggiePizza: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: 13,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cartItemPrice: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 14,
  },
  bottomBtnRow: {
    width: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    display: "flex",
  },
  cartItemIncreaseBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    display: "flex",
  },
  cartItemDecreaseBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    display: "flex",
  },
  cartItemEditBtn: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    display: "flex",
  },
};

export default React.memo(CartItem);
