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
              <FiCheck size={16} color="#fff" />
            ) : (
              <span style={styles.stepNumber}>1</span>
            )}
          </div>
          <span
            style={{
              ...styles.stepLabel,
              ...(stageNum >= 1 ? { color: "#0f172a" } : {}),
            }}
          >
            Plan
          </span>
        </div>
        <div
          style={{
            ...styles.stepLine,
            backgroundColor: stageNum > 1 ? "#1470ef" : "#e2e8f0",
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
              ...(stageNum >= 2 ? { color: "#0f172a" } : {}),
            }}
          >
            Details
          </span>
        </div>
      </div>

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
                flex: 1,
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
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
    padding: "0 20px",
  },
  stepsRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#1470ef",
  },
  stepCircleCompleted: {
    backgroundColor: "#10b981",
  },
  stepNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
  },
  stepLine: {
    width: 60,
    height: 2,
    borderRadius: 1,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 520,
  },
  buttonRow: {
    flexDirection: "row",
    display: "flex",
    gap: 12,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#1470ef",
    borderRadius: 10,
    height: 48,
    width: "100%",
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
    fontSize: 15,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 48,
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  backButtonText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
};
