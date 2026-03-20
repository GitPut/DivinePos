import React from "react";
import HeaderTxt from "./HeaderTxt";
import Plan from "./Plan";

interface PlanStageProps {
  planType: string | null;
  setplanType: (planType: string) => void;
}

function PlanStage({ planType, setplanType }: PlanStageProps) {
  return (
    <div style={styles.container}>
      <HeaderTxt
        Txt="Choose your plan"
        SubTxt="Start with a free trial or pick the plan that works for you"
      />
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
          selectPlan={() => {
            setplanType("freeTrial");
          }}
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
          selectPlan={() => {
            setplanType("starter");
          }}
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
          selectPlan={() => {
            setplanType("professional");
          }}
          isPlanSelected={planType === "professional"}
          recurence="/ month"
          isRecommended
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 960,
  },
  plansRow: {
    width: "100%",
    flexDirection: "row",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
};

export default PlanStage;
