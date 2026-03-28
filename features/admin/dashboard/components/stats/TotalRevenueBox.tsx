import React, { useEffect, useState } from "react";
import PeriodDropdown from "../PeriodDropdown";
import BarGraph from "./BarGraph";

const TotalRevenueBox = ({
  style,
  period,
  setperiod,
  details,
}: {
  style?: React.CSSProperties;
  period: string;
  setperiod: (period: string) => void;
  details: any;
}) => {
  const [data, setData] = useState<
    { name: string; uv: number; pv: number; amt: number }[]
  >([]);

  useEffect(() => {
    const localData = [
      { name: "J\n", uv: 0, pv: 0, amt: 0 },
      { name: "F\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "M\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "A\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "M\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "J\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "J\n\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "A\n\n\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "S\n\n\n\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "O\n\n\n\n\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "N\n\n\n\n\n\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
      { name: "D\n\n\n\n\n\n\n\n\n\n\n\n", uv: 0, pv: 0, amt: 0 },
    ];

    if (details && details.days) {
      Object.keys(details.days).forEach((date) => {
        const month = parseInt(date.split("-")[1], 10) - 1;
        if (localData[month]) {
          localData[month].uv += details.days[date].revenue || 0;
          localData[month].pv += details.days[date].orders || 0;
          localData[month].amt += details.days[date].orders || 0;
        }
      });
    }

    setData(localData);
  }, [details]);

  const totalRevenue = details?.totalRevenue?.revenue || 0;
  const totalOrders = details?.totalRevenue?.orders || 0;

  return (
    <div style={{ ...styles.totalRevenueContainer, ...style }}>
      <div style={styles.totalRevenueInnerContainer}>
        <span style={styles.totalRevenue}>Total Revenue</span>
        <div style={styles.totalRevenueLeftSide}>
          <div style={styles.amountContainer}>
            <div style={styles.amountRow}>
              <span style={styles.totalRevenue1}>
                ${totalRevenue.toFixed(2)}
              </span>
              <div>
                <PeriodDropdown value={period} setValue={setperiod} />
              </div>
            </div>
            <div style={styles.percentVsLastWeekRow}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 3,
                  display: "inline-block",
                }}
              >
                Total Orders For {period}: {totalOrders}
              </span>
            </div>
          </div>
          <div style={styles.chartContainer}>
            <div style={styles.innerChartContainer}>
              <span style={styles.salesFromDateHeaderTxt}>
                Sales from this year
              </span>
              <div style={styles.barChart}>
                <BarGraph data={data} />
              </div>
              <div style={styles.chartDescription}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalRevenueBox;

const styles: Record<string, React.CSSProperties> = {
  totalRevenueContainer: {
    width: 383,
    height: 350,
    borderRadius: 10,
    border: "1px solid #e8e8e8",
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  totalRevenueInnerContainer: {
    width: "90%",
    height: 325,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  totalRevenue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  totalRevenueLeftSide: {
    width: 416,
    height: 292,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  amountContainer: {
    width: 208,
    height: 55,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  amountRow: {
    width: 340,
    height: 27,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalRevenue1: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    marginRight: 20,
  },
  dropdownPeriod: {
    height: 27,
    width: 84,
  },
  percentVsLastWeekRow: {
    width: 208,
    height: 25,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  chartContainer: {
    width: 416,
    height: 219,
  },
  innerChartContainer: {
    width: 381,
    height: 219,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  salesFromDateHeaderTxt: {
    color: "#929292",
    fontSize: 15,
  },
  barChart: {
    width: 340,
    height: 145,
  },
  chartDescription: {
    width: 190,
    height: 15,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
};
