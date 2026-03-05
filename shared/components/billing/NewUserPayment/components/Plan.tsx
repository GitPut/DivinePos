import React from "react";

interface PlanProps {
  planName: string;
  planPrice: string;
  planPeriodDesc: string;
  planDescription: string;
  recurence?: string;
  selectPlan: () => void;
  isPlanSelected: boolean;
}

const Plan = ({
  planName,
  planPrice,
  planPeriodDesc,
  planDescription,
  recurence,
  selectPlan,
  isPlanSelected,
}: PlanProps) => {
  return (
    <div
      style={{
        ...styles.container,
        ...(planName === "STANDARD"
          ? {
              height: 430,
              borderTopWidth: 10,
              borderTop: "10px solid #1D294E",
            }
          : {}),
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
        style={{
          ...styles.selectPlanBtn,
          ...(isPlanSelected ? { backgroundColor: "#1c294e" } : {}),
        }}
        onClick={selectPlan}
      >
        <span style={{ ...styles.selectPlan, ...(isPlanSelected ? { color: "white" } : {}) }}>
          Select Plan
        </span>
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
    height: 410,
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

export default Plan;
