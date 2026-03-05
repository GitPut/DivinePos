import React from "react";
import { FiChevronRight, FiChevronUp, FiChevronDown } from "react-icons/fi";
import DropdownOption from "./DropdownOption";

interface DropdownMenuButtonProps {
  active: boolean;
  labelImg: string;
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
  options,
  labelImgStyle,
  dropDownOpen,
  toggleDropdown,
}: DropdownMenuButtonProps) {
  return (
    <div>
      <button
        style={{
          ...styles.container,
          ...((active || dropDownOpen) ? {
            boxShadow: "3px 3px 0px rgba(0,0,0,0.2)",
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,1)",
          } : {}),
        }}
        onClick={toggleDropdown}
      >
        <img
          src={labelImg}
          alt=""
          style={{ ...styles.btnLblImg, ...labelImgStyle }}
        />
        {!active && !dropDownOpen ? (
          <FiChevronRight style={styles.dropDownBtnChevronDown} />
        ) : dropDownOpen ? (
          <FiChevronUp style={styles.dropDownBtnChevronDown} />
        ) : (
          <FiChevronDown style={styles.dropDownBtnChevronDown} />
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
    marginBottom: 20,
    height: 42,
    width: 201,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },
  btnLblImg: {
    marginRight: 10,
    marginLeft: 10,
    objectFit: "contain",
  },
  dropDownBtnChevronDown: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
    marginRight: 10,
    marginLeft: 10,
  },
  dropDownMenuBtn: {
    height: 42,
    width: 201,
  },
  dropDownOptionsContainer: {
    width: 179,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 20,
    marginLeft: 20,
  },
};

export default DropdownMenuButton;
