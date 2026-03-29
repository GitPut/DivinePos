import React from "react";
import { FiArrowLeft, FiTruck } from "react-icons/fi";
import DeliveryDetails from "../components/DeliveryDetails";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
  onlineStoreState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import { getContrastStyles } from "utils/colorContrast";

function OnlineOrderHomeDelivery() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const onlineStore = onlineStoreState.use();
  const { width: screenWidth } = useWindowSize();
  const isMobile = screenWidth < 640;
  const c = getContrastStyles(onlineStore.brandColor || "#0d0d0d");

  const handleBack = () => {
    setOrderDetailsState({ ...orderDetails, delivery: false, address: null });
    setOrderDetailsState({ page: 1 });
  };

  return (
    <div style={{ ...styles.page, backgroundColor: onlineStore.brandColor || "#0d0d0d" }}>
      {/* Header bar */}
      <div style={{ ...styles.header, borderBottomColor: c.divider }}>
        <button style={{ ...styles.backBtn, backgroundColor: c.overlay, borderColor: c.overlayBorder }} onClick={handleBack}>
          <FiArrowLeft size={18} color={c.text} />
        </button>
        <span style={{ ...styles.headerTitle, color: c.textMuted }}>{storeDetails.name}</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Centered content */}
      <div style={styles.center}>
        <div style={{ ...styles.formBox, maxWidth: isMobile ? "100%" : 400 }}>
          <div style={{ ...styles.iconCircle, backgroundColor: c.btnBg }}>
            <FiTruck size={20} color={c.btnText} />
          </div>
          <span style={{ ...styles.title, color: c.text }}>Delivery Order</span>
          <span style={{ ...styles.subtitle, color: c.textFaint }}>
            Enter your details and address — we'll bring it to you
            {storeDetails.deliveryPrice && parseFloat(storeDetails.deliveryPrice) > 0
              ? ` ($${parseFloat(storeDetails.deliveryPrice).toFixed(2)} delivery fee)`
              : ""}
          </span>
          {storeDetails.minimumDeliveryOrder && parseFloat(storeDetails.minimumDeliveryOrder) > 0 && (
            <span style={{ ...styles.minimumBadge, backgroundColor: c.overlay, borderColor: c.overlayBorder, color: c.textMuted }}>
              Minimum order: ${parseFloat(storeDetails.minimumDeliveryOrder).toFixed(2)}
            </span>
          )}
          <DeliveryDetails contrast={c} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: "100%",
    width: "100%",
    backgroundColor: "#0d0d0d",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    flexShrink: 0,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },
  center: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    overflow: "auto",
  },
  formBox: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center" as const,
    maxWidth: 340,
    marginBottom: 8,
    lineHeight: "1.5",
  },
  minimumBadge: {
    fontSize: 13,
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
};

export default OnlineOrderHomeDelivery;
