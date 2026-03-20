import React from "react";
import { FiCheck, FiArrowRight, FiArrowLeft, FiLogOut } from "react-icons/fi";
import { logout } from "services/firebase/functions";

interface SideBarProps {
  stageNum: number;
  planType: string | null;
  CheckOutFunc: () => void;
  setstageNum: (num: number) => void;
  detailsFilledOut: boolean;
  children?: React.ReactNode;
}

const STEPS = ["Plan", "Details"];

const SideBar = ({
  stageNum,
  planType,
  CheckOutFunc,
  setstageNum,
  detailsFilledOut,
  children,
}: SideBarProps) => {
  return (
    <>
      {/* Step circles */}
      <div style={styles.stepsRow}>
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stageNum === stepNum;
          const isCompleted = stageNum > stepNum;
          return (
            <React.Fragment key={label}>
              {i > 0 && (
                <div
                  style={{
                    ...styles.stepLine,
                    backgroundColor: isCompleted || isActive ? "#1D294E" : "#d1d5db",
                  }}
                />
              )}
              <div style={styles.stepItem}>
                <div
                  style={{
                    ...styles.stepCircle,
                    ...(isActive ? styles.stepCircleActive : {}),
                    ...(isCompleted ? styles.stepCircleCompleted : {}),
                    ...(!isActive && !isCompleted ? styles.stepCircleInactive : {}),
                  }}
                >
                  {isCompleted ? (
                    <FiCheck size={14} color="#fff" />
                  ) : (
                    <span
                      style={{
                        ...styles.stepNumber,
                        color: isActive ? "#1D294E" : "#94a3b8",
                      }}
                    >
                      {stepNum}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <span style={styles.stepLabel}>
        STEP {stageNum} OF {STEPS.length} — {STEPS[stageNum - 1]?.toUpperCase()}
      </span>

      {/* Stage content */}
      {children}

      {/* Action buttons */}
      <div style={{ ...styles.buttonContainer, maxWidth: stageNum === 1 ? 900 : 520 }}>
        <div style={styles.buttonLeft}>
          {stageNum === 1 ? (
            <button style={styles.logoutButton} onClick={logout}>
              <FiLogOut size={14} color="#94a3b8" />
              <span style={styles.logoutText}>Log out</span>
            </button>
          ) : (
            <button style={styles.backButton} onClick={() => setstageNum(1)}>
              <FiArrowLeft size={16} color="#64748b" />
              <span style={styles.backButtonText}>Back</span>
            </button>
          )}
        </div>
        {stageNum === 1 ? (
          <button
            style={{
              ...styles.continueBtn,
              ...(planType === null ? { opacity: 0.4, cursor: "not-allowed" } : {}),
            }}
            disabled={!planType}
            onClick={() => setstageNum(2)}
          >
            <span style={styles.continueTxt}>Continue</span>
            <FiArrowRight size={16} color="#fff" />
          </button>
        ) : (
          <button
            style={{
              ...styles.continueBtn,
              ...(!detailsFilledOut ? { opacity: 0.4, cursor: "not-allowed" } : {}),
            }}
            disabled={!detailsFilledOut}
            onClick={CheckOutFunc}
          >
            <span style={styles.continueTxt}>Complete Setup</span>
            <FiArrowRight size={16} color="#fff" />
          </button>
        )}
      </div>
    </>
  );
};

export default SideBar;

const styles: Record<string, React.CSSProperties> = {
  stepsRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    marginBottom: 8,
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#fff",
    border: "2px solid #1D294E",
  },
  stepCircleCompleted: {
    backgroundColor: "#10b981",
    border: "none",
  },
  stepCircleInactive: {
    backgroundColor: "#e2e8f0",
    border: "none",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepLine: {
    width: 48,
    height: 2,
    borderRadius: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  buttonLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    height: 40,
    paddingLeft: 14,
    paddingRight: 14,
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  backButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    height: 40,
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
    padding: 0,
  },
  logoutText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },
  continueBtn: {
    height: 46,
    paddingLeft: 28,
    paddingRight: 24,
    backgroundColor: "#1D294E",
    borderRadius: 12,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  continueTxt: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
};
