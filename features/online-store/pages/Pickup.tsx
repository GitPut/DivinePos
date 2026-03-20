import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { FaPhone } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import PickupDetails from "../components/PickupDetails";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import dposLogoWhite from "assets/images/dpos-logo-white.png";

function OnlineOrderHomePickup() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();

  const isMobile = screenWidth < 700;

  const handleLogoClick = () => {
    if (page === 5) {
      setOrderDetailsState({ page: 4 });
    } else {
      setOrderDetailsState({
        ...orderDetails,
        delivery: false,
        address: null,
      });
      setOrderDetailsState({ page: 1 });
    }
  };

  const handleBack = () => {
    setOrderDetailsState({
      ...orderDetails,
      delivery: false,
      address: null,
    });
    setOrderDetailsState({ page: 1 });
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

      {/* Content */}
      <div style={styles.content}>
        <div style={{
          ...styles.formContainer,
          ...(isMobile ? { padding: "32px 20px", maxWidth: "100%" } : {}),
        }}>
          {/* Back button */}
          <button
            style={styles.backButton}
            onClick={handleBack}
          >
            <FiArrowLeft style={{ fontSize: 18, color: "#64748b" }} />
            <span style={styles.backText}>Back</span>
          </button>

          {/* Title */}
          <span style={{
            ...styles.title,
            ...(isMobile ? { fontSize: 24 } : {}),
          }}>
            Pickup Order
          </span>
          <span style={styles.subtitle}>
            Enter your details to place a pickup order
          </span>

          {/* Form Card */}
          <div style={styles.formCard}>
            <PickupDetails />
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
  content: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 24px",
  },
  formContainer: {
    maxWidth: 500,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  backButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
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

export default OnlineOrderHomePickup;
