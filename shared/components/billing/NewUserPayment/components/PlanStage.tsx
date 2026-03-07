import React from "react";
import HeaderTxt from "./HeaderTxt";
import Plan from "./Plan";

interface PlanStageProps {
  planType: string | null;
  setplanType: (planType: string) => void;
}

function PlanStage({
  planType,
  setplanType,
}: PlanStageProps) {
  return (
    <div style={styles.container}>
      <HeaderTxt
        Txt="Step 1: Pick Your Plan"
        SubTxt="Get started with a 1 month free trial"
      />
      <div style={styles.contentContainer}>
        <div style={styles.topSectionOfContainer}>
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
              planName="STARTER"
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
              recurence="/ Monthly"
            />
            <Plan
              planName="PROFESSIONAL"
              planPrice="79"
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
              recurence="/ Monthly"
              isRecommended
            />
          </div>
        </div>
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
    width: 898,
  },
  headerTxt: {
    height: 74,
    width: 378,
    marginBottom: 10,
  },
  contentContainer: {
    width: 898,
    height: 550,
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
    backgroundColor: "rgba(255,255,255,1)",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
    borderRadius: 10,
  },
  topSectionOfContainer: {
    width: 860,
    height: 500,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  plansRow: {
    width: 860,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
};

export default PlanStage;
