import React, { useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { logout } from "services/firebase/functions";
import { storeDetailsState } from "store/appState";
import { auth } from "services/firebase/config";

interface LogoutDropdownProps {
  isPosHeader: boolean;
}

function LogoutDropdown({ isPosHeader }: LogoutDropdownProps) {
  const [open, setOpen] = useState(false);
  const storeDetails = storeDetailsState.use();
  const name =
    (isPosHeader ? storeDetails.name : auth.currentUser?.displayName) ?? "User";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ position: "relative", zIndex: open ? 100000 : undefined }}>
      <button
        style={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div style={styles.avatar}>
          <span style={styles.avatarText}>{initials}</span>
        </div>
        <span style={styles.name}>{name}</span>
        <FiChevronDown
          size={16}
          color="#94a3b8"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <>
          <div
            style={styles.backdrop}
            onClick={() => setOpen(false)}
          />
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.dropdownAvatar}>
                <FiUser size={14} color="#64748b" />
              </div>
              <div>
                <span style={styles.dropdownName}>{name}</span>
                <span style={styles.dropdownEmail}>
                  {auth.currentUser?.email ?? ""}
                </span>
              </div>
            </div>
            <div style={styles.divider} />
            <button style={styles.logoutBtn} onClick={logout}>
              <FiLogOut size={16} color="#ef4444" />
              <span style={styles.logoutTxt}>Log Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LogoutDropdown;

const styles: Record<string, React.CSSProperties> = {
  trigger: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    padding: "6px 12px 6px 6px",
    height: 42,
    boxSizing: "border-box",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#1D294E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "500",
    maxWidth: 140,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 99998,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    width: 220,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    zIndex: 99999,
    overflow: "hidden",
    padding: 4,
  },
  dropdownHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
  },
  dropdownAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dropdownName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdownEmail: {
    fontSize: 11,
    color: "#94a3b8",
    display: "block",
    marginTop: 1,
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    margin: "2px 8px",
  },
  logoutBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 12px",
    background: "none",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  logoutTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ef4444",
  },
};
