import React, { useEffect, useState } from "react";
import PeriodDropdown from "../PeriodDropdown";
import { CustomerProp } from "types";
import { searchCustomersByDate as SearchDateCustomers } from "utils/searchFilters";
import customerIcon from "assets/images/image_cdRe..png";

const CustomersBox = ({
  customers,
  period,
  setperiod,
}: {
  customers: CustomerProp[];
  period: string;
  setperiod: (period: string) => void;
}) => {
  const [details, setdetails] = useState({
    newCustomers: 0,
  });

  useEffect(() => {
    const calculateTotals = (allCustomers: CustomerProp[]) => {
      let totalNewCustomers = 0;
      allCustomers.forEach(() => {
        totalNewCustomers += 1;
      });
      return {
        newCustomers: totalNewCustomers,
      };
    };

    const getDateRange = (period: string) => {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(today.setDate(weekStart.getDate() + 6));
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);

      switch (period) {
        case "Today":
          return {
            start: new Date().toDateString(),
            end: new Date().toDateString(),
          };
        case "This Week":
          return {
            start: weekStart.toDateString(),
            end: weekEnd.toDateString(),
          };
        case "This Month":
          return {
            start: monthStart.toDateString(),
            end: monthEnd.toDateString(),
          };
        case "This Year":
          return {
            start: yearStart.toDateString(),
            end: yearEnd.toDateString(),
          };
        default:
          return null;
      }
    };

    const dateRange = getDateRange(period);
    let filteredCustomers;

    if (dateRange) {
      const { start, end } = dateRange;
      filteredCustomers = SearchDateCustomers({
        startDate: start,
        endDate: end,
        customers: customers,
      });
    } else {
      filteredCustomers = customers;
    }
    if (!filteredCustomers) return setdetails({ newCustomers: 0 });

    const { newCustomers } = calculateTotals(filteredCustomers);
    setdetails({ newCustomers });
  }, [period, customers]);

  return (
    <div style={styles.customersContainer}>
      <div style={styles.customersInnerContainer}>
        <div style={styles.customersHeaderRow}>
          <span style={styles.customers}>Customers</span>
          <PeriodDropdown value={period} setValue={setperiod} />
        </div>
        <div style={styles.newCustomersTrendItem}>
          <div style={styles.newCustomerInnerContainer}>
            <div style={styles.newCustomersLeft}>
              <img
                src={customerIcon}
                alt=""
                style={styles.customerIcon}
              />
              <div style={styles.newCustomersRightSideInner}>
                <span style={styles.newCustomersValue}>
                  {details.newCustomers}
                </span>
                <span style={styles.newCustomersTxt}>New Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersBox;

const styles: Record<string, React.CSSProperties> = {
  customersContainer: {
    width: 383,
    height: 130,
    boxShadow: "3px 3px 3px rgba(0,0,0,0.1)",
    borderRadius: 10,
    border: "1px solid #ededed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  customersInnerContainer: {
    width: 347,
    height: 100,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  customersHeaderRow: {
    width: 347,
    height: 27,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  customers: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 15,
  },
  newCustomersTrendItem: {
    width: 347,
    height: 54,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  newCustomerInnerContainer: {
    width: 310,
    height: 38,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newCustomersLeft: {
    width: 166,
    height: 38,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerIcon: {
    height: 32,
    width: 41,
    objectFit: "contain",
  },
  newCustomersRightSideInner: {
    height: 38,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 20,
  },
  newCustomersValue: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 19,
  },
  newCustomersTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 13,
  },
};
