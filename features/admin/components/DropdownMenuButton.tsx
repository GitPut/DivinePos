import React from "react";
import { FiChevronRight, FiChevronUp, FiChevronDown } from "react-icons/fi";
import DropdownOption from "./DropdownOption";

interface DropdownMenuButtonProps {
  active: boolean;
  labelImg?: string;
  labelText?: string;
  labelIcon?: React.ReactNode;
  options: {
    label: string;
    link: string | (() => void);
    active: boolean;
  }[];
  labelImgStyle?: React.CSSProperties;
  dropDownOpen: boolean;
  toggleDropdown: () => void;
}

function DropdownMenuButton({
  active,
  labelImg,
  labelText,
  labelIcon,
  options,
  labelImgStyle,
  dropDownOpen,
  toggleDropdown,
}: DropdownMenuButtonProps) {
  const isHighlighted = active || dropDownOpen;

  return (
    <div>
      <button
        style={{
          ...styles.container,
          ...(isHighlighted
            ? {
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }
            : {}),
        }}
        onClick={toggleDropdown}
      >
        <div style={styles.inner}>
          {labelImg ? (
            <img
              src={labelImg}
              alt=""
              style={{ ...styles.btnLblImg, ...labelImgStyle }}
            />
          ) : (
            <>
              {labelIcon && (
                <div
                  style={{
                    ...styles.iconWrap,
                    backgroundColor: isHighlighted ? "#eff6ff" : "transparent",
                    color: isHighlighted ? "#1D294E" : "#64748b",
                  }}
                >
                  {labelIcon}
                </div>
              )}
              <span
                style={{
                  ...styles.labelText,
                  color: isHighlighted ? "#0f172a" : "#475569",
                }}
              >
                {labelText}
              </span>
            </>
          )}
        </div>
        {!active && !dropDownOpen ? (
          <FiChevronRight size={16} color="#94a3b8" />
        ) : dropDownOpen ? (
          <FiChevronUp size={16} color="#64748b" />
        ) : (
          <FiChevronDown size={16} color="#64748b" />
        )}
      </button>
      {dropDownOpen && (
        <div style={styles.dropDownOptionsContainer}>
          {options.map((option, index) => {
            return <DropdownOption key={index} option={option} />;
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    height: 42,
    width: "100%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "0 8px",
    borderRadius: 8,
    boxSizing: "border-box",
  },
  inner: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  btnLblImg: {
    marginRight: 10,
    marginLeft: 2,
    objectFit: "contain",
  },
  dropDownOptionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 8,
    marginLeft: 50,
  },
};

export default DropdownMenuButton;
