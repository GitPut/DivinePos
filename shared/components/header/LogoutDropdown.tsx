import React, { useState } from "react";
import { FiChevronUp, FiChevronDown, FiLogOut } from "react-icons/fi";
import { logout } from "services/firebase/functions";
import { storeDetailsState } from "store/appState";
import { auth } from "services/firebase/config";
import userIcon from "assets/image_bTyU..png";

interface LogoutDropdownProps {
  isPosHeader: boolean;
}

function LogoutDropdown({ isPosHeader }: LogoutDropdownProps) {
  const [openDropdown, setopenDropdown] = useState(false);
  const storeDetails = storeDetailsState.use();
  const name =
    (isPosHeader ? storeDetails.name : auth.currentUser?.displayName) ?? "User";
  const widthOfContainer = name?.length > 10 ? name.length * 10 + 50 : 150;

  return (
    <div style={{ zIndex: 10000, position: "relative" }}>
      <button
        style={styles.userBtn}
        onClick={() => setopenDropdown((prev) => !prev)}
      >
        <div style={styles.iconWithNameGroup}>
          <img
            src={userIcon}
            alt=""
            style={styles.userIcon}
          />
          <span style={styles.username}>{name}</span>
        </div>
        {openDropdown ? (
          <FiChevronUp size={30} color="rgba(128,128,128,1)" />
        ) : (
          <FiChevronDown size={30} color="rgba(128,128,128,1)" />
        )}
      </button>
      {openDropdown && (
        <button
          style={{
            backgroundColor: "rgba(255,255,255,1)",
            borderRadius: 10,
            boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: widthOfContainer,
            height: 43,
            position: "absolute",
            bottom: -50,
            left: 0,
            padding: 10,
            zIndex: 100000,
            border: "none",
            cursor: "pointer",
          }}
          onClick={logout}
        >
          <span style={styles.logoutFromAccount}>Logout</span>
          <FiLogOut size={26} color="rgba(0,0,0,1)" />
        </button>
      )}
    </div>
  );
}

export default LogoutDropdown;

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
    minWidth: 150,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
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
    objectFit: "contain",
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
