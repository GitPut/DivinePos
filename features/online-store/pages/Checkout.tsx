import React, { useMemo } from "react";
import { FiArrowLeft } from "react-icons/fi";
import CheckOutDetails from "../components/CheckOutDetails";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
  onlineStoreState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";

function OnlineOrderHomeCheckout() {
  const storeDetails = storeDetailsState.use();
  const onlineStore = onlineStoreState.use();
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();

  const stripeKey = storeDetails.stripePublicKey || onlineStore.stripePublicKey;
  const stripePromise = useMemo(() => stripeKey ? loadStripe(stripeKey) : null, [stripeKey]);
  if (!stripePromise) return null;

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        <div
          style={{
            ...styles.contentWrapper,
            ...(screenWidth < 600 ? { padding: "32px 20px" } : {}),
          }}
        >
          {/* Back button */}
          <button
            onClick={() => {
              if (page === 5) {
                setOrderDetailsState({ page: 4 });
              } else {
                setOrderDetailsState({
                  ...orderDetails,
                  delivery: false,
                  address: null,
                  page: 1,
                });
              }
            }}
            style={styles.backBtn}
          >
            <FiArrowLeft size={16} color="#64748b" />
            <span style={styles.backBtnTxt}>Back to menu</span>
          </button>

          {/* Store logo / name */}
          <div style={styles.logoSection}>
            {storeDetails?.hasLogo ? (
              <img
                src={storeDetails.logoUrl}
                style={styles.logo}
                alt={storeDetails.name}
              />
            ) : (
              <span style={styles.storeNameText}>{storeDetails.name}</span>
            )}
          </div>

          {/* Title */}
          <span style={styles.title}>Checkout</span>
          <span style={styles.subtitle}>Complete your order securely</span>

          {/* Stripe Elements form */}
          <div
            style={{
              ...styles.formCard,
              ...(screenWidth < 600 ? { padding: "24px 20px" } : {}),
            }}
          >
            <Elements stripe={stripePromise}>
              <CheckOutDetails />
            </Elements>
          </div>

          {/* Store contact footer */}
          <div style={styles.footer}>
            {storeDetails.phoneNumber && (
              <span style={styles.footerText}>{storeDetails.phoneNumber}</span>
            )}
            {storeDetails.address?.value?.structured_formatting?.main_text && (
              <span style={styles.footerText}>
                {storeDetails.address.value.structured_formatting.main_text}
              </span>
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
    backgroundColor: "#ffffff",
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
    maxWidth: 520,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 0",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backBtnTxt: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logo: {
    maxWidth: 160,
    maxHeight: 60,
    objectFit: "contain",
  },
  storeNameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1D294E",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  formCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    padding: "28px 28px",
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    marginTop: 24,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
};

export default OnlineOrderHomeCheckout;
