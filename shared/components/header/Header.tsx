import React from "react";
import { useHistory } from "react-router-dom";
import LogoutDropdown from "./LogoutDropdown";
import Logo from "assets/dpos-logo-black.png";
import { FiMonitor, FiGrid } from "react-icons/fi";

interface HeaderProps {
  onPressLogo?: () => void;
  isPosHeader?: boolean;
}

const Header = ({ onPressLogo, isPosHeader }: HeaderProps) => {
  const history = useHistory();

  return (
    <div style={styles.header}>
      <button
        onClick={onPressLogo}
        style={styles.logoBtn}
      >
        <img src={Logo} alt="" style={styles.logo} />
      </button>
      <div style={styles.rightSide}>
        {isPosHeader && (
          <>
            <button
              onClick={() =>
                window.open("/customer-display", "customerDisplay")
              }
              style={styles.customerDisplayBtn}
            >
              <FiMonitor size={14} color="#475569" />
              <span style={styles.customerDisplayTxt}>Customer Display</span>
            </button>
            <button
              onClick={() => history.push("/pos")}
              style={styles.posBtn}
            >
              <FiGrid size={14} color="#fff" />
              <span style={styles.posTxt}>POS</span>
            </button>
          </>
        )}
        <LogoutDropdown isPosHeader={isPosHeader ? isPosHeader : false} />
      </div>
    </div>
  );
};

export default Header;

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 75,
    backgroundColor: "#fff",
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
    zIndex: 100,
    flexShrink: 0,
    paddingLeft: 8,
    paddingRight: 24,
  },
  logoBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: 55,
    width: 180,
    marginLeft: 12,
    objectFit: "contain",
  },
  rightSide: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  customerDisplayBtn: {
    height: 36,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    gap: 6,
    cursor: "pointer",
    paddingLeft: 14,
    paddingRight: 14,
  },
  customerDisplayTxt: {
    fontWeight: "500",
    color: "#475569",
    fontSize: 13,
  },
  posBtn: {
    height: 36,
    backgroundColor: "#1D294E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    gap: 6,
    border: "none",
    cursor: "pointer",
    paddingLeft: 18,
    paddingRight: 18,
  },
  posTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 13,
  },
};
