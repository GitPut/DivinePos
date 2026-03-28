import React from "react";
import PeriodDropdown from "../PeriodDropdown";
import clockIcon from "assets/images/image_BUWK..png";

const OrderWaitTimeBox = ({
  details,
  period,
  setperiod,
}: {
  details: {
    shortest: number;
    longest: number;
    average: number;
    mean: number;
  };
  period: string;
  setperiod: (period: string) => void;
}) => {
  return (
    <div style={styles.orderWaitTimeContainer}>
      <div style={styles.orderWaitTimeInnerContainer}>
        <div style={styles.orderWaitTimeHeaderRow}>
          <span style={styles.orderWaitTimeLbl}>Order Wait Time (Minutes)</span>
          <PeriodDropdown value={period} setValue={setperiod} />
        </div>
        <div style={styles.statsContainer}>
          <div style={styles.shortestContainer}>
            <img
              src={clockIcon}
              alt=""
              style={styles.clockIcon}
            />
            <div style={styles.shortestRightSide}>
              <span style={styles.shorestTimeValue}>
                {!isNaN(details.shortest) ? details.shortest.toFixed(0) : 0}
              </span>
              <span style={styles.shortest}>Shortest</span>
            </div>
          </div>
          <div style={styles.longestContainer}>
            <img
              src={clockIcon}
              alt=""
              style={styles.clockIcon1}
            />
            <div style={styles.longestRightSide}>
              <span style={styles.longestTimeValue}>
                {!isNaN(details.longest) ? details.longest.toFixed(0) : 0}
              </span>
              <span style={styles.longest}>Longest</span>
            </div>
          </div>
          <div style={styles.averageContainer}>
            <img
              src={clockIcon}
              alt=""
              style={styles.clockIcon2}
            />
            <div style={styles.averageRightSide}>
              <span style={styles.averageTimeValue}>
                {!isNaN(details.average) ? details.average.toFixed(0) : 0}
              </span>
              <span style={styles.average}>Average</span>
            </div>
          </div>
          <div style={styles.meanContainer}>
            <img
              src={clockIcon}
              alt=""
              style={styles.clockIcon3}
            />
            <div style={styles.meanRightSide}>
              <span style={styles.meanTimeValue}>
                {!isNaN(details.mean) ? details.mean.toFixed(0) : 0}
              </span>
              <span style={styles.mean}>Mean</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderWaitTimeBox;

const styles: Record<string, React.CSSProperties> = {
  orderWaitTimeContainer: {
    width: 383,
    height: 210,
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    borderRadius: 10,
    border: "1px solid #ededed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginBottom: 10,
  },
  orderWaitTimeInnerContainer: {
    width: 347,
    height: 191,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  orderWaitTimeHeaderRow: {
    width: 347,
    height: 27,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  orderWaitTimeLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  statsContainer: {
    width: 347,
    height: 121,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shortestContainer: {
    width: 164,
    height: 45,
    backgroundColor: "#e8ffe6",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clockIcon: {
    height: 30,
    width: 30,
    marginLeft: 8,
    objectFit: "contain",
  },
  shortestRightSide: {
    width: 72,
    height: 41,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  shorestTimeValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  shortest: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
  },
  longestContainer: {
    width: 164,
    height: 45,
    backgroundColor: "#ffe6e5",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clockIcon1: {
    height: 30,
    width: 30,
    marginLeft: 8,
    objectFit: "contain",
  },
  longestRightSide: {
    width: 72,
    height: 41,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  longestTimeValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  longest: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
  },
  averageContainer: {
    width: 164,
    height: 45,
    backgroundColor: "#e6f7ff",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clockIcon2: {
    height: 30,
    width: 30,
    marginLeft: 8,
    objectFit: "contain",
  },
  averageRightSide: {
    width: 72,
    height: 41,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  averageTimeValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  average: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
  },
  meanContainer: {
    width: 164,
    height: 45,
    backgroundColor: "#f9e6ff",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clockIcon3: {
    height: 30,
    width: 30,
    marginLeft: 8,
    objectFit: "contain",
  },
  meanRightSide: {
    width: 72,
    height: 41,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  meanTimeValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
  },
  mean: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
  },
};
