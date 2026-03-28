import React from "react";
import { FiCheck } from "react-icons/fi";

interface StageStepViewProps {
  step: number;
  stageLbl: string;
  stageDesc: string;
  stageNum: number;
}

const StageStepView = ({ step, stageLbl, stageDesc, stageNum }: StageStepViewProps) => {
  const isCompleted = step < stageNum;
  const isActive = step <= stageNum;

  return (
    <div style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isCompleted ? "#10b981" : isActive ? "#1D294E" : "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isCompleted ? (
          <FiCheck size={14} color="#fff" />
        ) : (
          <span style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{step}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontWeight: "600",
            color: isActive ? "#0f172a" : "#94a3b8",
            fontSize: 14,
          }}
        >
          {stageLbl}
        </span>
        <span
          style={{
            fontWeight: "400",
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          {stageDesc}
        </span>
      </div>
    </div>
  );
};

export default StageStepView;
