import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import {
  orderDetailsState,
  productBuilderState,
  resetProductBuilderState,
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
        updatePosState({ section: "__all__" });
      }
    }
  }, [page, catalog]);

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
      if (section === "__all__" || product.category === section) {
        element.style.visibility = "visible";
        element.style.position = "relative";
        element.style.height = "auto";
        element.style.overflow = "visible";
        element.style.pointerEvents = "auto";
      } else {
        element.style.visibility = "hidden";
        element.style.position = "absolute";
        element.style.height = "0";
        element.style.overflow = "hidden";
        element.style.pointerEvents = "none";
      }
    });
  }, [section, catalog, allLoaded]);

  return (
    <div style={styles.container}>
      {/* Header bar */}
      <div style={styles.headerBar}>
        <button
          onClick={() => setOrderDetailsState({ page: 1 })}
          style={styles.backBtn}
        >
          <FiArrowLeft size={18} color="#fff" />
        </button>
        <span style={styles.storeName}>{storeDetails.name || "Menu"}</span>
        {width < 1000 && (
          <button onClick={() => setcartOpen(true)} style={styles.cartBtn}>
            <FiShoppingCart size={18} color="#fff" />
            {cart.length > 0 && (
              <span style={styles.cartBadge}>{cart.length}</span>
            )}
          </button>
        )}
        {width >= 1000 && <div style={{ width: 40 }} />}
      </div>

      {/* Main content area */}
      <div style={styles.contentRow}>
        {/* Products section */}
        <div
          style={{
            ...styles.menuContainer,
            ...(width >= 1000 ? { flex: 1 } : { width: "100%" }),
          }}
        >
          {catalog.products.length > 0 && (
            <>
              <CategorySection catalog={catalog} section={section} />
              <ProductsSection catalog={catalog} setallLoaded={setallLoaded} />
            </>
          )}
        </div>

        {/* Cart sidebar (desktop only) */}
        {width >= 1000 && (
          <div
            style={{
              ...styles.cartSidebar,
              width: width > 1300 ? 360 : 320,
            }}
          >
            <Cart />
          </div>
        )}
      </div>

      {/* Mobile cart */}
      {width < 1000 && (
        <CartMobile
          cartOpen={cartOpen}
          setcartOpen={setcartOpen}
          cartSub={cartSub}
        />
      )}

      {/* Product builder modal */}
      <Modal
        isVisible={ProductBuilderProps.isOpen ? true : false}
        onBackdropPress={() => resetProductBuilderState()}
        animationIn={width < 800 ? "slideInUp" : "slideInLeft"}
        animationOut={width < 800 ? "slideOutDown" : "slideOutLeft"}
      >
        <div
          style={{
            height: height,
            width: width,
            flexDirection: "row",
            display: "flex",
          }}
          onClick={() => resetProductBuilderState()}
        >
          <div
            style={{
              height: "100%",
              flex: 1,
              borderTopRightRadius: width < 800 ? 0 : 3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {ProductBuilderProps.product && <ProductBuilderModal />}
          </div>
          {width >= 1000 && (
            <div style={{ width: width > 1300 ? 360 : 320, flexShrink: 0 }} />
          )}
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#f0f2ff",
    display: "flex",
    flexDirection: "column",
  },
  headerBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    backgroundColor: "#1e293b",
    flexShrink: 0,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  storeName: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 16,
  },
  cartBtn: {
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "0 12px",
    border: "none",
    cursor: "pointer",
    position: "relative",
  },
  cartBadge: {
    backgroundColor: "#ef4444",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    borderRadius: 10,
    padding: "1px 6px",
    minWidth: 18,
    textAlign: "center",
  },
  contentRow: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    minHeight: 0,
    overflow: "hidden",
  },
  menuContainer: {
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
  },
  cartSidebar: {
    alignSelf: "stretch",
    borderLeft: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
};

export default OrderCartMain;
