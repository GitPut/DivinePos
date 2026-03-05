import React, { useEffect, useState } from "react";

interface PlanProps {
  planType: string | null;
  paymentTerm: string;
  setstageNum: (stageNum: number) => void;
}

const ViewPlan = ({ planType, paymentTerm, setstageNum }: PlanProps) => {
  const [planName, setplanName] = useState<string | null>(null);
  const [planPrice, setplanPrice] = useState<string | null>(null);
  const [planPeriodDesc, setplanPeriodDesc] = useState<string | null>(null);
  const [planDescription, setplanDescription] = useState<string | null>(null);
  const [recurence, setrecurence] = useState<string | null>(null);

  useEffect(() => {
    if (planType === "freeTrial") {
      setplanName("Free Trial");
      setplanPrice("0");
      setplanPeriodDesc("For 1 month");
      setplanDescription(
        `
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
`
      );
    } else if (planType === "standard") {
      setplanName("STANDARD");
      setplanPrice(paymentTerm === "monthly" ? "50" : "40");
      setplanPeriodDesc("Auto-renews unless cancelled");
      setplanDescription(
        `
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 1 station, and 1 location
- 24/7 support
- We setup Your Store for You
- Add a extra station for $10 a month
              `
      );
      setrecurence("/ Monthly");
    } else if (planType === "premium") {
      setplanName("PREMIUM");
      setplanPrice(paymentTerm === "monthly" ? "90" : "80");
      setplanPeriodDesc("Auto-renews unless cancelled");
      setplanDescription(
        `
- Data Anylitics on your store
- Universal Device Compatibility
- Personalize Your Products
- 2 stations, and 1 location
- 24/7 Support
- Online Store
- We setup Your Store for You
- Add a extra station for $10 a month
              `
      );
      setrecurence("/ Monthly");
    }
  }, [paymentTerm, planType]);

  return (
    <div
      style={{
        ...styles.container,
        height: 430,
        borderTop: "10px solid #1D294E",
      }}
    >
      <div
        style={{
          height: 250,
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={styles.planPriceDetailsGroup}>
          <span style={styles.planName}>{planName}</span>
          <div style={{ flexDirection: "row", display: "flex", alignItems: "flex-end" }}>
            <span style={styles.planPrice}>${planPrice}</span>
            <span style={styles.recurence}>{recurence}</span>
          </div>
          <span style={styles.planPeriodDesc}>{planPeriodDesc}</span>
        </div>
        <div style={styles.planDivider} />
        <span style={styles.planDescription}>{planDescription}</span>
      </div>
      <button
        style={{ ...styles.selectPlanBtn, backgroundColor: "#1c294e" }}
        onClick={() => setstageNum(1)}
      >
        <span style={{ ...styles.selectPlan, color: "white" }}>Change Plan</span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: 384,
    width: 275,
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
    padding: 20,
  },
  planPriceDetailsGroup: {
    height: 93,
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    width: 220,
  },
  planName: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 25,
  },
  planPrice: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 35,
  },
  recurence: {
    fontWeight: "700",
    color: "#1c294e",
    fontSize: 16,
    marginLeft: 2,
    marginBottom: 5,
  },
  planPeriodDesc: {
    color: "#1c294e",
    fontSize: 16,
  },
  planDivider: {
    width: 257,
    height: 1,
    backgroundColor: "#E6E6E6",
    marginTop: 20,
  },
  planDescription: {
    color: "#121212",
    width: 220,
    lineHeight: "20px",
    whiteSpace: "pre-wrap",
  },
  selectPlanBtn: {
    width: 190,
    height: 38,
    backgroundColor: "#eef2ff",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginBottom: 6,
    border: "none",
    cursor: "pointer",
  },
  selectPlan: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 22,
  },
};

export default ViewPlan;
