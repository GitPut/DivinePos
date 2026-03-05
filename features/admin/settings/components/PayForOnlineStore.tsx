import React from "react";
import { MdStore, MdCheck } from "react-icons/md";
import gradientBg from "assets/gradient.png";

interface PayForOnlineStoreProps {
  payOnlineStore: () => void;
}

function PayForOnlineStore({ payOnlineStore }: PayForOnlineStoreProps) {
  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${gradientBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      key={"payForOnlineStore"}
    >
      <div style={styles.innerContainer}>
        <div style={styles.innerTopContainer}>
          <div style={styles.mainTopContainer}>
            <div style={styles.topContainer}>
              <div style={styles.topRow}>
                <MdStore size={30} color="rgba(0,0,0,1)" />
                <span style={styles.onlineStoreTxt}>Online Store</span>
              </div>
              <div style={styles.bottomGroup}>
                <span style={styles.informationTxt}>
                  Take your business to the next level with an online store
                </span>
                <div style={styles.pricePerMonthRow}>
                  <span style={styles.priceTxt}>$40</span>
                  <span style={styles.perMonth}>Per Month</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.benefitsContainer}>
            <div style={styles.benefit1}>
              <MdCheck size={40} color="rgba(255,248,248,1)" style={{ marginRight: 10 }} />
              <span style={styles.informationTxt1}>
                Manage straight from pos
              </span>
            </div>
            <div style={styles.benefit2}>
              <MdCheck size={40} color="rgba(255,248,248,1)" style={{ marginRight: 10 }} />
              <span style={styles.informationTxt2}>24/7 Support</span>
            </div>
            <div style={styles.benefit3}>
              <MdCheck size={40} color="rgba(255,248,248,1)" style={{ marginRight: 10 }} />
              <span style={styles.informationTxt3}>Simple and powerful</span>
            </div>
          </div>
        </div>
        <button style={styles.getStartedBox} onClick={payOnlineStore}>
          <span style={styles.getStartedTxt}>Get Started</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: 388,
    height: 446,
  },
  innerContainer: {
    display: "flex",
    flexDirection: "column",
    width: 336,
    height: 397,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  innerTopContainer: {
    display: "flex",
    flexDirection: "column",
    width: 336,
    height: 312,
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainTopContainer: {
    width: 336,
    height: 158,
  },
  topContainer: {
    display: "flex",
    flexDirection: "column",
    width: 246,
    height: 158,
    justifyContent: "space-between",
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    width: 150,
    height: 34,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  onlineStoreTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  bottomGroup: {
    display: "flex",
    flexDirection: "column",
    width: 246,
    height: 98,
    justifyContent: "space-between",
  },
  informationTxt: {
    fontWeight: "300",
    color: "#121212",
    fontSize: 15,
    width: 239,
    height: 40,
    display: "inline-block",
  },
  pricePerMonthRow: {
    display: "flex",
    flexDirection: "row",
    width: 150,
    height: 47,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 40,
    height: 47,
    display: "inline-block",
  },
  perMonth: {
    fontWeight: "300",
    color: "#08090a",
    marginBottom: 5,
    display: "inline-block",
  },
  divider: {
    width: 300,
    height: 1,
    backgroundColor: "#bbc6f9",
  },
  benefitsContainer: {
    display: "flex",
    flexDirection: "column",
    width: 336,
    height: 109,
    justifyContent: "space-between",
  },
  benefit1: {
    display: "flex",
    flexDirection: "row",
    width: 336,
    height: 30,
    alignItems: "center",
  },
  informationTxt1: {
    color: "#fff8f8",
    fontSize: 15,
  },
  benefit2: {
    display: "flex",
    flexDirection: "row",
    width: 336,
    height: 30,
    alignItems: "center",
  },
  informationTxt2: {
    color: "#fff8f8",
    fontSize: 15,
  },
  benefit3: {
    display: "flex",
    flexDirection: "row",
    width: 336,
    height: 30,
    alignItems: "center",
  },
  informationTxt3: {
    color: "#fff8f8",
    fontSize: 15,
  },
  getStartedBox: {
    width: 172,
    height: 48,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
  },
  getStartedTxt: {
    fontWeight: "700",
    color: "#ffffff",
  },
};

export default PayForOnlineStore;
