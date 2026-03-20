import React from "react";
import { IoCheckmark } from "react-icons/io5";

interface PlanProps {
  planName: string;
  planPrice: string;
  planPeriodDesc: string;
  planDescription: string;
  recurence?: string;
  selectPlan: () => void;
  isPlanSelected: boolean;
  isRecommended?: boolean;
}

const Plan = ({
  planName,
  planPrice,
  planPeriodDesc,
  planDescription,
  recurence,
  selectPlan,
  isPlanSelected,
  isRecommended,
}: PlanProps) => {
  const features = planDescription
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line.length > 0);

  return (
    <button
      style={{
        ...styles.container,
        border: isPlanSelected ? "2px solid #1470ef" : "1px solid #e2e8f0",
        backgroundColor: isPlanSelected ? "#f8fafc" : "#fff",
      }}
      onClick={selectPlan}
    >
      {isRecommended && (
        <div style={styles.recommendedBadge}>
          <span style={styles.recommendedText}>Recommended</span>
        </div>
      )}
      <div style={styles.topSection}>
        <span style={styles.planName}>{planName}</span>
        <div style={styles.priceRow}>
          <span style={styles.dollarSign}>$</span>
          <span style={styles.planPrice}>{planPrice}</span>
          {recurence && <span style={styles.recurence}>{recurence}</span>}
        </div>
        <span style={styles.planPeriodDesc}>{planPeriodDesc}</span>
      </div>
      <div style={styles.divider} />
      <div style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <div key={index} style={styles.featureRow}>
            <IoCheckmark size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={styles.featureText}>{feature}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          ...styles.selectPlanBtn,
          backgroundColor: isPlanSelected ? "#1470ef" : "#f1f5f9",
        }}
      >
        <span
          style={{
            ...styles.selectPlanText,
            color: isPlanSelected ? "#fff" : "#0f172a",
          }}
        >
          {isPlanSelected ? "Selected" : "Select Plan"}
        </span>
      </div>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 280,
    padding: "28px 24px 24px",
    cursor: "pointer",
    position: "relative",
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
  topSection: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: "100%",
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
  recurence: {
    fontWeight: "500",
    color: "#94a3b8",
    fontSize: 14,
    marginLeft: 4,
    marginTop: 14,
  },
  planPeriodDesc: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
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
  selectPlanBtn: {
    width: "100%",
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: 20,
    transition: "background-color 0.2s",
  },
  selectPlanText: {
    fontWeight: "600",
    fontSize: 14,
  },
};

export default Plan;
