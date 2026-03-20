import React from "react";

interface MenuButtonProps {
  active: boolean;
  labelIcon?: React.ReactNode;
  labelText?: string;
  labelImg?: string;
  labelImgStyle?: React.CSSProperties;
  onPress: () => void;
}

function MenuButton({
  active,
  labelIcon,
  labelText,
  labelImg,
  labelImgStyle,
  onPress,
}: MenuButtonProps) {
  return (
    <button
      style={{
        ...styles.container,
        ...(active
          ? {
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }
          : {}),
      }}
      onClick={onPress}
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
                  backgroundColor: active ? "#eff6ff" : "transparent",
                  color: active ? "#1D294E" : "#64748b",
                }}
              >
                {labelIcon}
              </div>
            )}
            <span
              style={{
                ...styles.labelText,
                color: active ? "#0f172a" : "#475569",
              }}
            >
              {labelText}
            </span>
          </>
        )}
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "row",
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
};

export default MenuButton;
