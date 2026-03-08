import React, { useEffect, useState } from "react";
import {
  activePlanState,
  productBuilderState,
  resetProductBuilderState,
  cartState,
  storeDetailsState,
  storeProductsState,
} from "store/appState";
import { calculateCartTotals } from "utils/cartCalculations";
import CashPaymentModal from "shared/components/modals/CashPaymentModal";
import PendingOrderModal from "shared/components/modals/PendingOrdersModal/PendingOrdersModal";
import SettingsPasswordModal from "shared/components/modals/SettingsPasswordModal";
import DiscountModal from "shared/components/modals/DiscountModal/DiscountModal";
import PhoneOrderModal from "shared/components/modals/PhoneOrderModal/PhoneOrderModal";
import SavedCustomersModal from "shared/components/modals/SavedCustomersModal/SavedCustomersModal";
import ClockInModal from "shared/components/modals/ClockInModal/ClockInModal";
import LeftMenuBar from "./components/Products/LeftMenuBar";
import pendingOrderIcon from "assets/images/pendingOrderIcon.png";
import clockInIcon from "assets/images/clockInIcon.png";
import phoneOrderIcon from "assets/images/phoneOrderIcon.png";
import percentIcon from "assets/images/percentIcon.png";
import dollarSignIcon from "assets/images/dollarSignIcon.png";
import settingsIcon from "assets/images/settingsIcon.png";
import { settingsAuthState } from "store/appState";
import { useHistory } from "react-router-dom";
import Cart from "./components/Cart/Cart";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import CustomCashModal from "shared/components/modals/CustomCashModal";
import AuthModal from "shared/components/modals/AuthModal";
import ProductBuilderModal from "./components/ProductBuilder/ProductBuilderModal";
import CartMobile from "./components/CartMobile";
import TableFloorView from "./components/Tables/TableFloorView";
import OpenTableModal from "./components/Tables/OpenTableModal";
import TableOrderView from "./components/Tables/TableOrderView";
import { FiLogOut, FiShoppingCart, FiMenu, FiX, FiSearch } from "react-icons/fi";
import useWindowSize from "shared/hooks/useWindowSize";
const CategorySection = React.lazy(
  () => import("./components/Products/CategorySection")
);
const ProductsSection = React.lazy(
  () => import("./components/Products/ProductsSection")
);

// Isolated clock component — only this re-renders every second
const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <span style={styles.storeTimeTxt}>
        {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </span>
      <span style={styles.storeDateTxt}>
        {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </span>
    </>
  );
};

function PosScreen() {
  const { height, width } = useWindowSize();
  const catalog = storeProductsState.use();
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const activePlan = activePlanState.use();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const history = useHistory();

  const {
    section,
    deliveryChecked,
    saveCustomerModal,
    discountAmount,
    cartSub,
    tableViewActive,
  } = posState.use(
    (s) => ({
      section: s.section,
      deliveryChecked: s.deliveryChecked,
      saveCustomerModal: s.saveCustomerModal,
      discountAmount: s.discountAmount,
      cartSub: s.cartSub,
      tableViewActive: s.tableViewActive,
    }),
    shallowEqual
  );
  const ProductBuilderProps = productBuilderState.use();
  if (!storeDetails) return null;

  useEffect(() => {
    updatePosState({ section: "__all__" });
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      const totals = calculateCartTotals(
        cart,
        storeDetails.taxRate,
        storeDetails.deliveryPrice,
        deliveryChecked ?? false,
        discountAmount
      );
      updatePosState({ cartSub: totals.subtotal });
    } else {
      updatePosState({ cartSub: 0 });
    }
  }, [cart, deliveryChecked, discountAmount]);


  return (
    <div style={styles.container}>
      {width > 1250 && <LeftMenuBar />}
      <div
        style={{
          ...styles.menuContainer,
          ...(width < 1000 ? { width: "100%" } : { flex: 1 }),
        }}
      >
        {/* Top header bar */}
        <div style={styles.topBar}>
          {width < 1250 && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={styles.mobileMenuBtn}
            >
              <FiMenu size={18} color="white" />
            </button>
          )}
          <div style={styles.searchContainer}>
            <FiSearch size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          {width > 600 && (
            <div style={styles.storeInfoBadge}>
              <span style={styles.storeNameTxt}>{storeDetails.name || "Store"}</span>
              <Clock />
            </div>
          )}
          {width < 1000 && (
            <button
              onClick={() => setCartOpen(true)}
              style={styles.mobileCartBtn}
            >
              <FiShoppingCart size={16} color="white" />
              <span style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
                {cart.length}
              </span>
            </button>
          )}
        </div>
        {tableViewActive ? (
          <TableFloorView />
        ) : (
          catalog.products.length > 0 && (
            <>
              <CategorySection catalog={catalog} section={section} />
              <ProductsSection catalog={catalog} searchQuery={searchQuery} section={section} />
            </>
          )
        )}
      </div>
      {width > 1000 ? (
        <div style={{ width: 340, alignSelf: "stretch", flexShrink: 0 }}>
          <Cart />
        </div>
      ) : (
        <CartMobile
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
          cartSub={cartSub}
        />
      )}
      <PendingOrderModal />
      <ClockInModal />
      <PhoneOrderModal />
      <SettingsPasswordModal />
      <Modal
        isVisible={saveCustomerModal}
        onBackdropPress={() => updatePosState({ saveCustomerModal: false })}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <SavedCustomersModal />
        </div>
      </Modal>
      <CashPaymentModal />
      <CustomCashModal />
      <DiscountModal />
      <AuthModal />
      <OpenTableModal />
      <TableOrderView />
      <Modal
        isVisible={mobileMenuOpen}
        onBackdropPress={() => setMobileMenuOpen(false)}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 260,
            height: "100%",
            backgroundColor: "#fff",
            boxShadow: "2px 0 12px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              alignSelf: "flex-end",
              marginRight: 16,
              marginBottom: 10,
              padding: 4,
            }}
          >
            <FiX size={22} color="#333" />
          </button>
          {[
            ...(activePlan === "professional" ? [{ label: "Tables", icon: settingsIcon, action: () => { updatePosState({ tableViewActive: true }); setMobileMenuOpen(false); } }] : []),
            { label: "Pending Orders", icon: pendingOrderIcon, action: () => { updatePosState({ ongoingOrderListModal: true }); setMobileMenuOpen(false); } },
            { label: "Clock In", icon: clockInIcon, action: () => { updatePosState({ clockinModal: true }); setMobileMenuOpen(false); } },
            { label: "Phone Order", icon: phoneOrderIcon, action: () => { updatePosState({ deliveryModal: true }); setMobileMenuOpen(false); } },
            { label: "Discount", icon: percentIcon, action: () => { updatePosState({ discountModal: true }); setMobileMenuOpen(false); } },
            { label: "Custom Cash", icon: dollarSignIcon, action: () => { updatePosState({ customCashModal: true }); setMobileMenuOpen(false); } },
            { label: "Settings", icon: settingsIcon, action: () => {
              setMobileMenuOpen(false);
              if (storeDetails.settingsPassword?.length > 0) {
                updatePosState({ settingsPasswordModalVis: true });
              } else {
                settingsAuthState.set(true);
                history.push("/authed/dashboard");
                localStorage.setItem("isAuthedBackend", "true");
              }
            }},
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              <img src={item.icon} style={{ width: 22, height: 22 }} alt="" />
              <span style={{ fontSize: 15, color: "#1a1a1a", fontWeight: "500" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        isVisible={!!ProductBuilderProps.isOpen}
        onBackdropPress={() => resetProductBuilderState()}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
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
              width: width > 1000 ? width - 340 : "100%",
              borderTopRightRadius: 3,
            }}
            onClick={(e) => e.stopPropagation()}
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
    flex: 1,
    backgroundColor: "#f8f9fc",
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    width: "100%",
    display: "flex",
  },
  menuContainer: {
    alignSelf: "stretch",
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    width: "95%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 14,
    paddingBottom: 4,
  },
  searchContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
  },
  searchInput: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "transparent",
    fontFamily: "inherit",
  },
  mobileMenuBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 38,
    height: 38,
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
  },
  mobileCartBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    width: 50,
    height: 38,
    flexDirection: "row",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
  },
  storeInfoBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: "8px 16px",
    minWidth: 100,
  },
  storeNameTxt: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 13,
  },
  storeTimeTxt: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
  },
  storeDateTxt: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
  },
};

export default PosScreen;
