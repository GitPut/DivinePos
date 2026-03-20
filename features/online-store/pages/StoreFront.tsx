import React from "react";
import { FaPhone } from "react-icons/fa";
import { IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import { FiShoppingBag, FiTruck } from "react-icons/fi";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";

function StoreFront() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();
  const isMobile = screenWidth < 640;

  const handleLogoClick = () => {
    if (page === 5) {
      setOrderDetailsState({ page: 4 });
    } else {
      setOrderDetailsState({ ...orderDetails, delivery: false, address: null, page: 1 });
    }
  };

  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.hero}>
        {/* Background pattern */}
        <div style={styles.heroBgPattern} />

        <div style={styles.heroContent}>
          {/* Store logo or initial */}
          <button style={styles.logoBtn} onClick={handleLogoClick}>
            {hasLogo ? (
              <img src={storeDetails.logoUrl!} style={styles.logoImg} alt="" />
            ) : (
              <div style={styles.logoPlaceholder}>
                <span style={styles.logoLetter}>
                  {(storeDetails.name || "S").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </button>

          {/* Store name */}
          <span style={{ ...styles.storeName, fontSize: isMobile ? 28 : 36 }}>
            {storeDetails.name}
          </span>

          {/* Meta row */}
          <div style={styles.metaRow}>
            {storeDetails.phoneNumber && (
              <div style={styles.metaItem}>
                <FaPhone size={11} color="rgba(255,255,255,0.6)" />
                <span style={styles.metaText}>{storeDetails.phoneNumber}</span>
              </div>
            )}
            {storeDetails.address?.value?.structured_formatting?.main_text && (
              <div style={styles.metaItem}>
                <IoLocationSharp size={14} color="rgba(255,255,255,0.6)" />
                <span style={styles.metaText}>
                  {storeDetails.address.value.structured_formatting.main_text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Type Section */}
      <div style={styles.orderSection}>
        <div style={{ ...styles.orderInner, maxWidth: isMobile ? "100%" : 480 }}>
          <span style={styles.orderTitle}>How would you like your order?</span>

          <div style={styles.optionsCol}>
            {/* Pickup */}
            <button
              style={styles.optionBtn}
              onClick={() => setOrderDetailsState({ page: 2 })}
            >
              <div style={{ ...styles.optionIcon, backgroundColor: "#eef4ff" }}>
                <FiShoppingBag size={22} color="#1D294E" />
              </div>
              <div style={styles.optionText}>
                <span style={styles.optionTitle}>Pickup</span>
                <span style={styles.optionDesc}>Order ahead and pick up in store</span>
              </div>
              <div style={styles.optionArrow}>
                <span style={styles.optionArrowText}>→</span>
              </div>
            </button>

            {/* Delivery */}
            {storeDetails.acceptDelivery && (
              <button
                style={styles.optionBtn}
                onClick={() => setOrderDetailsState({ ...orderDetails, delivery: true, page: 3 })}
              >
                <div style={{ ...styles.optionIcon, backgroundColor: "#fef7ed" }}>
                  <FiTruck size={22} color="#d97706" />
                </div>
                <div style={styles.optionText}>
                  <span style={styles.optionTitle}>Delivery</span>
                  <span style={styles.optionDesc}>
                    {storeDetails.deliveryPrice && parseFloat(storeDetails.deliveryPrice) > 0
                      ? `$${parseFloat(storeDetails.deliveryPrice).toFixed(2)} delivery fee`
                      : "Free delivery"}
                  </span>
                </div>
                <div style={styles.optionArrow}>
                  <span style={styles.optionArrowText}>→</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        {storeDetails.address?.value?.structured_formatting && (
          <span style={styles.footerAddress}>
            {storeDetails.address.value.structured_formatting.main_text},{" "}
            {storeDetails.address.value.structured_formatting.secondary_text}
          </span>
        )}
        <span style={styles.footerPowered}>Powered by Divine POS</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
  },
  // Hero
  hero: {
    width: "100%",
    backgroundColor: "#1a1a2e",
    position: "relative",
    overflow: "hidden",
  },
  heroBgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)",
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "44px 24px 40px",
    position: "relative",
    zIndex: 1,
  },
  logoBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 16,
  },
  logoImg: {
    height: 64,
    maxWidth: 200,
    objectFit: "contain",
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "2px solid rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
  },
  storeName: {
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: "1.1",
  },
  metaRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    marginTop: 12,
  },
  metaItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "400",
  },
  // Order Section
  orderSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "32px 20px 40px",
  },
  orderInner: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  optionsCol: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  optionBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: "18px 16px",
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #eee",
    cursor: "pointer",
    textAlign: "left",
    transition: "box-shadow 0.15s, border-color 0.15s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  optionDesc: {
    fontSize: 13,
    color: "#888",
    fontWeight: "400",
  },
  optionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionArrowText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "400",
  },
  // Footer
  footer: {
    width: "100%",
    padding: "16px 24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    boxSizing: "border-box",
    borderTop: "1px solid #f0f0f0",
  },
  footerAddress: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
  },
  footerPowered: {
    fontSize: 11,
    color: "#ccc",
  },
};

export default StoreFront;
