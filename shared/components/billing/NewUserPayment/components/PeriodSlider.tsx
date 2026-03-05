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
          backgroundColor: "#1c294e",
          borderRadius: 30,
          width: 166,
          height: 50,
          position: "absolute",
          left: sliderLeft,
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
    borderRadius: 30,
    border: "1px solid #d9d9d9",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    height: 48,
    width: 310,
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
    fontWeight: "700",
    color: "#121212",
    fontSize: 19,
  },
  btn: {
    width: 155,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};

export default PeriodSlider;
