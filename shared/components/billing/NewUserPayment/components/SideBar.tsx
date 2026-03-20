import React from "react";
import { FiCheck } from "react-icons/fi";

interface SideBarProps {
  stageNum: number;
  planType: string | null;
  CheckOutFunc: () => void;
  setstageNum: (num: number) => void;
  detailsFilledOut: boolean;
}

const SideBar = ({
  stageNum,
  planType,
  CheckOutFunc,
  setstageNum,
  detailsFilledOut,
}: SideBarProps) => {
  return (
    <div style={styles.container}>
      {/* Steps row */}
      <div style={styles.stepsRow}>
        <div style={styles.stepItem}>
          <div
            style={{
              ...styles.stepCircle,
              ...(stageNum >= 1 ? styles.stepCircleActive : {}),
              ...(stageNum > 1 ? styles.stepCircleCompleted : {}),
            }}
          >
            {stageNum > 1 ? (
              <FiCheck size={14} color="#fff" />
            ) : (
              <span style={styles.stepNumber}>1</span>
            )}
          </div>
          <span
            style={{
              ...styles.stepLabel,
              ...(stageNum >= 1 ? { color: "#0f172a", fontWeight: "600" } : {}),
            }}
          >
            Choose Plan
          </span>
        </div>
        <div
          style={{
            ...styles.stepLine,
            backgroundColor: stageNum > 1 ? "#1D294E" : "#e2e8f0",
          }}
        />
        <div style={styles.stepItem}>
          <div
            style={{
              ...styles.stepCircle,
              ...(stageNum >= 2 ? styles.stepCircleActive : {}),
            }}
          >
            <span style={styles.stepNumber}>2</span>
          </div>
          <span
            style={{
              ...styles.stepLabel,
              ...(stageNum >= 2 ? { color: "#0f172a", fontWeight: "600" } : {}),
            }}
          >
            Store Details
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.buttonContainer}>
        {stageNum === 1 ? (
          <button
            style={{
              ...styles.primaryButton,
              ...(planType === null ? styles.primaryButtonDisabled : {}),
            }}
            disabled={!planType}
            onClick={() => setstageNum(2)}
          >
            <span style={styles.buttonText}>Continue</span>
          </button>
        ) : (
          <div style={styles.buttonRow}>
            <button style={styles.backButton} onClick={() => setstageNum(1)}>
              <span style={styles.backButtonText}>Back</span>
            </button>
            <button
              style={{
                ...styles.primaryButton,
                ...(!detailsFilledOut ? styles.primaryButtonDisabled : {}),
              }}
              disabled={!detailsFilledOut}
              onClick={CheckOutFunc}
            >
              <span style={styles.buttonText}>Complete Setup</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: 960,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  stepItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#1D294E",
  },
  stepCircleCompleted: {
    backgroundColor: "#10b981",
  },
  stepNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
  },
  stepLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
  buttonContainer: {
    display: "flex",
  },
  buttonRow: {
    flexDirection: "row",
    display: "flex",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#1D294E",
    borderRadius: 8,
    height: 38,
    paddingLeft: 24,
    paddingRight: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 38,
    paddingLeft: 20,
    paddingRight: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  backButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
};
