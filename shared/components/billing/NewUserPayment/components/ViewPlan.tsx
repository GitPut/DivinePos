import React, { useEffect, useState } from "react";

interface PlanProps {
  planType: string | null;
  setstageNum: (stageNum: number) => void;
}

const ViewPlan = ({ planType, setstageNum }: PlanProps) => {
  const [planName, setplanName] = useState<string | null>(null);
  const [planPrice, setplanPrice] = useState<string | null>(null);
  const [planPeriodDesc, setplanPeriodDesc] = useState<string | null>(null);
  const [recurence, setrecurence] = useState<string | null>(null);

  useEffect(() => {
    if (planType === "freeTrial") {
      setplanName("Free Trial");
      setplanPrice("0");
      setplanPeriodDesc("For 1 month");
      setrecurence(null);
    } else if (planType === "starter") {
      setplanName("Starter");
      setplanPrice("29");
      setplanPeriodDesc("Auto-renews unless cancelled");
      setrecurence("/ month");
    } else if (planType === "professional") {
      setplanName("Professional");
      setplanPrice("69");
      setplanPeriodDesc("Auto-renews unless cancelled");
      setrecurence("/ month");
    }
  }, [planType]);

  return (
    <div style={styles.container}>
      <span style={styles.selectedLabel}>Selected Plan</span>
      <div style={styles.priceRow}>
        <span style={styles.dollarSign}>$</span>
        <span style={styles.planPrice}>{planPrice}</span>
        {recurence && <span style={styles.recurence}>{recurence}</span>}
      </div>
      <span style={styles.planName}>{planName}</span>
      <span style={styles.planPeriodDesc}>{planPeriodDesc}</span>
      <button style={styles.changeBtn} onClick={() => setstageNum(1)}>
        <span style={styles.changeBtnText}>Change Plan</span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 16,
    border: "2px solid #1470ef",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 20px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1470ef",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "flex-start",
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
  planName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 16,
    marginTop: 4,
  },
  planPeriodDesc: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  changeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    marginTop: 12,
    padding: 0,
  },
  changeBtnText: {
    color: "#1470ef",
    fontSize: 14,
    fontWeight: "500",
  },
};

export default ViewPlan;
