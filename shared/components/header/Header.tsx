import React from "react";
import { useHistory } from "react-router-dom";
import LogoutDropdown from "./LogoutDropdown";
import Logo from "assets/dpos-logo-black.png";

interface HeaderProps {
  onPressLogo?: () => void;
  isPosHeader?: boolean;
}

const Header = ({ onPressLogo, isPosHeader }: HeaderProps) => {
  const history = useHistory();

  return (
    <div style={styles.header}>
      <button onClick={onPressLogo} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
        <img src={Logo} alt="" style={styles.logo} key={'logo'} />
      </button>
      <div style={styles.rightSideRow}>
        {isPosHeader && (
          <button
            onClick={() => history.push("/pos")}
            style={styles.backToPOSBtn}
          >
            <span style={styles.pos}>POS</span>
          </button>
        )}
        <LogoutDropdown isPosHeader={isPosHeader ? isPosHeader : false} />
      </div>
    </div>
  );
};

export default Header;

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  header: {
    height: 75,
    backgroundColor: "rgba(255,255,255,1)",
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 100,
  },
  bottom: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "rgba(238,242,255,1)",
  },
  logo: {
    height: 70,
    width: 222,
    marginRight: 20,
    marginLeft: 20,
    objectFit: "contain",
  },
  rightSideRow: {
    height: 39,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 50,
  },
  backToPOSBtn: {
    width: 140,
    height: 32,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginRight: 30,
    border: "none",
    cursor: "pointer",
  },
  pos: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  userBtn: {
    height: 39,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWithNameGroup: {
    height: 39,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userIcon: {
    height: 39,
    width: 40,
    marginRight: 10,
  },
  username: {
    color: "#435869",
    fontSize: 15,
    marginRight: 10,
  },
  chevronDownIcon: {
    color: "rgba(128,128,128,1)",
    fontSize: 30,
  },
  leftMenu: {
    width: 278,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  menuOptionsContainer: {
    width: 201,
    alignItems: "center",
    justifyContent: "flex-start",
    display: "flex",
    marginTop: 0,
    marginLeft: 15,
  },
  rightSide: {
    width: "78%",
    height: "100%",
    justifyContent: "flex-end",
    display: "flex",
  },
  page: {
    width: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "3px 3px 15px rgba(0,0,0,0.2)",
    height: "100%",
  },
  logoutFromAccount: {
    fontWeight: "700",
    color: "#121212",
  },
  logoutIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 26,
  },
};
