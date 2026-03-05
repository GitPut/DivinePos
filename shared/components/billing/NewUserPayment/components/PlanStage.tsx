import React from "react";
import HeaderTxt from "./HeaderTxt";
import PeriodSlider from "./PeriodSlider";
import Plan from "./Plan";

interface PlanStageProps {
  planType: string | null;
  setplanType: (planType: string) => void;
  setpaymentTerm: (paymentTerm: string) => void;
  paymentTerm: string;
}

function PlanStage({
  planType,
  setplanType,
  setpaymentTerm,
  paymentTerm,
}: PlanStageProps) {
  return (
    <div style={styles.container}>
      <HeaderTxt
        Txt="Step 1: Pick Your Plan"
        SubTxt="Get started with a 1 month free trial"
      />
      <div style={styles.contentContainer}>
        <div style={styles.topSectionOfContainer}>
          <PeriodSlider
            setpaymentTerm={setpaymentTerm}
            paymentTerm={paymentTerm}
          />
          <div style={styles.plansRow}>
            <Plan
              planName="Free Trial"
              planPrice="0"
              planPeriodDesc="For 1 month"
              planDescription={`
- Data Anylitics on your store
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
              planName="STANDARD"
              planPrice={paymentTerm === "monthly" ? "50" : "40"}
              planPeriodDesc="Auto-renews unless cancelled"
              planDescription={`
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
- We setup Your Store for You
- Add a extra station for $10 a month
              `}
              selectPlan={() => {
                setplanType("standard");
              }}
              isPlanSelected={planType === "standard"}
              recurence="/ Monthly"
            />
            <Plan
              planName="PREMIUM"
              planPrice={paymentTerm === "monthly" ? "90" : "80"}
              planPeriodDesc="Auto-renews unless cancelled"
              planDescription={`
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 2 stations, and 1 location
- 24/7 Support
- Online Store
- We setup Your Store for You
- Add a extra station for $10 a month
              `}
              selectPlan={() => {
                setplanType("premium");
              }}
              isPlanSelected={planType === "premium"}
              recurence="/ Monthly"
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
    justifyContent: "space-between",
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
  plan: {
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  plan2: {
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  plan3: {
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  buttonRow: {
    height: 50,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    display: "flex",
    width: 860,
  },
  nextBtn: {
    height: 50,
    width: 143,
  },
};

export default PlanStage;
