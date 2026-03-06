import React, { useEffect, useState } from "react";
import {
  productBuilderState,
  cartState,
  storeDetailsState,
  storeProductsState,
} from "store/appState";
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
import CustomCashModal from "shared/components/modals/CustomCashModal";
import AuthModal from "shared/components/modals/AuthModal";
import ProductBuilderModal from "./components/ProductBuilder/ProductBuilderModal";
import CartMobile from "./components/CartMobile";
import { FiLogOut, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import useWindowSize from "shared/hooks/useWindowSize";
const CategorySection = React.lazy(
  () => import("./components/Products/CategorySection")
);
const ProductsSection = React.lazy(
  () => import("./components/Products/ProductsSection")
);

function PosScreen() {
  const { height, width } = useWindowSize();
  const catalog = storeProductsState.use();
  const cart = cartState.use();
  const storeDetails = storeDetailsState.use();
  const [cartOpen, setcartOpen] = useState(false);
  const [mobileMenuOpen, setmobileMenuOpen] = useState(false);
  const history = useHistory();

  const {
    section,
    deliveryChecked,
    saveCustomerModal,
    discountAmount,
    cartSub,
  } = posState.use();
  const ProductBuilderProps = productBuilderState.use();
  if (!storeDetails) return null;

  useEffect(() => {
    if (catalog.categories.length > 0) {
      updatePosState({ section: catalog.categories[0] });
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      let newVal = 0;
      for (let i = 0; i < cart.length; i++) {
        try {
          newVal +=
            parseFloat(cart[i]?.price ?? 0) *
            parseFloat(cart[i]?.quantity ?? "1");
        } catch (error) {
          // noop
        }
      }
      if (deliveryChecked) {
        newVal += parseFloat(storeDetails.deliveryPrice);
      }

      if (discountAmount) {
        if (discountAmount.includes("%")) {
          const discount = parseFloat(discountAmount.replace("%", "")) / 100;
          updatePosState({
            cartSub: newVal - newVal * discount,
          });
        } else {
          updatePosState({
            cartSub: newVal - parseFloat(discountAmount),
          });
        }
      } else {
        updatePosState({ cartSub: newVal });
      }
    } else {
      updatePosState({ cartSub: 0 });
    }
  }, [cart, deliveryChecked, discountAmount]);

  useEffect(() => {
    catalog.products.map((product) => {
      const element = document.getElementById(product.id);
      if (!element) return;
      if (product.category === section) {
        element.style.visibility = "visible";
        element.style.position = "relative";
        element.style.height = "auto";
        element.style.overflow = "visible";
        element.style.pointerEvents = "auto";
        element.style.animation = "pos-grid-fade 0.25s ease-out";
      } else {
        element.style.visibility = "hidden";
        element.style.position = "absolute";
        element.style.height = "0";
        element.style.overflow = "hidden";
        element.style.pointerEvents = "none";
      }
    });
  }, [section, catalog]);

  return (
    <div style={styles.container}>
      {width > 1250 && <LeftMenuBar />}
      <div
        style={{
          ...styles.menuContainer,
          ...(width < 1000 ? { width: "100%" } : { flex: 1 }),
        }}
      >
        {width < 1250 && (
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
              onClick={() => setmobileMenuOpen(true)}
              style={{
                backgroundColor: "#1D294E",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 34,
                height: 34,
                border: "none",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <FiMenu size={20} color="white" />
            </button>
            {width < 1000 && (
              <button
                onClick={() => setcartOpen(true)}
                style={{
                  backgroundColor: "#1D294E",
                  borderRadius: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: 58,
                  height: 34,
                  flexDirection: "row",
                  padding: 5,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <FiShoppingCart size={20} color="white" />
                <span style={{ color: "white", fontSize: 20 }}>
                  {cart.length}
                </span>
              </button>
            )}
          </div>
        )}
        {catalog.products.length > 0 && (
          <>
            <CategorySection catalog={catalog} section={section} />
            <ProductsSection catalog={catalog} />
          </>
        )}
      </div>
      {width > 1000 ? (
        <div style={{ width: 340, alignSelf: "stretch", flexShrink: 0 }}>
          <Cart />
        </div>
      ) : (
        <CartMobile
          cartOpen={cartOpen}
          setcartOpen={setcartOpen}
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
      <Modal
        isVisible={mobileMenuOpen}
        onBackdropPress={() => setmobileMenuOpen(false)}
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
            onClick={() => setmobileMenuOpen(false)}
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
            { label: "Pending Orders", icon: pendingOrderIcon, action: () => { updatePosState({ ongoingOrderListModal: true }); setmobileMenuOpen(false); } },
            { label: "Clock In", icon: clockInIcon, action: () => { updatePosState({ clockinModal: true }); setmobileMenuOpen(false); } },
            { label: "Phone Order", icon: phoneOrderIcon, action: () => { updatePosState({ deliveryModal: true }); setmobileMenuOpen(false); } },
            { label: "Discount", icon: percentIcon, action: () => { updatePosState({ discountModal: true }); setmobileMenuOpen(false); } },
            { label: "Custom Cash", icon: dollarSignIcon, action: () => { updatePosState({ customCashModal: true }); setmobileMenuOpen(false); } },
            { label: "Settings", icon: settingsIcon, action: () => {
              setmobileMenuOpen(false);
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
        isVisible={ProductBuilderProps.isOpen ? true : false}
        onBackdropPress={() => {}}
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
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              height: "100%",
              width: width > 1000 ? width - 340 : "100%",
              borderTopRightRadius: 3,
            }}
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
    backgroundColor: "rgba(238,242,255,1)",
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    width: "100%",
    display: "flex",
  },
  menuContainer: {
    alignSelf: "stretch",
    justifyContent: "space-around",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  bannerContainer: {
    width: "93%",
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
  },
};

export default PosScreen;
