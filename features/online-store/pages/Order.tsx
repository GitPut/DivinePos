import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import {
  orderDetailsState,
  productBuilderState,
  resetProductBuilderState,
  cartState,
  setOrderDetailsState,
  storeDetailsState,
  onlineStoreState,
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
  const onlineStore = onlineStoreState.use();
  const page = orderDetails.page;
  const brandColor = onlineStore.brandColor || "#1D294E";
  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;
  const fontClass = `font-${onlineStore.fontStyle || "modern"}`;
  const [cartSub, setCartSub] = useState(0);
  const cart = cartState.use();
  const [cartOpen, setCartOpen] = useState(false);
  const { height, width } = useWindowSize();
  const ProductBuilderProps = productBuilderState.use();
  const { section } = posState.use();
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

  return (
    <div className={fontClass} style={styles.container}>
      {/* Header bar */}
      <div style={{ ...styles.headerBar, backgroundColor: brandColor }}>
        <button
          onClick={() => setOrderDetailsState({ page: 1 })}
          style={{ ...styles.backBtn, backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.2)" }}
        >
          <FiArrowLeft size={18} color="#fff" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasLogo && <img src={storeDetails.logoUrl!} style={{ height: 30, maxWidth: 100, objectFit: "contain" as const }} alt="" />}
          <span style={{ ...styles.storeName, color: "#fff" }}>{storeDetails.name || "Menu"}</span>
        </div>
        {width < 1000 && (
          <button onClick={() => setCartOpen(true)} style={{ ...styles.cartBtn, backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.2)" }}>
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
              <ProductsSection catalog={catalog} section={section} />
            </>
          )}
        </div>

        {/* Cart sidebar (desktop only) */}
        {width >= 1000 && (
          <div
            style={{
              ...styles.cartSidebar,
              width: width > 1300 ? 380 : 340,
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
          setCartOpen={setCartOpen}
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
            <div style={{ width: width > 1300 ? 380 : 340, flexShrink: 0 }} />
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
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
  },
  headerBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  storeName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 17,
    letterSpacing: -0.3,
  },
  cartBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "0 14px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.15s",
  },
  cartBadge: {
    backgroundColor: "#1D294E",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    borderRadius: 10,
    padding: "2px 7px",
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
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
};

export default OrderCartMain;
