import React from "react";
import { FaPhone } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { FiShoppingBag, FiTruck } from "react-icons/fi";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import dposLogoWhite from "assets/images/dpos-logo-white.png";

function StoreFront() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();

  const isMobile = screenWidth < 700;

  const handleLogoClick = () => {
    if (page === 5) {
      setOrderDetailsState({
        page: 4,
      });
    } else {
      setOrderDetailsState({
        ...orderDetails,
        delivery: false,
        address: null,
        page: 1,
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.logoButton}
          onClick={handleLogoClick}
        >
          {storeDetails.hasLogo ? (
            <img
              src={dposLogoWhite}
              style={styles.logo}
              alt=""
            />
          ) : (
            <span style={styles.logoText}>
              {storeDetails.name}
            </span>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <span style={{
            ...styles.storeName,
            ...(isMobile ? { fontSize: 28 } : {}),
          }}>
            {storeDetails.name}
          </span>

          {/* Store info row */}
          <div style={styles.storeInfoRow}>
            {storeDetails.phoneNumber && (
              <div style={styles.infoChip}>
                <FaPhone style={{ fontSize: 13, color: "#64748b" }} />
                <span style={styles.infoChipText}>{storeDetails.phoneNumber}</span>
              </div>
            )}
            {storeDetails.address?.value?.structured_formatting?.main_text && (
              <div style={styles.infoChip}>
                <IoLocationSharp style={{ fontSize: 15, color: "#64748b" }} />
                <span style={styles.infoChipText}>
                  {storeDetails.address.value.structured_formatting.main_text}
                </span>
              </div>
            )}
          </div>

          <span style={styles.subtitle}>
            How would you like your order?
          </span>

          {/* Order type cards */}
          <div style={{
            ...styles.cardsRow,
            ...(isMobile ? { flexDirection: "column", gap: 16 } : {}),
          }}>
            <button
              style={{
                ...styles.orderCard,
                ...(isMobile ? { width: "100%" } : {}),
              }}
              onClick={() =>
                setOrderDetailsState({
                  page: 2,
                })
              }
            >
              <div style={styles.cardIconWrapper}>
                <FiShoppingBag style={{ fontSize: 28, color: "#1D294E" }} />
              </div>
              <span style={styles.cardTitle}>Pickup</span>
              <span style={styles.cardDescription}>
                Order ahead and pick up in store
              </span>
              <div style={styles.cardButton}>
                <span style={styles.cardButtonText}>Select</span>
              </div>
            </button>

            {storeDetails.acceptDelivery && (
              <button
                style={{
                  ...styles.orderCard,
                  ...(isMobile ? { width: "100%" } : {}),
                }}
                onClick={() => {
                  setOrderDetailsState({
                    ...orderDetails,
                    delivery: true,
                    page: 3,
                  });
                }}
              >
                <div style={styles.cardIconWrapper}>
                  <FiTruck style={{ fontSize: 28, color: "#1D294E" }} />
                </div>
                <span style={styles.cardTitle}>Delivery</span>
                <span style={styles.cardDescription}>
                  Get it delivered to your door
                </span>
                <div style={styles.cardButton}>
                  <span style={styles.cardButtonText}>Select</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          {storeDetails.phoneNumber && (
            <div style={styles.footerItem}>
              <FaPhone style={{ fontSize: 14, color: "#94a3b8" }} />
              <span style={styles.footerText}>{storeDetails.phoneNumber}</span>
            </div>
          )}
          {storeDetails.address?.value?.structured_formatting && (
            <div style={styles.footerItem}>
              <IoLocationSharp style={{ fontSize: 16, color: "#94a3b8" }} />
              <span style={styles.footerText}>
                {storeDetails.address.value.structured_formatting.main_text}
                {", "}
                {storeDetails.address.value.structured_formatting.secondary_text}
              </span>
            </div>
          )}
        </div>
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
  header: {
    width: "100%",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
    boxSizing: "border-box",
  },
  logoButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: 40,
    objectFit: "contain",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  heroSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "48px 24px",
  },
  heroContent: {
    maxWidth: 640,
    width: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  storeName: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  storeInfoRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 16,
  },
  infoChip: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: "6px 14px",
  },
  infoChipText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 24,
  },
  cardsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    width: "100%",
    justifyContent: "center",
  },
  orderCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
  },
  cardIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#f0f4ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDescription: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: "1.4",
  },
  cardButton: {
    marginTop: 8,
    width: "100%",
    height: 44,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    width: "100%",
    borderTop: "1px solid #f1f5f9",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  footerContent: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "center",
  },
  footerItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#94a3b8",
  },
};

export default StoreFront;
