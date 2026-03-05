import React, { useEffect, useState } from "react";
import { FiMenu, FiLogOut, FiShoppingCart } from "react-icons/fi";
import {
  orderDetailsState,
  productBuilderState,
  cartState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import Modal from "shared/components/ui/Modal";
import ProductBuilderModal from "features/pos/components/ProductBuilder/ProductBuilderModal";
import ProductsSection from "features/pos/components/Products/ProductsSection";
import CategorySection from "features/pos/components/Products/CategorySection";
import Cart from "features/pos/components/Cart/Cart";
import { posState, updatePosState } from "store/posState";
import CartMobile from "features/pos/components/CartMobile";
import { UserStoreStateProps } from "types";
import { calculateCartTotals } from "utils/cartCalculations";
import useWindowSize from "shared/hooks/useWindowSize";

function OrderCartMain({ catalog }: { catalog: UserStoreStateProps }) {
  const orderDetails = orderDetailsState.use();
  const storeDetails = storeDetailsState.use();
  const page = orderDetails.page;
  const [cartSub, setCartSub] = useState(0);
  const cart = cartState.use();
  const [cartOpen, setcartOpen] = useState(false);
  const { height, width } = useWindowSize();
  const ProductBuilderProps = productBuilderState.use();
  const { section } = posState.use();
  const [allLoaded, setallLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (page === 4) {
      if (catalog.categories.length > 0) {
        updatePosState({ section: catalog.categories[0] });
      }
    }
  }, [page]);

  useEffect(() => {
    if (cart.length > 0) {
      const totals = calculateCartTotals(
        cart,
        storeDetails.taxRate,
        storeDetails.deliveryPrice,
        orderDetails.delivery ?? false
      );
      setCartSub(totals.subtotal);
    } else {
      setCartSub(0);
    }
  }, [cart]);

  useEffect(() => {
    catalog.products.map((product) => {
      const element = document.getElementById(product.id);
      if (!element) return;
      if (product.category === section) {
        element.style.display = "flex";
      } else {
        element.style.display = "none";
      }
    });
  }, [section, catalog, allLoaded]);

  return (
    <div style={styles.container}>
      {width > 1250 && (
        <div style={styles.leftMenuBarContainer}>
          <button style={styles.menuBtn}>
            <FiMenu style={styles.menuIcon} />
          </button>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => setOrderDetailsState({ page: 1 })}
          >
            <FiLogOut style={styles.icon} />
          </button>
        </div>
      )}
      <div
        style={{
          ...styles.menuContainer,
          ...(width > 1300
            ? { width: "65%" }
            : { width: "58%" }),
          ...(width < 1000 ? { width: "100%" } : {}),
        }}
      >
        {width < 1000 && (
          <div
            style={{
              flexDirection: "row",
              width: "88%",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              marginTop: 10,
              display: "flex",
            }}
          >
            <button
              onClick={() => {
                setOrderDetailsState({ page: 1 });
              }}
              style={{
                backgroundColor: "#1D294E",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 34,
                height: 34,
                display: "flex",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FiLogOut style={{ color: "white", fontSize: 20 }} />
            </button>
            <button
              onClick={() => {
                setcartOpen(true);
              }}
              style={{
                backgroundColor: "#1D294E",
                borderRadius: 10,
                justifyContent: "space-between",
                alignItems: "center",
                width: 58,
                height: 34,
                flexDirection: "row",
                padding: 5,
                display: "flex",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FiShoppingCart style={{ color: "white", fontSize: 20 }} />
              <span style={{ color: "white", fontSize: 20 }}>
                {cart.length}
              </span>
            </button>
          </div>
        )}
        {catalog.products.length > 0 && (
          <>
            <CategorySection catalog={catalog} section={section} />
            <ProductsSection catalog={catalog} setallLoaded={setallLoaded} />
          </>
        )}
      </div>
      {width > 1000 ? (
        <Cart />
      ) : (
        <CartMobile
          cartOpen={cartOpen}
          setcartOpen={setcartOpen}
          cartSub={cartSub}
        />
      )}
      <Modal isVisible={ProductBuilderProps.isOpen ? true : false}>
        <div
          style={{
            height: height,
            width: width,
            flexDirection: "row",
            display: "flex",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={
              width > 1400
                ? {
                    height: "100%",
                    width: "70%",
                    borderTopRightRadius: 3,
                  }
                : {
                    height: "100%",
                    width: "100%",
                    borderTopRightRadius: 3,
                  }
            }
          >
            {ProductBuilderProps.product && <ProductBuilderModal />}
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(238,242,255,1)",
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
  },
  leftMenuBarContainer: {
    width: "5%",
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.5)",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
  },
  menuBtn: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(29,41,78,1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  menuIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 40,
  },
  icon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
    marginTop: 30,
    marginBottom: 30,
    display: "block",
  },
  menuContainer: {
    width: "67%",
    alignSelf: "stretch",
    justifyContent: "space-around",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  bannerContainer: {
    width: "88%",
    height: 150,
    backgroundColor: "rgba(29,41,78,1)",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    display: "flex",
  },
  logo: {
    height: 75,
    width: 250,
    margin: 10,
    objectFit: "contain",
  },
  categoryContainer: {
    width: "88%",
    height: 178,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  lblTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 19,
    marginBottom: 10,
  },
  scrollArea: {
    height: 156,
    alignSelf: "stretch",
  },
  scrollArea_contentContainerStyle: {
    width: "88%",
    height: 156,
  },
  activeCategoryBtn: {
    width: 125,
    marginRight: 15,
    height: 150,
  },
  categoryBtn: {
    width: 125,
    marginRight: 18,
    height: 150,
  },
  scrollAreaProducts: {
    width: "88%",
    height: "56%",
    justifyContent: "center",
    display: "flex",
  },
  scrollAreaProducts_contentContainerStyle: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    display: "flex",
  },
  itemContainer: {
    height: 160,
    width: 290,
    marginBottom: 30,
  },
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
    display: "flex",
    border: "none",
    cursor: "pointer",
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
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  checkoutLbl: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
};

export default OrderCartMain;
