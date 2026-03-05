import React from "react";
import { FiCheck } from "react-icons/fi";

interface StageStepViewProps {
  step: number;
  stageLbl: string;
  stageDesc: string;
  stageNum: number;
}

const StageStepView = ({ step, stageLbl, stageDesc, stageNum }: StageStepViewProps) => {
  return (
    <div style={{ flexDirection: "row", display: "flex" }}>
      <span
        style={{
          fontWeight: "600",
          color: "rgba(255,255,255,1)",
          fontSize: 30,
          opacity: step <= stageNum ? 1 : 0.5,
        }}
      >
        {step}
      </span>
      <div style={styles.subscription1StackStack}>
        <div style={{ flexDirection: "row", display: "flex" }}>
          <span
            style={{
              fontWeight: "600",
              color: "rgba(255,255,255,1)",
              fontSize: 25,
              marginRight: 25,
              opacity: step <= stageNum ? 1 : 0.5,
            }}
          >
            {stageLbl}
          </span>
          {step < stageNum && (
            <div style={styles.stageChecked}>
              <FiCheck size={18} color="rgba(255,255,255,1)" />
            </div>
          )}
        </div>
        <span
          style={{
            fontWeight: "500",
            color: "rgba(155,155,155,1)",
            fontSize: 22,
            opacity: step <= stageNum ? 1 : 0.5,
          }}
        >
          {stageDesc}
        </span>
      </div>
    </div>
  );
};

export default StageStepView;

const styles: Record<string, React.CSSProperties> = {
  subscription1StackStack: {
    width: 252,
    height: 50,
    marginLeft: 42,
  },
  stageChecked: {
    width: 26,
    height: 26,
    backgroundColor: "rgba(10,188,27,1)",
    borderRadius: 13,
    boxShadow: "3px 3px 30px rgba(0,0,0,0.54)",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  checkedIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
};
