import React from "react";
import { FiCheckCircle, FiPhone, FiMapPin } from "react-icons/fi";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
  onlineStoreState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";

function OnlineOrderHomeCompleted() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const onlineStore = onlineStoreState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();

  return (
    <div style={{ ...styles.container, backgroundColor: onlineStore.brandColor || "#0d0d0d" }}>
      <div style={styles.scrollContainer}>
        <div
          style={{
            ...styles.contentWrapper,
            ...(screenWidth < 600 ? { padding: "40px 20px" } : {}),
          }}
        >
          {/* Success icon */}
          <div style={styles.iconWrapper}>
            <FiCheckCircle size={56} color="#22c55e" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <span style={styles.title}>Order Confirmed!</span>
          <span style={styles.subtitle}>
            Thank you for placing an order. We are preparing it now and will have
            it ready for you shortly.
          </span>

          {/* Order info card */}
          <div
            style={{
              ...styles.infoCard,
              ...(screenWidth < 600 ? { padding: "20px 20px" } : {}),
            }}
          >
            <span style={styles.infoCardTitle}>Order Details</span>
            {orderDetails.customer?.name && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Name</span>
                <span style={styles.infoValue}>{orderDetails.customer.name}</span>
              </div>
            )}
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Type</span>
              <span style={styles.infoValue}>
                {orderDetails.delivery ? "Delivery" : "Pickup"}
              </span>
            </div>
            {orderDetails.total != null && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Total</span>
                <span style={{ ...styles.infoValue, fontWeight: "700" }}>
                  ${Number(orderDetails.total).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Place another order button */}
          <button
            style={styles.primaryBtn}
            onClick={() => {
              setOrderDetailsState({
                ...orderDetails,
                delivery: false,
                address: null,
                page: 1,
              });
            }}
          >
            <span style={styles.primaryBtnTxt}>Place Another Order</span>
          </button>

          {/* Store contact info */}
          <div style={styles.contactSection}>
            {storeDetails.phoneNumber && (
              <div style={styles.contactRow}>
                <FiPhone size={15} color="#94a3b8" />
                <span style={styles.contactText}>
                  {storeDetails.phoneNumber}
                </span>
              </div>
            )}
            {storeDetails.address?.value?.structured_formatting?.main_text && (
              <div style={styles.contactRow}>
                <FiMapPin size={15} color="#94a3b8" />
                <span style={styles.contactText}>
                  {storeDetails.address.value.structured_formatting.main_text}
                  {storeDetails.address.value.structured_formatting.secondary_text
                    ? `, ${storeDetails.address.value.structured_formatting.secondary_text}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#0d0d0d",
    display: "flex",
    flexDirection: "column",
  },
  scrollContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 480,
    padding: "60px 24px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(16,185,129,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: "1.6",
    maxWidth: 380,
    marginBottom: 8,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  primaryBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    marginTop: 12,
    transition: "opacity 0.15s",
  },
  primaryBtnTxt: {
    color: "#1D294E",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  contactSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    paddingBottom: 16,
  },
  contactRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.2)",
  },
};

export default OnlineOrderHomeCompleted;
