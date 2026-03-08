import React from "react";
import { FiHome, FiClock, FiPhone, FiPercent, FiDollarSign, FiSettings, FiClipboard, FiGrid } from "react-icons/fi";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import { settingsAuthState, storeDetailsState } from "store/appState";
import { useHistory } from "react-router-dom";

const menuItems = [
  { key: "home", label: "Home", Icon: FiHome },
  { key: "tables", label: "Tables", Icon: FiGrid },
  { key: "orders", label: "Orders", Icon: FiClipboard },
  { key: "clockin", label: "Clock In", Icon: FiClock },
  { key: "delivery", label: "Delivery", Icon: FiPhone },
  { key: "discount", label: "Discount", Icon: FiPercent },
  { key: "cash", label: "Cash", Icon: FiDollarSign },
];

const LeftMenuBar = () => {
  const {
    ongoingOrderListModal,
    clockinModal,
    deliveryModal,
    discountModal,
    settingsPasswordModalVis,
    customCashModal,
    pendingCount,
    tableViewActive,
  } = posState.use(
    (s) => ({
      ongoingOrderListModal: s.ongoingOrderListModal,
      clockinModal: s.clockinModal,
      deliveryModal: s.deliveryModal,
      discountModal: s.discountModal,
      settingsPasswordModalVis: s.settingsPasswordModalVis,
      customCashModal: s.customCashModal,
      pendingCount: s.ongoingListState?.length || 0,
      tableViewActive: s.tableViewActive,
    }),
    shallowEqual
  );
  const history = useHistory();
  const storeDetails = storeDetailsState.use();

  const isHome =
    !ongoingOrderListModal &&
    !clockinModal &&
    !deliveryModal &&
    !settingsPasswordModalVis &&
    !discountModal &&
    !customCashModal &&
    !tableViewActive;

  const activeKey = isHome
    ? "home"
    : tableViewActive
    ? "tables"
    : ongoingOrderListModal
    ? "orders"
    : clockinModal
    ? "clockin"
    : deliveryModal
    ? "delivery"
    : discountModal
    ? "discount"
    : customCashModal
    ? "cash"
    : "home";

  const handleClick = (key: string) => {
    // Reset all modals first
    updatePosState({
      ongoingOrderListModal: false,
      clockinModal: false,
      deliveryModal: false,
      discountModal: false,
      customCashModal: false,
      tableViewActive: false,
    });
    switch (key) {
      case "tables":
        updatePosState({ tableViewActive: true });
        break;
      case "orders":
        updatePosState({ ongoingOrderListModal: true });
        break;
      case "clockin":
        updatePosState({ clockinModal: true });
        break;
      case "delivery":
        updatePosState({ deliveryModal: true });
        break;
      case "discount":
        updatePosState({ discountModal: true });
        break;
      case "cash":
        updatePosState({ customCashModal: true });
        break;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topSection}>
        <div style={styles.logoCircle}>
          <span style={styles.logoText}>
            {storeDetails?.name ? storeDetails.name.charAt(0).toUpperCase() : "D"}
          </span>
        </div>
        {menuItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              className="pos-sidebar-btn"
              style={styles.menuBtn}
              onClick={() => handleClick(item.key)}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    ...styles.iconCircle,
                    ...(isActive
                      ? { backgroundColor: "#1e293b", color: "#fff" }
                      : { backgroundColor: "transparent", color: "#64748b" }),
                  }}
                >
                  <item.Icon size={18} color={isActive ? "#fff" : "#64748b"} />
                </div>
                {item.key === "orders" && pendingCount > 0 && (
                  <div style={styles.badge}>
                    <span style={styles.badgeText}>
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  </div>
                )}
              </div>
              <span
                style={{
                  ...styles.menuLabel,
                  ...(isActive ? { color: "#1e293b", fontWeight: "600" } : {}),
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={styles.bottomSection}>
        <button
          className="pos-sidebar-btn"
          style={styles.menuBtn}
          onClick={() => {
            if (storeDetails.settingsPassword?.length > 0) {
              updatePosState({ settingsPasswordModalVis: true });
            } else {
              settingsAuthState.set(true);
              history.push("/authed/dashboard");
              localStorage.setItem("isAuthedBackend", "true");
            }
          }}
        >
          <div
            style={{
              ...styles.iconCircle,
              ...(settingsPasswordModalVis
                ? { backgroundColor: "#1e293b", color: "#fff" }
                : { backgroundColor: "transparent", color: "#64748b" }),
            }}
          >
            <FiSettings size={18} color={settingsPasswordModalVis ? "#fff" : "#64748b"} />
          </div>
          <span
            style={{
              ...styles.menuLabel,
              ...(settingsPasswordModalVis ? { color: "#1e293b", fontWeight: "600" } : {}),
            }}
          >
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};

export default LeftMenuBar;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 80,
    flexShrink: 0,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
    borderRight: "1px solid #e8eaed",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
    paddingTop: 16,
    paddingBottom: 16,
  },
  topSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  bottomSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  menuBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "6px 4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "500",
    lineHeight: "1.2",
  },
  badge: {
    position: "absolute" as const,
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    boxSizing: "border-box" as const,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: "1",
  },
};
