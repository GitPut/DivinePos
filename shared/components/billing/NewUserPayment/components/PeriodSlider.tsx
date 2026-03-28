import React, { useState } from "react";

interface PeriodSliderProps {
  setpaymentTerm: (paymentTerm: string) => void;
  paymentTerm: string;
}

function PeriodSlider({ setpaymentTerm, paymentTerm }: PeriodSliderProps) {
  const [sliderLeft, setSliderLeft] = useState(
    paymentTerm === "monthly" ? 0 : 155
  );

  const handlePress = (term: string) => {
    setSliderLeft(term === "monthly" ? 0 : 155);
    setpaymentTerm(term);
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          backgroundColor: "#1D294E",
          borderRadius: 10,
          width: 155,
          height: 40,
          position: "absolute",
          left: sliderLeft + 4,
          zIndex: 1,
          transition: "left 0.3s ease",
        }}
      />
      <div style={styles.periodLblRow}>
        <button style={styles.btn} onClick={() => handlePress("monthly")}>
          <span
            style={{
              ...styles.term,
              ...(paymentTerm === "monthly" ? { color: "white" } : {}),
            }}
          >
            Monthly
          </span>
        </button>
        <button style={styles.btn} onClick={() => handlePress("yearly")}>
          <span
            style={{
              ...styles.term,
              ...(paymentTerm === "yearly" ? { color: "white" } : {}),
            }}
          >
            Annually
          </span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    height: 48,
    width: 318,
    position: "relative",
  },
  periodLblRow: {
    height: 22,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    zIndex: 10000,
  },
  term: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 14,
  },
  btn: {
    width: 155,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};

export default PeriodSlider;
