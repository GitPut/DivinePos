import React from "react";
import StageStepView from "./StageStepView";
import StageIconBar from "./StageIconBar";

interface SideBarProps {
  stageNum: number;
  planType: string | null;
  CheckOutFunc: () => void;
  setstageNum: (num: number) => void;
  detailsFilledOut: boolean;
}

const SideBar = ({
  stageNum,
  planType,
  CheckOutFunc,
  setstageNum,
  detailsFilledOut,
}: SideBarProps) => {
  return (
    <div style={styles.rightContainer}>
      <div style={styles.inner}>
        <StageIconBar stageNum={stageNum} />
        <div style={styles.pageStatusTxtContainer}>
          <StageStepView
            step={1}
            stageLbl="Subscription"
            stageDesc="Plan Info"
            stageNum={stageNum}
          />
          <div
            style={{
              height: 55,
              width: 2,
              backgroundColor: "rgba(155,155,155,1)",
              marginLeft: 10,
              marginBottom: 10,
            }}
          />
          <StageStepView
            step={2}
            stageLbl="Store Setup"
            stageDesc="Store Info"
            stageNum={stageNum}
          />
        </div>
        <div style={styles.priceAndBtnContainer}>
          <div style={styles.group17}>
            {stageNum === 1 ? (
              <button
                style={{
                  ...styles.rect34,
                  ...(planType !== null
                    ? { backgroundColor: "rgba(20,112,239,1)" }
                    : {}),
                }}
                disabled={!planType}
                onClick={() => setstageNum(2)}
              >
                <span
                  style={{
                    ...styles.checkOut1,
                    ...(planType !== null
                      ? { opacity: 1, color: "white" }
                      : {}),
                  }}
                >
                  Next
                </span>
              </button>
            ) : (
              <button
                style={{
                  ...styles.rect34,
                  ...(detailsFilledOut
                    ? { backgroundColor: "rgba(20,112,239,1)" }
                    : {}),
                }}
                disabled={!detailsFilledOut}
                onClick={CheckOutFunc}
              >
                <span
                  style={{
                    ...styles.checkOut1,
                    ...(detailsFilledOut
                      ? { opacity: 1, color: "white" }
                      : {}),
                  }}
                >
                  Check Out
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;

const styles: Record<string, React.CSSProperties> = {
  rightContainer: {
    width: "28%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  inner: {
    width: "96%",
    height: "96%",
    backgroundColor: "#1D294E",
    boxShadow: "-3px -3px 5px rgba(85,85,85,0.2)",
    justifyContent: "space-around",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    borderRadius: 10,
  },
  pageStatusContainer: {
    width: 279,
    height: 65,
  },
  pageStatusTxtContainer: {
    width: 315,
    height: 252,
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
    border: "none",
    cursor: "pointer",
  },
  checkOut1: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 26,
    opacity: 0.26,
  },
};
