import React from "react";
import { FiShoppingBag, FiTruck } from "react-icons/fi";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
  onlineStoreState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import heroPizza from "assets/images/hero-pizza.png";

function StoreFront() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const onlineStore = onlineStoreState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();
  const isMobile = screenWidth < 700;
  const bgColor = onlineStore.brandColor || "#0d0d0d";
  const storeTagline = onlineStore.tagline || "Fresh, hot, and made to order.\nChoose how you'd like to get your food.";

  const handleLogoClick = () => {
    if (page === 5) {
      setOrderDetailsState({ page: 4 });
    } else {
      setOrderDetailsState({ ...orderDetails, delivery: false, address: null, page: 1 });
    }
  };

  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;

  return (
    <div style={{ ...styles.page, backgroundColor: bgColor }}>
      {/* Left side — content */}
      <div style={{
        ...styles.leftPanel,
        ...(isMobile ? { width: "100%", padding: "48px 24px 32px" } : {}),
      }}>
        {/* Logo */}
        <button style={styles.logoBtn} onClick={handleLogoClick}>
          {hasLogo ? (
            <img src={storeDetails.logoUrl!} style={styles.logoImg} alt="" />
          ) : (
            <div style={styles.logoFallback}>
              <span style={styles.logoLetter}>
                {(storeDetails.name || "S").charAt(0)}
              </span>
            </div>
          )}
        </button>

        {/* Main content */}
        <div style={styles.textContent}>
          <h1 style={{
            ...styles.storeName,
            fontSize: isMobile ? 34 : 46,
          }}>
            {storeDetails.name}
          </h1>

          <p style={styles.subtitle}>{storeTagline}</p>

          {/* Info chips */}
          <div style={styles.infoRow}>
            {storeDetails.phoneNumber && (
              <span style={styles.infoChip}>{storeDetails.phoneNumber}</span>
            )}
            {storeDetails.address?.value?.structured_formatting?.main_text && (
              <span style={styles.infoChip}>
                {storeDetails.address.value.structured_formatting.main_text}
              </span>
            )}
          </div>
        </div>

        {/* CTA Buttons — stacked */}
        <div style={styles.ctaGroup}>
          <button
            style={styles.pickupBtn}
            onClick={() => setOrderDetailsState({ page: 2 })}
          >
            <div style={styles.iconCircle}>
              <FiShoppingBag size={20} color="#1D294E" />
            </div>
            <div style={styles.btnTextGroup}>
              <span style={styles.btnTitle}>Pickup</span>
              <span style={styles.btnDesc}>Ready when you arrive</span>
            </div>
          </button>

          {storeDetails.acceptDelivery && (
            <button
              style={styles.deliveryBtn}
              onClick={() => setOrderDetailsState({ ...orderDetails, delivery: true, page: 3 })}
            >
              <div style={styles.deliveryIconCircle}>
                <FiTruck size={20} color="#fff" />
              </div>
              <div style={styles.btnTextGroup}>
                <span style={styles.deliveryBtnTitle}>Delivery</span>
                <span style={styles.deliveryBtnDesc}>
                  Straight to your door
                  {storeDetails.deliveryPrice && parseFloat(storeDetails.deliveryPrice) > 0
                    ? ` · $${parseFloat(storeDetails.deliveryPrice).toFixed(2)}`
                    : ""}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <span style={styles.poweredBy}>Powered by Divine POS</span>
      </div>

      {/* Right side — hero pizza image (desktop only) */}
      {!isMobile && (
        <div style={styles.rightPanel}>
          <img src={heroPizza} style={styles.heroImg} alt="" />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0d0d0d",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  leftPanel: {
    width: "50%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "48px 56px 32px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
  },
  logoBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  logoImg: {
    height: 50,
    maxWidth: 180,
    objectFit: "contain" as const,
  },
  logoFallback: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  textContent: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 36,
  },
  storeName: {
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
    lineHeight: "1.05",
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: 360,
    whiteSpace: "pre-line" as const,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 8,
    flexWrap: "wrap" as const,
    marginTop: 4,
  },
  infoChip: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    padding: "5px 12px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  ctaGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    width: "100%",
    maxWidth: 400,
  },
  pickupBtn: {
    width: "100%",
    height: 70,
    backgroundColor: "#fff",
    border: "none",
    borderRadius: 16,
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 14,
    padding: "0 20px",
    cursor: "pointer",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deliveryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  btnTextGroup: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    gap: 1,
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1D294E",
  },
  btnDesc: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "400",
  },
  deliveryBtn: {
    width: "100%",
    height: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 14,
    padding: "0 20px",
    cursor: "pointer",
  },
  deliveryBtnTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  deliveryBtnDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "400",
  },
  poweredBy: {
    fontSize: 11,
    color: "rgba(255,255,255,0.1)",
    marginTop: "auto",
  },
  rightPanel: {
    width: "50%",
    height: "100%",
    position: "relative" as const,
    overflow: "hidden",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    objectPosition: "left center",
  },
};

export default StoreFront;
