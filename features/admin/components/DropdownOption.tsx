import React from "react";
import { FiChevronRight } from "react-icons/fi";
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
      style={styles.container}
      onClick={() => {
        if (typeof option.link === "string" && option.link.length > 0) {
          history.push(option.link);
        } else if (typeof option.link === "function") {
          option.link();
        }
      }}
    >
      <FiChevronRight style={styles.chevronRight1} />
      <span style={{ ...styles.label, ...(option.active ? { color: "#121212" } : {}) }}>
        {option.label}
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 179,
    marginBottom: 10,
    alignItems: "center",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },
  chevronRight1: {
    color: "rgba(128,128,128,1)",
    fontSize: 20,
  },
  label: {
    fontWeight: "700",
    color: "rgba(105,114,142,1)",
    fontSize: 15,
    width: 146,
    textAlign: "left",
    display: "inline-block",
  },
};

export default DropdownOption;
