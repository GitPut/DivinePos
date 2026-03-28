import React from "react";
import { IoPerson } from "react-icons/io5";
import { MdStore } from "react-icons/md";
import { FiCheck } from "react-icons/fi";

interface StageIconBarProps {
  stageNum: number;
}

const StageIconBar = ({ stageNum }: StageIconBarProps) => {
  return (
    <div style={styles.container}>
      <div
        style={
          stageNum > 1
            ? styles.completedIconContainer
            : stageNum >= 1
            ? styles.activeIconContainer
            : styles.inactiveIconContainer
        }
      >
        {stageNum > 1 ? (
          <FiCheck size={20} color="#fff" />
        ) : (
          <IoPerson size={20} color="#fff" />
        )}
      </div>
      <div
        style={{
          ...styles.divider,
          backgroundColor: stageNum > 1 ? "#1D294E" : "#e2e8f0",
        }}
      />
      <div
        style={
          stageNum >= 2
            ? styles.activeIconContainer
            : styles.inactiveIconContainer
        }
      >
        <MdStore size={20} color="#fff" />
      </div>
    </div>
  );
};

export default StageIconBar;

const styles: Record<string, React.CSSProperties> = {
  container: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 0,
  },
  activeIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#1D294E",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  completedIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#10b981",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  inactiveIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#cbd5e1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  divider: {
    width: 60,
    height: 2,
    borderRadius: 1,
  },
};
