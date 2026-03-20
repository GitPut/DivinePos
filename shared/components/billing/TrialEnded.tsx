import React, { useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { logout, createCheckoutSession } from "services/firebase/functions";
import { useAlert } from "react-alert";

const STARTER_PRICE_ID = "price_1T8TIlCIw3L7DOwIDUpngIcI";
const PROFESSIONAL_PRICE_ID = "price_1T8TJBCIw3L7DOwIlItWv4xo";

const STARTER_FEATURES = [
  "Data Analytics on your store",
  "Universal Device Compatibility",
  "Personalize Your Products",
  "1 station, and 1 location",
  "24/7 support",
  "We setup Your Store for You",
  "Add an extra station for $10/month",
];

const PROFESSIONAL_FEATURES = [
  "Data Analytics on your store",
  "Universal Device Compatibility",
  "Personalize Your Products",
  "2 stations, and 1 location",
  "24/7 Support",
  "Online Store Included",
  "We setup Your Store for You",
  "Add an extra station for $10/month",
];

const TrialEnded = () => {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional">("starter");
  const [loading, setloading] = useState(false);
  const alertP = useAlert();

  const Checkout = async () => {
    setloading(true);
    const priceId = selectedPlan === "starter" ? STARTER_PRICE_ID : PROFESSIONAL_PRICE_ID;

    await createCheckoutSession(
      priceId,
      window.location.origin,
      window.location.origin,
      (msg) => alertP.error(`An error occurred: ${msg}`)
    );
  };

  return (
    <div
      style={{
        ...styles.overlay,
        ...(loading ? { opacity: 0 } : {}),
      }}
    >
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.title}>Your trial has ended</span>
          <span style={styles.subtitle}>Choose a plan to continue using Divine POS</span>
        </div>

        <div style={styles.plansRow}>
          {/* Starter Plan */}
          <button
            style={{
              ...styles.planCard,
              border: selectedPlan === "starter" ? "2px solid #1470ef" : "1px solid #e2e8f0",
              backgroundColor: selectedPlan === "starter" ? "#f8fafc" : "#fff",
            }}
            onClick={() => setSelectedPlan("starter")}
          >
            <div style={styles.planTop}>
              <span style={styles.planName}>Starter</span>
              <div style={styles.priceRow}>
                <span style={styles.dollarSign}>$</span>
                <span style={styles.planPrice}>49</span>
                <span style={styles.perMonth}>/ month</span>
              </div>
            </div>
            <div style={styles.divider} />
            <div style={styles.featuresContainer}>
              {STARTER_FEATURES.map((feature, index) => (
                <div key={index} style={styles.featureRow}>
                  <IoCheckmark size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Professional Plan */}
          <button
            style={{
              ...styles.planCard,
              border: selectedPlan === "professional" ? "2px solid #1470ef" : "1px solid #e2e8f0",
              backgroundColor: selectedPlan === "professional" ? "#f8fafc" : "#fff",
              position: "relative",
            }}
            onClick={() => setSelectedPlan("professional")}
          >
            <div style={styles.recommendedBadge}>
              <span style={styles.recommendedText}>Recommended</span>
            </div>
            <div style={styles.planTop}>
              <span style={styles.planName}>Professional</span>
              <div style={styles.priceRow}>
                <span style={styles.dollarSign}>$</span>
                <span style={styles.planPrice}>99</span>
                <span style={styles.perMonth}>/ month</span>
              </div>
            </div>
            <div style={styles.divider} />
            <div style={styles.featuresContainer}>
              {PROFESSIONAL_FEATURES.map((feature, index) => (
                <div key={index} style={styles.featureRow}>
                  <IoCheckmark size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        <div style={styles.actionsContainer}>
          <button style={styles.checkoutButton} onClick={Checkout}>
            <span style={styles.checkoutText}>Checkout</span>
          </button>
          <button style={styles.logoutButton} onClick={logout}>
            <span style={styles.logoutText}>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    position: "absolute",
    backdropFilter: "blur(4px)",
  },
  card: {
    width: "90%",
    maxWidth: 720,
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    padding: "40px 36px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  plansRow: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    width: "100%",
    marginBottom: 32,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  planCard: {
    flex: 1,
    minWidth: 260,
    maxWidth: 320,
    borderRadius: 16,
    padding: "28px 24px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    background: "none",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  recommendedBadge: {
    position: "absolute",
    top: -14,
    backgroundColor: "#1470ef",
    borderRadius: 20,
    padding: "5px 16px",
  },
  recommendedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  planTop: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  planName: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "flex-start",
    marginTop: 4,
  },
  dollarSign: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 20,
    marginTop: 4,
  },
  planPrice: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 36,
    lineHeight: "1",
  },
  perMonth: {
    fontWeight: "500",
    color: "#94a3b8",
    fontSize: 14,
    marginLeft: 4,
    marginTop: 14,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e2e8f0",
    margin: "20px 0",
  },
  featuresContainer: {
    width: "100%",
    gap: 10,
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  featureRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  featureText: {
    color: "#334155",
    fontSize: 13,
    lineHeight: "1.4",
    textAlign: "left",
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 320,
  },
  checkoutButton: {
    backgroundColor: "#1470ef",
    borderRadius: 10,
    height: 48,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  logoutText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
};

export default TrialEnded;
