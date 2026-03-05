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
            size={40}
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
                    width: 40,
                    height: 40,
                  }
                : { width: 40, height: 40 }
            }
            key={"pendingOrderIcon"}
            alt=""
          />
        </button>
        <button
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
                    width: 40,
                    height: 40,
                  }
                : { width: 40, height: 40 }
            }
            key={"clockInIcon"}
            alt=""
          />
        </button>
        <button
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
                    width: 40,
                    height: 40,
                  }
                : { width: 40, height: 40 }
            }
            key={"phoneOrderIcon"}
            alt=""
          />
        </button>
        <button
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
                    width: 30,
                    height: 30,
                  }
                : { width: 30, height: 30 }
            }
            key={"percentIcon"}
            alt=""
          />
        </button>
        <button
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
                    width: 40,
                    height: 40,
                  }
                : { width: 40, height: 40 }
            }
            key={"dollarSignIcon"}
            alt=""
          />
        </button>
      </div>
      <div style={{ marginBottom: 15 }}>
        <button
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
                    width: 40,
                    height: 40,
                  }
                : { width: 40, height: 40 }
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
    width: "5%",
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.5)",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
  },
  activeBtn: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(29,41,78,1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    border: "none",
    cursor: "pointer",
    display: "flex",
  },
  notActiveBtn: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
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
