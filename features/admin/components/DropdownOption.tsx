import React from "react";
import { useHistory } from "react-router-dom";

interface DropdownOptionProps {
  option: {
    label: string;
    link: string | (() => void);
    active: boolean;
  };
}

function DropdownOption({ option }: DropdownOptionProps) {
  const history = useHistory();

  return (
    <button
      style={{
        ...styles.container,
        ...(option.active
          ? { color: "#1470ef", fontWeight: "600" }
          : {}),
      }}
      onClick={() => {
        if (typeof option.link === "string" && option.link.length > 0) {
          history.push(option.link);
        } else if (typeof option.link === "function") {
          option.link();
        }
      }}
    >
      <div
        style={{
          ...styles.dot,
          backgroundColor: option.active ? "#1470ef" : "#cbd5e1",
        }}
      />
      <span
        style={{
          ...styles.label,
          color: option.active ? "#0f172a" : "#64748b",
          fontWeight: option.active ? "600" : "500",
        }}
      >
        {option.label}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "6px 0",
    textAlign: "left",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    flexShrink: 0,
  },
  label: {
    fontSize: 13,
  },
};

export default DropdownOption;
