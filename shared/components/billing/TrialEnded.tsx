import React, { useState } from "react";
import { IoPricetagsOutline, IoCheckmark } from "react-icons/io5";
import { logout, createCheckoutSession } from "services/firebase/functions";
import { useAlert } from "react-alert";

const STARTER_PRICE_ID = "price_1T8TIlCIw3L7DOwIDUpngIcI";
const PROFESSIONAL_PRICE_ID = "price_1T8TJBCIw3L7DOwIlItWv4xo";

const TrialEnded = () => {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional">("starter");
  const [loading, setloading] = useState(false);
  const alertP = useAlert();

  const Checkout = async () => {
    setloading(true);
    const priceId = selectedPlan === "starter" ? STARTER_PRICE_ID : PROFESSIONAL_PRICE_ID;

    await createCheckoutSession(
      priceId,
      window.location.origin,
      window.location.origin,
      (msg) => alertP.error(`An error occurred: ${msg}`)
    );
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "absolute",
        ...(loading ? { opacity: 0 } : {}),
      }}
    >
      <div style={styles.planItemContainer}>
        <div style={styles.pITopContainer}>
          <div style={styles.group4}>
            <div style={styles.group24}>
              <span style={styles.standard}>Sorry Your Trial Has Ended.</span>
            </div>
            <div style={styles.group23}>
              <IoPricetagsOutline size={32} color="rgba(255,255,255,1)" />
            </div>
          </div>
          <span style={styles.allYearPayment}>Choose A Plan To Continue</span>

          {/* Plan selection */}
          <div style={{ display: "flex", flexDirection: "row", gap: 16, width: "100%", marginBottom: 20 }}>
            <button
              style={{
                ...styles.planCard,
                ...(selectedPlan === "starter" ? styles.planCardActive : {}),
              }}
              onClick={() => setSelectedPlan("starter")}
            >
              <span style={{ fontWeight: "700", fontSize: 18, color: selectedPlan === "starter" ? "#fff" : "#1c294e" }}>Starter</span>
              <span style={{ fontWeight: "700", fontSize: 28, color: selectedPlan === "starter" ? "#fff" : "#1c294e" }}>$49</span>
              <span style={{ fontSize: 14, color: selectedPlan === "starter" ? "rgba(255,255,255,0.7)" : "#666" }}>/month</span>
            </button>
            <button
              style={{
                ...styles.planCard,
                ...(selectedPlan === "professional" ? styles.planCardActive : {}),
              }}
              onClick={() => setSelectedPlan("professional")}
            >
              <span style={{ fontWeight: "700", fontSize: 18, color: selectedPlan === "professional" ? "#fff" : "#1c294e" }}>Professional</span>
              <span style={{ fontWeight: "700", fontSize: 28, color: selectedPlan === "professional" ? "#fff" : "#1c294e" }}>$79</span>
              <span style={{ fontSize: 14, color: selectedPlan === "professional" ? "rgba(255,255,255,0.7)" : "#666" }}>/month</span>
              <span style={{ fontSize: 11, color: selectedPlan === "professional" ? "#a5f3fc" : "#0891b2", marginTop: 4 }}>Online Store Included</span>
            </button>
          </div>

          <div style={styles.group7}>
            <span style={styles.cloudBased}>Cloud-Based</span>
            <IoCheckmark size={30} color="rgba(74,74,74,1)" />
          </div>
          <div style={styles.group7}>
            <span style={styles.cloudBased}>Easy to Use</span>
            <IoCheckmark size={30} color="rgba(74,74,74,1)" />
          </div>
          <div style={styles.group7}>
            <span style={styles.cloudBased}>24/7 Support</span>
            <IoCheckmark size={30} color="rgba(74,74,74,1)" />
          </div>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 40,
            }}
          >
            <button style={styles.group5} onClick={logout}>
              <span style={styles.monthly6}>Cancel</span>
            </button>
            <button style={styles.group5} onClick={Checkout}>
              <span style={styles.monthly6}>Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "rgba(31,35,48,1)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    cursor: "pointer",
  },
  planCardActive: {
    backgroundColor: "#1c294e",
    borderColor: "#1c294e",
  },
  innerContainer: {
    backgroundColor: "white",
    width: "95%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    borderRadius: 6,
    padding: 50,
  },
  leftContainer: {
    width: "70%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
  },
  backAndForwardContainer: {
    width: 830,
    height: 56,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon6: {
    color: "rgba(128,128,128,0.25)",
    fontSize: 50,
  },
  icon22: {
    color: "rgba(128,128,128,1)",
    fontSize: 50,
  },
  storeDetailsTxtContainer: {
    width: 280,
    height: 61,
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  storeDetails: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 35,
    width: 280,
    height: 38,
  },
  rect13: {
    width: 58,
    height: 10,
    backgroundColor: "rgba(218,215,215,1)",
    borderRadius: 30,
  },
  planItemContainer: {
    width: 691,
    height: 500,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 30,
    boxShadow: "3px 3px 50px rgba(0,0,0,0.22)",
    justifyContent: "space-around",
    display: "flex",
  },
  pITopContainer: {
    height: "98%",
    padding: 20,
  },
  group4: {
    width: 617,
    height: 64,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  group24: {
    height: 33,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  standard: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 30,
  },
  plan2: {
    fontWeight: "600",
    color: "rgba(31,35,48,1)",
    fontSize: 25,
  },
  group23: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  icon16: {
    color: "rgba(255,255,255,1)",
    fontSize: 32,
  },
  allYearPayment: {
    fontWeight: "500",
    color: "rgba(155,155,155,1)",
    fontSize: 20,
    marginBottom: 20,
    display: "block",
  },
  group6: {
    width: "70%",
    height: 66,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overview1: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 40,
  },
  monthly5: {
    fontWeight: "600",
    color: "rgba(31,35,48,1)",
    fontSize: 35,
  },
  group5: {
    width: 224,
    height: 45,
    flexDirection: "row",
    display: "flex",
    backgroundColor: "rgba(20,112,239,1)",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "space-around",
    border: "none",
    cursor: "pointer",
  },
  monthly6: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 19,
  },
  icon14: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  group7: {
    width: 210,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cloudBased: {
    fontWeight: "500",
    color: "rgba(0,0,0,1)",
    fontSize: 20,
  },
  checkIcon: {
    color: "rgba(74,74,74,1)",
    fontSize: 30,
  },
  group8: {
    width: 190,
    height: 44,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  easyToUse: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  icon18: {
    color: "rgba(74,74,74,1)",
    fontSize: 50,
    width: 40,
    height: 44,
  },
  group9: {
    width: 365,
    height: 44,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  easyToUse2: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  icon19: {
    color: "rgba(74,74,74,1)",
    fontSize: 50,
    width: 40,
    height: 44,
  },
  group10: {
    width: 206,
    height: 44,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text9: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  icon20: {
    color: "rgba(74,74,74,1)",
    fontSize: 50,
    width: 40,
    height: 44,
  },
  pITBottomContainer: {
    width: "100%",
    height: "6%",
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 5,
  },
  rect33: {
    width: "75%",
    height: "100%",
    backgroundColor: "rgba(208,208,208,0.96)",
    borderBottomRightRadius: 30,
  },
  rect32: {
    width: "25%",
    height: "100%",
    backgroundColor: "rgba(51,81,243,1)",
    opacity: 0.96,
    borderBottomLeftRadius: 30,
  },
  downloadBtnContainer: {
    width: "100%",
  },
  group12: {
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
    display: "flex",
  },
  rect21: {
    width: 150,
    height: 100,
    alignItems: "center",
    display: "flex",
    backgroundColor: "rgba(20,112,239,1)",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    boxShadow: "3px 3px 10px rgba(0,0,0,0.24)",
  },
  icon9: {
    color: "rgba(255,255,255,1)",
    fontSize: 70,
  },
  rect22: {
    width: "100%",
    height: 12,
    position: "absolute",
    backgroundColor: "rgba(208,208,208,1)",
    bottom: 0,
    opacity: 0.74,
  },
  group12Stack: {
    width: "100%",
    alignItems: "center",
    display: "flex",
  },
  rightContainer: {
    width: "30%",
    height: "100%",
    backgroundColor: "rgba(31,35,48,1)",
    boxShadow: "-3px -3px 5px rgba(85,85,85,0.2)",
    justifyContent: "space-around",
    alignItems: "center",
    display: "flex",
  },
  pageStatusContainer: {
    width: 279,
    height: 65,
  },
  greyDivider: {
    width: 71,
    height: 5,
    backgroundColor: "rgba(155,155,155,1)",
  },
  darkGreyDivider: {
    width: 71,
    height: 5,
    backgroundColor: "rgba(155,155,155,1)",
    opacity: 0.15,
  },
  ActiveIconContainer: {
    width: 66,
    height: 66,
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 33,
    boxShadow: "3px 3px 30px rgba(0,0,0,0.54)",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  icon: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  rect41: {
    top: 0,
    left: 107,
    width: 66,
    height: 64,
    position: "absolute",
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 100,
    boxShadow: "3px 3px 50px rgba(0,0,0,0.61)",
  },
  icon25: {
    color: "rgba(255,255,255,1)",
    fontSize: 36,
    width: 40,
    height: 44,
    marginTop: 12,
    marginLeft: 14,
  },
  rect38Stack: {
    top: 0,
    left: 0,
    width: 173,
    height: 64,
    position: "absolute",
  },
  rect39: {
    top: 31,
    left: 0,
    width: 71,
    height: 5,
    position: "absolute",
    backgroundColor: "rgba(155,155,155,1)",
    opacity: 0.15,
  },
  notActiveIconContainer: {
    width: 66,
    height: 66,
    backgroundColor: "rgba(208,213,243,1)",
    borderRadius: 33,
    boxShadow: "3px 3px 50px rgba(0,0,0,0.61)",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  icon26: {
    color: "rgba(255,255,255,1)",
    fontSize: 36,
    width: 40,
    height: 44,
    marginTop: 12,
    marginLeft: 14,
  },
  rect39Stack: {
    top: 1,
    left: 160,
    width: 119,
    height: 64,
    position: "absolute",
  },
  rect38StackStack: {
    width: 279,
    height: 65,
  },
  pageStatusTxtContainer: {
    width: 315,
    height: 252,
  },
  onH1Txt: {
    position: "absolute",
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
    width: 246,
    height: 38,
  },
  stageChecked: {
    width: 26,
    height: 26,
    backgroundColor: "rgba(10,188,27,1)",
    borderRadius: 13,
    boxShadow: "3px 3px 30px rgba(0,0,0,0.54)",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  checkedIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  subscription1Stack: {
    top: 0,
    left: 0,
    width: 252,
    height: 50,
    position: "absolute",
  },
  planInfo1: {
    top: 38,
    left: 0,
    position: "absolute",
    fontWeight: "500",
    color: "rgba(155,155,155,1)",
    fontSize: 23,
  },
  subscription1StackStack: {
    width: 252,
    height: 50,
    marginLeft: 42,
  },
  onNumTxt: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 30,
    width: 22,
    height: 38,
    marginLeft: -294,
    marginTop: 14,
  },
  subscription1StackStackRow: {
    height: 52,
    flexDirection: "row",
    display: "flex",
    marginRight: 21,
  },
  storeSetup1: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 30,
    width: 246,
    height: 38,
  },
  storeInfo1: {
    fontWeight: "600",
    color: "rgba(155,155,155,1)",
    fontSize: 25,
  },
  storeSetup1Column: {
    width: 246,
    marginLeft: 39,
    marginBottom: 2,
  },
  text10: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 30,
    width: 22,
    height: 38,
    marginLeft: -285,
    marginTop: 2,
  },
  storeSetup1ColumnRow: {
    height: 40,
    flexDirection: "row",
    display: "flex",
    marginTop: 48,
    marginLeft: 1,
    marginRight: 29,
  },
  rect36: {
    width: 55,
    height: 2,
    backgroundColor: "rgba(155,155,155,1)",
    transform: "rotate(90deg)",
    marginTop: -67,
    marginLeft: -18,
  },
  rect37: {
    width: 55,
    height: 2,
    backgroundColor: "rgba(155,155,155,1)",
    transform: "rotate(90deg)",
    marginTop: 85,
    marginLeft: -18,
  },
  connectShop1: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
    width: 246,
    height: 38,
    opacity: 0.44,
  },
  link1: {
    fontWeight: "500",
    color: "rgba(155,155,155,1)",
    fontSize: 22,
    opacity: 0.44,
  },
  connectShop1Column: {
    width: 246,
    marginLeft: 39,
    marginBottom: 3,
  },
  offNumTxt: {
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    fontSize: 30,
    width: 22,
    height: 38,
    marginLeft: -285,
    marginTop: 3,
  },
  connectShop1ColumnRow: {
    height: 41,
    flexDirection: "row",
    display: "flex",
    marginTop: 24,
    marginLeft: 1,
    marginRight: 29,
  },
  priceAndBtnContainer: {
    width: 336,
    height: 131,
  },
  group18: {
    width: 336,
    height: 38,
    flexDirection: "row",
    display: "flex",
  },
  planPrice1: {
    fontWeight: "600",
    color: "rgba(74,74,74,1)",
    fontSize: 23,
  },
  wooCommerce1: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
    opacity: 0.44,
    marginLeft: 16,
  },
  planPrice1Row: {
    height: 38,
    width: "100%",
    flexDirection: "row",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  group17: {
    width: 288,
    height: 60,
    marginTop: 33,
    marginLeft: 24,
  },
  rect34: {
    width: 288,
    height: 60,
    backgroundColor: "rgba(155,155,155,0.68)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  checkOut1: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 26,
    opacity: 0.26,
  },
  textInput: {
    marginTop: 15,
  },
  helperDownloadContainer: {
    width: "100%",
    height: 79,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 5,
    marginBottom: 15,
  },
  helperTxt: {
    fontWeight: "500",
    color: "#121212",
    fontSize: 16,
    marginTop: 25,
  },
  badgeWindows: {
    width: 150,
    height: 79,
    marginRight: 15,
  },
  badgeMac: {
    width: 150,
    height: 79,
  },
};

export default TrialEnded;
