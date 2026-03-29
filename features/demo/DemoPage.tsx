import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useHistory, MemoryRouter, Route } from "react-router-dom";
import {
  cartState,
  setCartState,
  addCartState,
  storeProductsState,
  setStoreProductsState,
  storeDetailsState,
  setStoreDetailsState,
  productBuilderState,
  setProductBuilderState,
  resetProductBuilderState,
  setEmployeesState,
  setCustomersState,
  setTablesState,
  setTableSectionsState,
  setIngredientsState,
  setActivePlanState,
  setDeviceState,
  setTrialDetailsState,
  setTransListState,
  setIsDemoState,
  isDemoState,
  settingsAuthState,
} from "store/appState";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import { calculateCartTotals } from "utils/cartCalculations";
import { getDisplayPrice } from "utils/getDisplayPrice";
import { ProductProp } from "types";
import ProductImage from "shared/components/ui/ProductImage";
import CartItem from "features/pos/components/Cart/CartItem";
import CartAmountRow from "features/pos/components/Cart/CartAmountRow";
import Modal from "shared/components/ui/Modal";
import useWindowSize from "shared/hooks/useWindowSize";
import { FiShoppingBag, FiShoppingCart, FiSearch, FiImage, FiSettings, FiMenu, FiX, FiHome, FiGrid, FiClipboard, FiClock, FiPhone, FiPercent, FiDollarSign } from "react-icons/fi";
import { MdClear } from "react-icons/md";
import Swal from "sweetalert2";
import demoData from "./demoData.json";
import { setDemoSwitchToPOS, setDemoSwitchToAdmin } from "./demoContext";
import LeftMenuBar from "features/pos/components/Products/LeftMenuBar";

const PendingOrdersModal = React.lazy(
  () => import("shared/components/modals/PendingOrdersModal/PendingOrdersModal")
);
const PhoneOrderModal = React.lazy(
  () => import("shared/components/modals/PhoneOrderModal/PhoneOrderModal")
);
const DiscountModal = React.lazy(
  () => import("shared/components/modals/DiscountModal/DiscountModal")
);
const ClockInModal = React.lazy(
  () => import("shared/components/modals/ClockInModal/ClockInModal")
);
const CashPaymentModal = React.lazy(
  () => import("shared/components/modals/CashPaymentModal")
);
const CustomCashModal = React.lazy(
  () => import("shared/components/modals/CustomCashModal")
);
const SavedCustomersModal = React.lazy(
  () => import("shared/components/modals/SavedCustomersModal/SavedCustomersModal")
);
const TableFloorView = React.lazy(
  () => import("features/pos/components/Tables/TableFloorView")
);

const ProductBuilderModal = React.lazy(
  () => import("features/pos/components/ProductBuilder/ProductBuilderModal")
);

const AdminContainer = React.lazy(
  () => import("features/admin/AdminContainer")
);

const DEMO_TAX_RATE = "13";
const DEMO_STORE_NAME = "Peters Pizza Store";

// Isolated clock component
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

function DemoPage() {
  const history = useHistory();
  const { width, height } = useWindowSize();
  const cart = cartState.use();
  const catalog = storeProductsState.use();
  const ProductBuilderProps = productBuilderState.use();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"pos" | "admin">("pos");

  const { section, discountAmount, cartSub } = posState.use(
    (s) => ({
      section: s.section,
      discountAmount: s.discountAmount,
      cartSub: s.cartSub,
    }),
    shallowEqual
  );

  // Initialize demo data on mount
  useEffect(() => {
    setIsDemoState(true);
    settingsAuthState.set(true);
    localStorage.setItem("isAuthedBackend", "true");

    const categories: string[] = (demoData as any).categories ?? [];
    const products: ProductProp[] = ((demoData as any).products ?? []) as ProductProp[];

    // Sort products by category order then rank
    const sorted = [...products].sort((a, b) => {
      const catA = categories.indexOf(a.category ?? "");
      const catB = categories.indexOf(b.category ?? "");
      const orderA = catA === -1 ? categories.length : catA;
      const orderB = catB === -1 ? categories.length : catB;
      if (orderA !== orderB) return orderA - orderB;
      return parseFloat(a.rank ?? "999") - parseFloat(b.rank ?? "999");
    });

    setStoreProductsState({ products: sorted, categories });
    setStoreDetailsState({
      name: DEMO_STORE_NAME,
      phoneNumber: "2266005925",
      website: "",
      deliveryPrice: "3",
      settingsPassword: "demo",
      taxRate: DEMO_TAX_RATE,
      acceptDelivery: true,
      deliveryRange: "5",
      address: (demoData as any).storeDetails?.address,
    });
    setEmployeesState((demoData as any).employees ?? []);
    setCustomersState((demoData as any).customers ?? []);
    setTablesState((demoData as any).tables ?? []);
    setTableSectionsState((demoData as any).tableSections ?? []);
    setIngredientsState((demoData as any).ingredients ?? []);
    setTransListState((demoData as any).transactionsList ?? []);
    setActivePlanState("professional");
    setDeviceState({
      name: "Demo Device",
      id: "demo-device",
      docID: null,
      useDifferentDeviceToPrint: false,
      printToPrinter: null,
      sendPrintToUserID: null,
      printOnlineOrders: false,
    });
    setTrialDetailsState({ endDate: null, hasEnded: false });

    // Load pending orders into ongoingListState
    const pendingOrders = (demoData as any).pendingOrders ?? [];
    updatePosState({ section: "__all__", ongoingListState: pendingOrders });

    // Register the callbacks for Header/LeftMenuBar view switching
    setDemoSwitchToPOS(() => setActiveView("pos"));
    setDemoSwitchToAdmin(() => setActiveView("admin"));

    // Clean up on unmount
    return () => {
      setIsDemoState(false);
      setCartState([]);
      updatePosState({ discountAmount: null, cartSub: 0, section: "__all__", ongoingListState: [] });
      setDemoSwitchToPOS(null);
      setDemoSwitchToAdmin(null);
      settingsAuthState.set(false);
      localStorage.removeItem("isAuthedBackend");
    };
  }, []);

  // Recalculate cart subtotal
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (cart.length > 0) {
      const totals = calculateCartTotals(cart, DEMO_TAX_RATE, "0", false, discountAmount);
      updatePosState({ cartSub: totals.subtotal });
      setTotal(totals.total);
    } else {
      updatePosState({ cartSub: 0 });
      setTotal(0);
    }
  }, [cart, discountAmount]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = catalog.products.filter((product) => {
      const matchesCategory = section === "__all__" || product.category === section;
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    if (section === "__all__" && !query) {
      const categories = catalog.categories;
      return [...filtered].sort((a, b) => {
        const catA = categories.indexOf(a.category ?? "");
        const catB = categories.indexOf(b.category ?? "");
        const orderA = catA === -1 ? categories.length : catA;
        const orderB = catB === -1 ? categories.length : catB;
        if (orderA !== orderB) return orderA - orderB;
        return parseFloat(a.rank ?? "999") - parseFloat(b.rank ?? "999");
      });
    }
    return filtered;
  }, [catalog.products, catalog.categories, section, searchQuery]);

  // Cart handlers
  const handleRemove = useCallback((index: number) => {
    const local = structuredClone(cartState.get());
    local.splice(index, 1);
    setCartState(local);
  }, []);

  const handleDecrease = useCallback((index: number) => {
    const local = structuredClone(cartState.get());
    const quantity = local[index].quantity ?? false;
    if (quantity && parseFloat(quantity) > 1) {
      local[index].quantity = (parseFloat(quantity) - 1).toString();
    } else {
      local[index].quantity = "1";
    }
    setCartState(local);
  }, []);

  const handleIncrease = useCallback((index: number) => {
    const local = structuredClone(cartState.get());
    const quantity = local[index].quantity ?? false;
    local[index].quantity = (quantity ? parseFloat(quantity) + 1 : 2).toString();
    setCartState(local);
  }, []);

  const handleProductClick = useCallback((product: ProductProp) => {
    if (product.options.length > 0) {
      setProductBuilderState({
        product: product,
        itemIndex: null,
        imageUrl: product.imageUrl ? product.imageUrl : null,
        isOpen: true,
      });
    } else {
      addCartState(
        {
          name: product.name,
          price: product.price,
          description: product.description,
          options: [],
          extraDetails: null,
          imageUrl: product.imageUrl ? product.imageUrl : null,
          editableObj: {
            name: product.name,
            price: product.price,
            description: product.description,
            options: product.options,
            total: product.price,
            extraDetails: "",
            id: product.id,
          },
        },
        cartState.get()
      );
    }
  }, []);

  const handlePlaceOrder = () => {
    Swal.fire({
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;padding:10px 0;">
          <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;margin-bottom:20px;animation:popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" style="stroke-dasharray:20;stroke-dashoffset:20;animation:drawCheck 0.4s 0.3s forwards;"/>
            </svg>
          </div>
          <div style="font-size:24px;font-weight:800;color:#1a1a1a;margin-bottom:6px;">Order Received!</div>
          <div style="font-size:15px;color:#64748b;margin-bottom:16px;">Your order is being prepared</div>
          <div style="display:flex;gap:20px;margin-bottom:20px;">
            <div style="text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#1D294E;">~15</div>
              <div style="font-size:12px;color:#94a3b8;">min wait</div>
            </div>
            <div style="width:1px;background:#e2e8f0;"></div>
            <div style="text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#1D294E;">#${Math.floor(1000 + Math.random() * 9000)}</div>
              <div style="font-size:12px;color:#94a3b8;">order number</div>
            </div>
          </div>
          <div style="background:#f8f9fc;border-radius:12px;padding:14px 20px;width:100%;box-sizing:border-box;text-align:center;">
            <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">This is a demo</div>
            <div style="font-size:14px;color:#1a1a1a;font-weight:600;">Sign up to start processing real orders!</div>
          </div>
        </div>
        <style>
          @keyframes popIn{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}
          @keyframes drawCheck{to{stroke-dashoffset:0}}
        </style>
      `,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sign Up Free",
      cancelButtonText: "Keep Exploring",
      confirmButtonColor: "#1D294E",
      showClass: { popup: "swal2-show", backdrop: "swal2-backdrop-show" },
      hideClass: { popup: "swal2-hide", backdrop: "swal2-backdrop-hide" },
    }).then((result) => {
      if (result.isConfirmed) {
        history.push("/sign-up");
      }
    });
  };

  // Desktop cart sidebar
  const renderCart = () => (
    <div style={styles.cartContainer}>
      <div style={styles.cartHeaderRow}>
        <div style={styles.cartHeaderLeft}>
          <FiShoppingBag size={18} color="#1e293b" />
          <span style={styles.myCartTxt}>Current Order</span>
        </div>
        {cart.length > 0 && (
          <button
            className="pos-clear-btn"
            style={styles.clearBtn}
            onClick={() => {
              setCartState([]);
              updatePosState({ discountAmount: null });
            }}
          >
            <MdClear size={16} color="#64748b" />
          </button>
        )}
      </div>
      <div style={styles.cartItems}>
        {cart.length > 0 ? (
          <div style={{ overflow: "auto", height: "100%", width: "100%" }}>
            {cart.map((cartItem, index) => (
              <CartItem
                style={{ width: "100%", marginBottom: 8 }}
                key={index}
                cartItem={cartItem}
                index={index}
                removeAction={() => handleRemove(index)}
                decreaseAction={() => handleDecrease(index)}
                increaseAction={() => handleIncrease(index)}
              />
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconCircle}>
              <FiShoppingBag size={28} color="#cbd5e1" />
            </div>
            <span style={styles.emptyTitle}>No items yet</span>
            <span style={styles.emptySubtitle}>
              Add items from the menu to get started
            </span>
          </div>
        )}
      </div>
      <div style={styles.totalsContainer}>
        <div style={styles.topGroupTotalsContainer}>
          <CartAmountRow
            amountValue="N/A"
            amountLbl="Discount"
            style={{ alignSelf: "stretch" }}
          />
          <CartAmountRow
            amountValue={`$${cartSub.toFixed(2)}`}
            amountLbl="Subtotal"
            style={{ alignSelf: "stretch" }}
          />
          <CartAmountRow
            amountValue={`$${(total > 0 ? total - cartSub : 0).toFixed(2)}`}
            amountLbl={`Tax (${DEMO_TAX_RATE}%)`}
            style={{ alignSelf: "stretch" }}
          />
        </div>
        <div style={styles.totalRowGroup}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total</span>
            <span style={styles.totalValue}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <button
        className="pos-checkout-btn pos-checkout-filled"
        style={{
          ...styles.placeOrderBtn,
          opacity: cart.length < 1 ? 0.5 : 1,
        }}
        disabled={cart.length < 1}
        onClick={handlePlaceOrder}
      >
        <span style={styles.placeOrderTxt}>Place Order</span>
      </button>
    </div>
  );

  // Mobile cart drawer
  const renderMobileCart = () => (
    <Modal
      isVisible={cartOpen}
      onBackdropPress={() => setCartOpen(false)}
      animationIn="slideInRight"
      animationOut="slideOutRight"
    >
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: Math.min(360, width),
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setCartOpen(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            alignSelf: "flex-end",
            marginRight: 16,
            marginTop: 12,
            padding: 4,
          }}
        >
          <MdClear size={22} color="#333" />
        </button>
        {renderCart()}
      </div>
    </Modal>
  );

  // POS View
  const renderPOS = () => (
    <div style={styles.posContainer}>
      {/* Left sidebar (desktop) */}
      {width > 1250 && <LeftMenuBar />}

      {/* Main content area */}
      <div style={styles.menuContainer}>
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
              <span style={styles.storeNameTxt}>{DEMO_STORE_NAME}</span>
              <Clock />
            </div>
          )}
          {width < 1000 && (
            <button
              onClick={() => setCartOpen(true)}
              style={styles.mobileCartBtn}
            >
              <FiShoppingCart size={16} color="white" />
              <span
                style={{
                  color: "white",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {cart.length}
              </span>
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={styles.categoryContainer}>
          <div style={styles.categoryTabsRow}>
            <button
              className="pos-category-pill"
              style={{
                ...styles.categoryTab,
                ...(section === "__all__"
                  ? styles.categoryTabActive
                  : styles.categoryTabInactive),
              }}
              onClick={() => updatePosState({ section: "__all__" })}
            >
              All
            </button>
            {catalog.categories?.map((category) => (
              <button
                key={category}
                className="pos-category-pill"
                style={{
                  ...styles.categoryTab,
                  ...(section === category
                    ? styles.categoryTabActive
                    : styles.categoryTabInactive),
                }}
                onClick={() => updatePosState({ section: category })}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div style={styles.productsArea}>
          <div style={{ overflowY: "auto", height: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  width > 1250
                    ? "repeat(auto-fill, minmax(190px, 1fr))"
                    : "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "12px",
                paddingBottom: 20,
                paddingTop: 4,
              }}
            >
              {filteredProducts.map((product, index) => (
                <DemoProductCard
                  key={product.id || index}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart sidebar (desktop) */}
      {width > 1000 ? (
        <div style={{ width: 340, alignSelf: "stretch", flexShrink: 0 }}>
          {renderCart()}
        </div>
      ) : (
        renderMobileCart()
      )}

      {/* Modals */}
      <React.Suspense fallback={<div />}>
        <PendingOrdersModal />
        <ClockInModal />
        <PhoneOrderModal />
        <DiscountModal />
        <CashPaymentModal />
        <CustomCashModal />
      </React.Suspense>
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
            { label: "Home", Icon: FiHome, action: () => { updatePosState({ tableViewActive: false, ongoingOrderListModal: false, clockinModal: false, deliveryModal: false, discountModal: false, customCashModal: false }); setMobileMenuOpen(false); } },
            { label: "Tables", Icon: FiGrid, action: () => { updatePosState({ tableViewActive: true }); setMobileMenuOpen(false); } },
            { label: "Pending Orders", Icon: FiClipboard, action: () => { updatePosState({ ongoingOrderListModal: true }); setMobileMenuOpen(false); } },
            { label: "Clock In", Icon: FiClock, action: () => { updatePosState({ clockinModal: true }); setMobileMenuOpen(false); } },
            { label: "Phone Order", Icon: FiPhone, action: () => { updatePosState({ deliveryModal: true }); setMobileMenuOpen(false); } },
            { label: "Discount", Icon: FiPercent, action: () => { updatePosState({ discountModal: true }); setMobileMenuOpen(false); } },
            { label: "Custom Cash", Icon: FiDollarSign, action: () => { updatePosState({ customCashModal: true }); setMobileMenuOpen(false); } },
            { label: "Admin", Icon: FiSettings, action: () => { setActiveView("admin"); setMobileMenuOpen(false); } },
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
              <item.Icon size={22} color="#1e293b" />
              <span style={{ fontSize: 15, color: "#1a1a1a", fontWeight: "500" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );

  // Admin View - wrapped in MemoryRouter for internal routing
  const renderAdmin = () => (
    <MemoryRouter initialEntries={["/authed/dashboard"]} initialIndex={0}>
      <React.Suspense fallback={<div />}>
        <Route path="/authed" component={AdminContainer} />
      </React.Suspense>
    </MemoryRouter>
  );

  return (
    <div style={styles.pageContainer}>
      {/* Demo Banner */}
      <div style={styles.demoBanner}>
        <div style={styles.demoBannerContent}>
          <div style={styles.demoBannerLeft}>
            <span style={styles.demoBadge}>DEMO</span>
            <span style={styles.demoBannerText}>
              You are viewing a demo of Divine POS
            </span>
          </div>
          <div style={styles.demoBannerRight}>
            <button
              style={styles.signUpBtn}
              onClick={() => history.push("/sign-up")}
            >
              <span style={styles.signUpBtnTxt}>Sign Up Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active View */}
      {activeView === "pos" ? renderPOS() : renderAdmin()}

      {/* Product Builder Modal */}
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
            {ProductBuilderProps.product && (
              <React.Suspense fallback={<div />}>
                <ProductBuilderModal />
              </React.Suspense>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Demo product card component
interface DemoProductCardProps {
  product: ProductProp;
  onClick: () => void;
}

const DemoProductCard = React.memo(({ product, onClick }: DemoProductCardProps) => {
  const displayPrice = useMemo(() => getDisplayPrice(product), [product]);

  return (
    <div>
      <button
        onClick={onClick}
        className="pos-product-card"
        style={styles.productContainer}
      >
        <div style={styles.imageWrapper}>
          {product.hasImage && product.imageUrl ? (
            <ProductImage
              key={product.id}
              source={product.imageUrl}
              style={styles.itemImg}
              alt={product.name}
            />
          ) : (
            <div style={styles.noImagePlaceholder}>
              <FiImage size={28} color="#cbd5e1" />
            </div>
          )}
        </div>
        <div style={styles.infoSection}>
          <span style={styles.productName}>{product.name}</span>
          {product.category && (
            <span style={styles.categoryLabel}>{product.category}</span>
          )}
          <span style={styles.price}>
            {displayPrice.isFrom && (
              <span style={styles.fromLabel}>From </span>
            )}
            ${displayPrice.price}
          </span>
        </div>
      </button>
    </div>
  );
});

export default DemoPage;

const styles: Record<string, React.CSSProperties> = {
  // Page layout
  pageContainer: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8f9fc",
    overflow: "hidden",
  },

  // Demo banner
  demoBanner: {
    background: "linear-gradient(135deg, #1D294E 0%, #2d3a5e 100%)",
    padding: "10px 20px",
    flexShrink: 0,
    zIndex: 10,
  },
  demoBannerContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1400,
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
  },
  demoBannerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  demoBannerRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  demoBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: 6,
    letterSpacing: 1,
  },
  demoBannerText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  viewSwitchBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "opacity 0.15s ease",
  },
  viewSwitchBtnTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  signUpBtn: {
    backgroundColor: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    cursor: "pointer",
    transition: "opacity 0.15s ease",
  },
  signUpBtnTxt: {
    color: "#1D294E",
    fontSize: 14,
    fontWeight: "700",
  },

  // POS container
  posContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    minHeight: 0,
  },

  // Menu container
  menuContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  // Top bar
  topBar: {
    width: "95%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 14,
    paddingBottom: 4,
    flexShrink: 0,
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
  adminBtn: {
    height: 38,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flexDirection: "row",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
    paddingLeft: 14,
    paddingRight: 14,
  },
  adminBtnTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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

  // Categories
  categoryContainer: {
    width: "95%",
    paddingTop: 8,
    paddingBottom: 8,
  },
  categoryTabsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    overflow: "auto",
    paddingBottom: 4,
  },
  categoryTab: {
    padding: "8px 18px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  categoryTabActive: {
    backgroundColor: "#1e293b",
    color: "#fff",
    border: "1px solid #1e293b",
  },
  categoryTabInactive: {
    backgroundColor: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },

  // Products
  productsArea: {
    width: "95%",
    flex: 1,
    minHeight: 0,
    marginLeft: "auto",
    marginRight: "auto",
  },

  // Product card
  productContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%",
    padding: 0,
    display: "flex",
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "box-shadow 0.15s ease",
    overflow: "hidden",
    boxSizing: "border-box" as const,
    textAlign: "left" as const,
  },
  imageWrapper: {
    width: "100%",
    height: 140,
    backgroundColor: "#f8f9fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative" as const,
  },
  itemImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  infoSection: {
    padding: "10px 12px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  productName: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: 14,
    lineHeight: "1.3",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    minHeight: "2.6em",
  },
  categoryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
  price: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
    marginTop: 4,
  },
  fromLabel: {
    fontWeight: "500",
    fontSize: 12,
    color: "#94a3b8",
  },

  // Cart
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
  cartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "88%",
    display: "flex",
    paddingTop: 16,
    paddingBottom: 10,
  },
  cartHeaderLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  myCartTxt: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 16,
    display: "inline-block",
  },
  clearBtn: {
    borderRadius: 8,
    height: 28,
    width: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    display: "flex",
  },
  cartItems: {
    width: "88%",
    flex: 1,
    minHeight: 0,
  },
  emptyState: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center" as const,
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
  totalRowGroup: {
    width: "100%",
    borderTop: "1px solid #e2e8f0",
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
  totalLabel: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
  },
  totalValue: {
    fontWeight: "700",
    color: "#1a1a1a",
    fontSize: 15,
  },
  placeOrderBtn: {
    width: "88%",
    height: 44,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    display: "flex",
    marginBottom: 12,
  },
  placeOrderTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15,
  },
};
