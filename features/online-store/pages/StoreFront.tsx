import React from "react";
import { FaPhone } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { FiShoppingBag, FiTruck, FiClock, FiArrowRight } from "react-icons/fi";
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

  const isMobile = screenWidth < 700;

  const handleLogoClick = () => {
    if (page === 5) {
      setOrderDetailsState({ page: 4 });
    } else {
      setOrderDetailsState({ ...orderDetails, delivery: false, address: null, page: 1 });
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Banner */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay}>
          {/* Logo / Store Name */}
          <button style={styles.logoBtn} onClick={handleLogoClick}>
            {storeDetails.hasLogo && storeDetails.logoUrl ? (
              <img src={storeDetails.logoUrl} style={styles.logo} alt="" />
            ) : (
              <div style={styles.logoCircle}>
                <span style={styles.logoInitial}>
                  {(storeDetails.name || "S").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </button>

          <span style={{
            ...styles.storeName,
            fontSize: isMobile ? 32 : 42,
          }}>
            {storeDetails.name}
          </span>

          {/* Store info */}
          <div style={styles.infoRow}>
            {storeDetails.phoneNumber && (
              <div style={styles.infoPill}>
                <FaPhone size={11} color="#fff" />
                <span style={styles.infoPillText}>{storeDetails.phoneNumber}</span>
              </div>
            )}
            {storeDetails.address?.value?.structured_formatting?.main_text && (
              <div style={styles.infoPill}>
                <IoLocationSharp size={13} color="#fff" />
                <span style={styles.infoPillText}>
                  {storeDetails.address.value.structured_formatting.main_text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Type Selection */}
      <div style={styles.orderSection}>
        <div style={styles.orderSectionInner}>
          <div style={styles.sectionHeader}>
            <FiClock size={18} color="#1D294E" />
            <span style={styles.sectionTitle}>Start Your Order</span>
          </div>
          <span style={styles.sectionSubtitle}>Choose how you'd like to receive your food</span>

          <div style={{
            ...styles.cardsRow,
            flexDirection: isMobile ? "column" : "row",
          }}>
            {/* Pickup Card */}
            <button
              style={styles.orderCard}
              onClick={() => setOrderDetailsState({ page: 2 })}
            >
              <div style={styles.cardTop}>
                <div style={{ ...styles.cardIcon, backgroundColor: "#eef6ff" }}>
                  <FiShoppingBag size={24} color="#1D294E" />
                </div>
                <div style={styles.cardTextGroup}>
                  <span style={styles.cardTitle}>Pickup</span>
                  <span style={styles.cardDesc}>Order ahead and pick up in store</span>
                </div>
              </div>
              <div style={styles.cardArrow}>
                <FiArrowRight size={18} color="#1D294E" />
              </div>
            </button>

            {/* Delivery Card */}
            {storeDetails.acceptDelivery && (
              <button
                style={styles.orderCard}
                onClick={() => {
                  setOrderDetailsState({ ...orderDetails, delivery: true, page: 3 });
                }}
              >
                <div style={styles.cardTop}>
                  <div style={{ ...styles.cardIcon, backgroundColor: "#fef3e2" }}>
                    <FiTruck size={24} color="#e67e22" />
                  </div>
                  <div style={styles.cardTextGroup}>
                    <span style={styles.cardTitle}>Delivery</span>
                    <span style={styles.cardDesc}>Get it delivered to your door</span>
                  </div>
                </div>
                <div style={styles.cardArrow}>
                  <FiArrowRight size={18} color="#e67e22" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerInner}>
          {storeDetails.phoneNumber && (
            <span style={styles.footerText}>
              📞 {storeDetails.phoneNumber}
            </span>
          )}
          {storeDetails.address?.value?.structured_formatting && (
            <span style={styles.footerText}>
              📍 {storeDetails.address.value.structured_formatting.main_text}, {storeDetails.address.value.structured_formatting.secondary_text}
            </span>
          )}
          {storeDetails.website && (
            <span style={styles.footerText}>
              🌐 {storeDetails.website}
            </span>
          )}
        </div>
        <span style={styles.poweredBy}>Powered by Divine POS</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  // Hero Banner
  heroBanner: {
    width: "100%",
    backgroundColor: "#1D294E",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px 40px",
    width: "100%",
    maxWidth: 600,
    gap: 12,
    position: "relative",
    zIndex: 1,
  },
  logoBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 8,
  },
  logo: {
    height: 60,
    maxWidth: 200,
    objectFit: "contain",
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "2px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoInitial: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  storeName: {
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  infoPill: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: "5px 14px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  infoPillText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  // Order Section
  orderSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "32px 20px 40px",
    backgroundColor: "#f8f9fb",
  },
  orderSectionInner: {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  sectionHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  cardsRow: {
    display: "flex",
    gap: 12,
    width: "100%",
  },
  orderCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e8ecf1",
    padding: "20px 20px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    textAlign: "left",
    transition: "box-shadow 0.15s, border-color 0.15s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  cardTop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTextGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "400",
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // Footer
  footer: {
    width: "100%",
    borderTop: "1px solid #f1f5f9",
    padding: "20px 24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    boxSizing: "border-box",
  },
  footerInner: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  poweredBy: {
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 4,
  },
};

export default StoreFront;
