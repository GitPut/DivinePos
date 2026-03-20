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
- Data Analytics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
`}
          selectPlan={() => {
            setplanType("freeTrial");
          }}
          isPlanSelected={planType === "freeTrial"}
        />
        <Plan
          planName="Starter"
          planPrice="49"
          planPeriodDesc="Auto-renews unless cancelled"
          planDescription={`
- Data Analytics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
- We setup Your Store for You
- Add an extra station for $10/month
`}
          selectPlan={() => {
            setplanType("starter");
          }}
          isPlanSelected={planType === "starter"}
          recurence="/ month"
        />
        <Plan
          planName="Professional"
          planPrice="99"
          planPeriodDesc="Auto-renews unless cancelled"
          planDescription={`
- Data Analytics on your store
- Universal Device Compatibility
- Personalize Your Products
- 2 stations, and 1 location
- 24/7 Support
- Online Store Included
- We setup Your Store for You
- Add an extra station for $10/month
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
    gap: 24,
    flexWrap: "wrap",
  },
};

export default PlanStage;
