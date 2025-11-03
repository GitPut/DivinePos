import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import TotalRevenueBox from "./components/InfoBoxs/TotalRevenueBox";
import MostOrderedItemsBox from "./components/InfoBoxs/MostOrderedItemsBox";
import PickupOrdersBox from "./components/InfoBoxs/PickupOrdersBox";
import DeliveryOrdersBox from "./components/InfoBoxs/DeliveryOrdersBox";
import InStoreOrdersBox from "./components/InfoBoxs/InStoreOrdersBox";
import CustomersBox from "./components/InfoBoxs/CustomersBox";
import OrderWaitTimeBox from "./components/InfoBoxs/OrderWaitTimeBox";
import { customersList, userStoreState } from "state/state";
import { auth, db } from "state/firebaseConfig";
import ComponentLoader from "components/ComponentLoader";
import { UserStoreStateProps } from "types/global";

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
  const { width } = useWindowDimensions();
  const catalog = userStoreState.use();
  const customers = customersList.use();
  const [period, setPeriod] = useState<string>("Today");
  const [allStats, setAllStats] = useState<DetailsProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch once
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

  // Compute filtered details
  const details = useMemo(() => {
    if (!allStats) return defaultDetails;
    const { start, end } = getDateRange(period) ?? {};
    if (!start || !end) return defaultDetails;
    const filteredDays = filterDays(allStats.days, start, end);
    return calculateDetails(filteredDays, catalog, customers.length);
  }, [period, allStats, catalog, customers.length]);

  // ------------------ Render ------------------
  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingRight: 30 }}
      >
        {loading ? (
          <ComponentLoader />
        ) : (
          <View style={styles.wrap}>
            {/* Top Revenue and Most Ordered */}
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

            {/* Wait Time + Customers */}
            <View style={{ justifyContent: "space-between" }}>
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
            </View>

            {/* Orders by Type */}
            <View
              style={[
                styles.ordersWrap,
                width < 1300 && { flexDirection: "column" },
              ]}
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
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  ordersWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default Dashboard;
