import React from "react";
import Plan from "./Plan";

interface PlanStageProps {
  planType: string | null;
  setplanType: (planType: string) => void;
}

function PlanStage({ planType, setplanType }: PlanStageProps) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.title}>Choose your plan</span>
        <span style={styles.subtitle}>Start with a free trial or pick the plan that works for you</span>
      </div>
      <div style={styles.divider} />
      <div style={styles.plansRow}>
        <Plan
          planName="Free Trial"
          planPrice="0"
          planPeriodDesc="For 1 month"
          planDescription={`
- 1 Device
- Data Analytics
- Personalize Your Products
- Cloud-Based
- 24/7 Support
`}
          selectPlan={() => setplanType("freeTrial")}
          isPlanSelected={planType === "freeTrial"}
        />
        <Plan
          planName="Starter"
          planPrice="29"
          planPeriodDesc="Auto-renews unless cancelled"
          planDescription={`
- 1 Device
- Data Analytics
- Personalize Your Products
- Cloud-Based
- 24/7 Support
- We Setup Your Store for You
`}
          selectPlan={() => setplanType("starter")}
          isPlanSelected={planType === "starter"}
          recurence="/ month"
        />
        <Plan
          planName="Professional"
          planPrice="69"
          planPeriodDesc="Auto-renews unless cancelled"
          planDescription={`
- Unlimited Devices
- Data Analytics
- Personalize Your Products
- Online Store Included
- Table Management
- WooCommerce Integration
- Cloud-Based
- 24/7 Support
- We Setup Your Store for You
`}
          selectPlan={() => setplanType("professional")}
          isPlanSelected={planType === "professional"}
          recurence="/ month"
          isRecommended
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
    width: "100%",
    maxWidth: 900,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    marginBottom: 8,
  },
  cardHeader: {
    padding: "28px 36px 0",
    display: "flex",
    flexDirection: "column",
    gap: 6,
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
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    margin: "18px 36px",
  },
  plansRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
    padding: "0 28px 28px",
  },
};

export default PlanStage;
