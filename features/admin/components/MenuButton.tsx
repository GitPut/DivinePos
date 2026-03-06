import React from "react";

interface MenuButtonProps {
  active: boolean;
  labelImg?: string;
  labelText?: string;
  labelImgStyle?: React.CSSProperties;
  onPress: () => void;
}

function MenuButton({ active, labelImg, labelText, labelImgStyle, onPress }: MenuButtonProps) {
  return (
    <button
      style={{
        ...styles.container,
        ...(active ? {
          boxShadow: "3px 3px 0px rgba(0,0,0,0.2)",
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,1)",
        } : {}),
      }}
      onClick={onPress}
    >
      {labelImg ? (
        <img
          src={labelImg}
          alt=""
          style={{ ...styles.btnLblImg, ...labelImgStyle }}
        />
      ) : (
        <span style={styles.btnLblText}>{labelText}</span>
      )}
    </button>
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
  btnLblText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#121212",
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
    height: 75,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    marginLeft: 20,
  },
  activeDropDownOption: {
    height: 34,
    width: 179,
  },
  nonActiveDropDownOption: {
    height: 34,
    width: 179,
  },
};

export default MenuButton;
