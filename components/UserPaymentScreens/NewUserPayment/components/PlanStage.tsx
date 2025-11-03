import React from "react";
import { StyleSheet, View } from "react-native";
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
    <View style={styles.container}>
      <HeaderTxt
        Txt="Step 1: Pick Your Plan"
        SubTxt="Get started with a 1 month free trial"
      />
      <View style={styles.contentContainer}>
        <View style={styles.topSectionOfContainer}>
          <PeriodSlider
            setpaymentTerm={setpaymentTerm}
            paymentTerm={paymentTerm}
          />
          <View style={styles.plansRow}>
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
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
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
    backgroundColor: "rgba(255,255,255,1)",
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: 30,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 10,
  },
  topSectionOfContainer: {
    width: 860,
    height: 500,
    justifyContent: "space-between",
    alignItems: "center",
  },
  plansRow: {
    width: 860,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  plan: {
    height: 384,
    width: 275,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 30,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  plan2: {
    height: 384,
    width: 275,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 30,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  plan3: {
    height: 384,
    width: 275,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 30,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buttonRow: {
    height: 50,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    width: 860,
  },
  nextBtn: {
    height: 50,
    width: 143,
  },
});

export default PlanStage;
