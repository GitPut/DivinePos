import React, { useEffect, useMemo, useState } from "react";
import TotalRevenueBox from "./components/stats/TotalRevenueBox";
import MostOrderedItemsBox from "./components/stats/MostOrderedItemsBox";
import PickupOrdersBox from "./components/stats/PickupOrdersBox";
import DeliveryOrdersBox from "./components/stats/DeliveryOrdersBox";
import InStoreOrdersBox from "./components/stats/InStoreOrdersBox";
import CustomersBox from "./components/stats/CustomersBox";
import OrderWaitTimeBox from "./components/stats/OrderWaitTimeBox";
import { customersState, storeProductsState } from "store/appState";
import { auth, db } from "services/firebase/config";
import ComponentLoader from "shared/components/ui/ComponentLoader";
import { UserStoreStateProps } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

// ------------------ Types ------------------
interface ProductCount {
  [key: string]: number;
}

interface DayStats {
  revenue: number;
  orders: number;
  inStore: number;
  delivery: number;
  pickup: number;
  productCounts: ProductCount;
  totalWaitTime: number;
  waitCount: number;
  averageWaitTime?: number;
  inStoreRevenue: number;
  deliveryRevenue: number;
  pickupRevenue: number;
}

interface DetailsProps {
  averageWaitTime: {
    shortest: number;
    longest: number;
    average: number;
    mean: number;
  };
  inStoreOrders: {
    orders: number;
    revenue: number;
  };
  deliveryOrders: {
    orders: number;
    revenue: number;
  };
  pickupOrders: {
    orders: number;
    revenue: number;
  };
  totalRevenue: {
    orders: number;
    revenue: number;
  };
  mostOrderProducts: {
    name: string;
    orders: number;
    imageUrl: string;
  }[];
  newCustomers: number;
  days: {
    [key: string]: DayStats;
  };
}

// ------------------ Default State ------------------
const defaultDetails: DetailsProps = {
  averageWaitTime: { shortest: 0, longest: 0, average: 0, mean: 0 },
  inStoreOrders: { orders: 0, revenue: 0 },
  deliveryOrders: { orders: 0, revenue: 0 },
  pickupOrders: { orders: 0, revenue: 0 },
  totalRevenue: { orders: 0, revenue: 0 },
  mostOrderProducts: [],
  newCustomers: 0,
  days: {},
};

// ------------------ Utils ------------------
const getDateRange = (
  period: string
): { start: string; end: string } | null => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear(), 11, 31);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  switch (period) {
    case "Today":
      return { start: fmt(today), end: fmt(today) };
    case "This Week":
      return { start: fmt(weekStart), end: fmt(weekEnd) };
    case "This Month":
      return { start: fmt(monthStart), end: fmt(monthEnd) };
    case "This Year":
      return { start: fmt(yearStart), end: fmt(yearEnd) };
    case "All Time":
      return { start: "1970-01-01", end: fmt(today) };
    default:
      return null;
  }
};

const filterDays = (
  days: { [key: string]: DayStats },
  start: string,
  end: string
) => {
  return Object.keys(days)
    .filter((date) => date >= start && date <= end)
    .reduce((obj, key) => {
      obj[key] = days[key];
      return obj;
    }, {} as { [key: string]: DayStats });
};

const calculateDetails = (
  days: { [key: string]: DayStats },
  catalog: UserStoreStateProps,
  customersLength: number
): DetailsProps => {
  let shortest = Infinity;
  let longest = 0;
  let totalWaitTime = 0;
  let waitCount = 0;
  let totalOrders = 0;
  let totalRevenue = 0;

  const inStoreOrders = { orders: 0, revenue: 0 };
  const deliveryOrders = { orders: 0, revenue: 0 };
  const pickupOrders = { orders: 0, revenue: 0 };
  const mostOrderedItems: ProductCount = {};

  Object.values(days).forEach((dayStats) => {
    totalOrders += dayStats.orders;
    totalRevenue += dayStats.revenue;

    inStoreOrders.orders += dayStats.inStore;
    inStoreOrders.revenue += dayStats.inStoreRevenue;
    deliveryOrders.orders += dayStats.delivery;
    deliveryOrders.revenue += dayStats.deliveryRevenue;
    pickupOrders.orders += dayStats.pickup;
    pickupOrders.revenue += dayStats.pickupRevenue;

    totalWaitTime += dayStats.totalWaitTime;
    waitCount += dayStats.waitCount;

    Object.entries(dayStats.productCounts).forEach(([itemName, count]) => {
      mostOrderedItems[itemName] = (mostOrderedItems[itemName] || 0) + count;
    });

    const avgWait = dayStats.averageWaitTime ?? 0;
    if (avgWait > 0) {
      shortest = Math.min(shortest, avgWait);
      longest = Math.max(longest, avgWait);
    }
  });

  const sortedItems = Object.entries(mostOrderedItems).sort(
    (a, b) => b[1] - a[1]
  );
  const mostOrderProducts = sortedItems.slice(0, 3).map(([name, orders]) => ({
    name,
    orders,
    imageUrl:
      catalog.products.find((p) => p.name === name)?.imageUrl ??
      "https://via.placeholder.com/50",
  }));

  return {
    averageWaitTime: {
      shortest: shortest === Infinity ? 0 : shortest,
      longest,
      average: totalWaitTime / (waitCount || 1),
      mean: totalWaitTime / (totalOrders || 1),
    },
    inStoreOrders,
    deliveryOrders,
    pickupOrders,
    totalRevenue: { orders: totalOrders, revenue: totalRevenue },
    mostOrderProducts,
    newCustomers: customersLength,
    days,
  };
};

// ------------------ Main Component ------------------
const Dashboard: React.FC = () => {
  const { width } = useWindowSize();
  const catalog = storeProductsState.use();
  const customers = customersState.use();
  const [period, setPeriod] = useState<string>("Today");
  const [allStats, setAllStats] = useState<DetailsProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        const statsRef = db
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("monthly");

        const statsDoc = await statsRef.get();
        if (statsDoc.exists) {
          setAllStats(statsDoc.data() as DetailsProps);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const details = useMemo(() => {
    if (!allStats) return defaultDetails;
    const { start, end } = getDateRange(period) ?? {};
    if (!start || !end) return defaultDetails;
    const filteredDays = filterDays(allStats.days, start, end);
    return calculateDetails(filteredDays, catalog, customers.length);
  }, [period, allStats, catalog, customers.length]);

  // ------------------ Render ------------------
  return (
    <div style={styles.container}>
      <div style={{ width: "100%", overflow: "auto" }}>
        <div style={{ paddingRight: 30 }}>
          {loading ? (
            <ComponentLoader />
          ) : (
            <div style={styles.wrap}>
              <TotalRevenueBox
                style={width < 1300 ? { width: "100%" } : {}}
                period={period}
                setperiod={setPeriod}
                details={details}
              />
              {width > 1300 && (
                <MostOrderedItemsBox
                  period={period}
                  setperiod={setPeriod}
                  details={details.mostOrderProducts}
                />
              )}

              <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                <OrderWaitTimeBox
                  period={period}
                  setperiod={setPeriod}
                  details={details.averageWaitTime}
                />
                {width > 1300 && (
                  <CustomersBox
                    customers={customers}
                    period={period}
                    setperiod={setPeriod}
                  />
                )}
                {width < 1300 && (
                  <MostOrderedItemsBox
                    style={{ height: 300 }}
                    period={period}
                    setperiod={setPeriod}
                    details={details.mostOrderProducts}
                  />
                )}
              </div>

              <div
                style={{
                  ...styles.ordersWrap,
                  ...(width < 1300 ? { flexDirection: "column" } : {}),
                }}
              >
                <PickupOrdersBox
                  period={period}
                  setperiod={setPeriod}
                  details={details.pickupOrders}
                />
                <DeliveryOrdersBox
                  period={period}
                  setperiod={setPeriod}
                  details={details.deliveryOrders}
                />
                <InStoreOrdersBox
                  period={period}
                  setperiod={setPeriod}
                  details={details.inStoreOrders}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------ Styles ------------------
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
  },
  wrap: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  ordersWrap: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
};

export default Dashboard;
