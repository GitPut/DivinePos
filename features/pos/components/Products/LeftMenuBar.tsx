import React from "react";
import { FiMenu } from "react-icons/fi";
import pendingOrderIcon from "assets/images/pendingOrderIcon.png";
import clockInIcon from "assets/images/clockInIcon.png";
import phoneOrderIcon from "assets/images/phoneOrderIcon.png";
import percentIcon from "assets/images/percentIcon.png";
import dollarSignIcon from "assets/images/dollarSignIcon.png";
import settingsIcon from "assets/images/settingsIcon.png";
import { posState, updatePosState } from "store/posState";
import { settingsAuthState, storeDetailsState } from "store/appState";
import { useHistory } from "react-router-dom";

const LeftMenuBar = () => {
  const {
    ongoingOrderListModal,
    clockinModal,
    deliveryModal,
    discountModal,
    settingsPasswordModalVis,
    customCashModal,
  } = posState.use();
  const history = useHistory();
  const storeDetails = storeDetailsState.use();

  return (
    <div style={styles.leftMenuBarContainer}>
      <div>
        <button
          className={`pos-sidebar-btn${!ongoingOrderListModal && !clockinModal && !deliveryModal && !settingsPasswordModalVis ? " pos-sidebar-btn-active" : ""}`}
          style={
            !ongoingOrderListModal &&
            !clockinModal &&
            !deliveryModal &&
            !settingsPasswordModalVis
              ? styles.activeBtn
              : styles.notActiveBtn
          }
        >
          <FiMenu
            size={24}
            color={
              !ongoingOrderListModal &&
              !clockinModal &&
              !deliveryModal &&
              !settingsPasswordModalVis
                ? "white"
                : "black"
            }
          />
        </button>
        <button
          className={`pos-sidebar-btn${ongoingOrderListModal ? " pos-sidebar-btn-active" : ""}`}
          style={
            ongoingOrderListModal ? styles.activeBtn : styles.notActiveBtn
          }
          onClick={() => {
            updatePosState({ ongoingOrderListModal: true });
          }}
        >
          <img
            src={pendingOrderIcon}
            style={
              ongoingOrderListModal
                ? {
                    filter: "invert(100%)",
                    width: 24,
                    height: 24,
                  }
                : { width: 24, height: 24 }
            }
            key={"pendingOrderIcon"}
            alt=""
          />
        </button>
        <button
          className={`pos-sidebar-btn${clockinModal ? " pos-sidebar-btn-active" : ""}`}
          style={clockinModal ? styles.activeBtn : styles.notActiveBtn}
          onClick={() => {
            updatePosState({ clockinModal: true });
          }}
        >
          <img
            src={clockInIcon}
            style={
              clockinModal
                ? {
                    filter: "invert(100%)",
                    width: 24,
                    height: 24,
                  }
                : { width: 24, height: 24 }
            }
            key={"clockInIcon"}
            alt=""
          />
        </button>
        <button
          className={`pos-sidebar-btn${deliveryModal ? " pos-sidebar-btn-active" : ""}`}
          style={deliveryModal ? styles.activeBtn : styles.notActiveBtn}
          onClick={() => {
            updatePosState({ deliveryModal: true });
          }}
        >
          <img
            src={phoneOrderIcon}
            style={
              deliveryModal
                ? {
                    filter: "invert(100%)",
                    width: 24,
                    height: 24,
                  }
                : { width: 24, height: 24 }
            }
            key={"phoneOrderIcon"}
            alt=""
          />
        </button>
        <button
          className={`pos-sidebar-btn${discountModal ? " pos-sidebar-btn-active" : ""}`}
          style={discountModal ? styles.activeBtn : styles.notActiveBtn}
          onClick={() => {
            updatePosState({ discountModal: true });
          }}
        >
          <img
            src={percentIcon}
            style={
              discountModal
                ? {
                    filter: "invert(100%)",
                    width: 22,
                    height: 22,
                  }
                : { width: 22, height: 22 }
            }
            key={"percentIcon"}
            alt=""
          />
        </button>
        <button
          className={`pos-sidebar-btn${customCashModal ? " pos-sidebar-btn-active" : ""}`}
          style={customCashModal ? styles.activeBtn : styles.notActiveBtn}
          onClick={() => {
            updatePosState({ customCashModal: true });
          }}
        >
          <img
            src={dollarSignIcon}
            style={
              customCashModal
                ? {
                    filter: "invert(100%)",
                    width: 24,
                    height: 24,
                  }
                : { width: 24, height: 24 }
            }
            key={"dollarSignIcon"}
            alt=""
          />
        </button>
      </div>
      <div style={{ marginBottom: 15 }}>
        <button
          className={`pos-sidebar-btn${settingsPasswordModalVis ? " pos-sidebar-btn-active" : ""}`}
          style={
            settingsPasswordModalVis ? styles.activeBtn : styles.notActiveBtn
          }
          onClick={() => {
            if (storeDetails.settingsPassword?.length > 0) {
              updatePosState({ settingsPasswordModalVis: true });
            } else {
              settingsAuthState.set(true);
              history.push("/authed/dashboard");
              localStorage.setItem("isAuthedBackend", 'true');
            }
          }}
        >
          <img
            src={settingsIcon}
            style={
              settingsPasswordModalVis
                ? {
                    filter: "invert(100%)",
                    width: 24,
                    height: 24,
                  }
                : { width: 24, height: 24 }
            }
            key={"settingsIcon"}
            alt=""
          />
        </button>
      </div>
    </div>
  );
};

export default LeftMenuBar;

const styles: Record<string, React.CSSProperties> = {
  leftMenuBarContainer: {
    width: 64,
    flexShrink: 0,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
    borderRight: "1px solid #e8eaed",
    boxShadow: "1px 0 4px rgba(0,0,0,0.04)",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
  },
  activeBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  notActiveBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  menuIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 40,
  },
  icon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
    marginTop: 30,
    marginBottom: 30,
  },
};
