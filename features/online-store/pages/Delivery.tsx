import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import DeliveryDetails from "../components/DeliveryDetails";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";

function OnlineOrderHomeDelivery() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();

  const handleBack = () => {
    setOrderDetailsState({ ...orderDetails, delivery: false, address: null });
    setOrderDetailsState({ page: 1 });
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={handleBack}>
          <FiArrowLeft size={18} color="#1a1a1a" />
        </button>
        <span style={styles.headerTitle}>{storeDetails.name}</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={{ ...styles.inner, maxWidth: screenWidth < 640 ? "100%" : 440 }}>
          <span style={styles.title}>Delivery Order</span>
          <span style={styles.subtitle}>Enter your details and delivery address</span>

          <div style={styles.card}>
            <DeliveryDetails />
          </div>
        </div>
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
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "32px 20px",
  },
  inner: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid #eee",
    padding: "24px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
};

export default OnlineOrderHomeDelivery;
