import React, { useEffect, useMemo, useState } from "react";
import PeriodDropdown from "./components/PeriodDropdown";
import BarGraph from "./components/stats/BarGraph";
import { customersState, storeProductsState } from "store/appState";
import { auth, db } from "services/firebase/config";
import ComponentLoader from "shared/components/ui/ComponentLoader";
import { CustomerProp, UserStoreStateProps } from "types";
import { searchCustomersByDate as SearchDateCustomers } from "utils/searchFilters";
import {
  FiDollarSign,
  FiShoppingBag,
  FiTruck,
  FiHome,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";
// SetupChecklist removed — replaced by Walkthrough in AuthRoute

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
  inStoreOrders: { orders: number; revenue: number };
  deliveryOrders: { orders: number; revenue: number };
  pickupOrders: { orders: number; revenue: number };
  totalRevenue: { orders: number; revenue: number };
  mostOrderProducts: { name: string; orders: number; imageUrl: string }[];
  newCustomers: number;
  days: { [key: string]: DayStats };
}

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
  period: string,
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
      return { start: fmt(new Date()), end: fmt(new Date()) };
    case "This Week":
      return { start: fmt(weekStart), end: fmt(weekEnd) };
    case "This Month":
      return { start: fmt(monthStart), end: fmt(monthEnd) };
    case "This Year":
      return { start: fmt(yearStart), end: fmt(yearEnd) };
    case "All Time":
      return { start: "1970-01-01", end: fmt(new Date()) };
    default:
      return null;
  }
};

const filterDays = (
  days: { [key: string]: DayStats },
  start: string,
  end: string,
) =>
  Object.keys(days)
    .filter((date) => date >= start && date <= end)
    .reduce(
      (obj, key) => {
        obj[key] = days[key];
        return obj;
      },
      {} as { [key: string]: DayStats },
    );

const calculateDetails = (
  days: { [key: string]: DayStats },
  catalog: UserStoreStateProps,
  customersLength: number,
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
    (a, b) => b[1] - a[1],
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

const getFilteredCustomerCount = (
  customers: CustomerProp[],
  period: string,
): number => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear(), 11, 31);

  let dateRange: { start: string; end: string } | null = null;
  switch (period) {
    case "Today":
      dateRange = {
        start: new Date().toDateString(),
        end: new Date().toDateString(),
      };
      break;
    case "This Week":
      dateRange = {
        start: weekStart.toDateString(),
        end: weekEnd.toDateString(),
      };
      break;
    case "This Month":
      dateRange = {
        start: monthStart.toDateString(),
        end: monthEnd.toDateString(),
      };
      break;
    case "This Year":
      dateRange = {
        start: yearStart.toDateString(),
        end: yearEnd.toDateString(),
      };
      break;
    default:
      return customers.length;
  }

  const filtered = SearchDateCustomers({
    startDate: dateRange.start,
    endDate: dateRange.end,
    customers,
  });
  return filtered?.length ?? 0;
};

// ------------------ Main Component ------------------
const Dashboard: React.FC = () => {
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
        const statsDoc = await db
          .collection("users")
          .doc(userId)
          .collection("stats")
          .doc("monthly")
          .get();
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
    const range = getDateRange(period);
    if (!range) return defaultDetails;
    const filteredDays = filterDays(allStats.days, range.start, range.end);
    return calculateDetails(filteredDays, catalog, customers.length);
  }, [period, allStats, catalog, customers.length]);

  const chartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = months.map((name) => ({ name, uv: 0, pv: 0, amt: 0 }));
    if (details?.days) {
      Object.keys(details.days).forEach((date) => {
        const month = parseInt(date.split("-")[1], 10) - 1;
        if (data[month]) {
          data[month].uv += details.days[date].revenue || 0;
          data[month].pv += details.days[date].orders || 0;
          data[month].amt += details.days[date].orders || 0;
        }
      });
    }
    return data;
  }, [details]);

  const customerCount = useMemo(
    () => getFilteredCustomerCount(customers, period),
    [customers, period],
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <ComponentLoader />
      </div>
    );
  }

  const { totalRevenue, pickupOrders, deliveryOrders, inStoreOrders } = details;
  const wait = details.averageWaitTime;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Dashboard</span>
          <span style={styles.subtitle}>Overview of your store performance</span>
        </div>
        <PeriodDropdown value={period} setValue={setPeriod} />
      </div>

      {/* Scrollable content */}
      <div style={styles.scrollArea}>
        {/* KPI Row */}
        <div style={styles.kpiRow}>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconWrap, backgroundColor: "#eff6ff" }}>
              <FiDollarSign size={20} color="#1D294E" />
            </div>
            <div>
              <span style={styles.kpiValue}>
                ${totalRevenue.revenue.toFixed(2)}
              </span>
              <span style={styles.kpiLabel}>Total Revenue</span>
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconWrap, backgroundColor: "#f0fdf4" }}>
              <FiTrendingUp size={20} color="#16a34a" />
            </div>
            <div>
              <span style={styles.kpiValue}>{totalRevenue.orders}</span>
              <span style={styles.kpiLabel}>Total Orders</span>
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconWrap, backgroundColor: "#fef3c7" }}>
              <FiUsers size={20} color="#d97706" />
            </div>
            <div>
              <span style={styles.kpiValue}>{customerCount}</span>
              <span style={styles.kpiLabel}>New Customers</span>
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiIconWrap, backgroundColor: "#fce4ec" }}>
              <FiClock size={20} color="#e11d48" />
            </div>
            <div>
              <span style={styles.kpiValue}>
                {!isNaN(wait.average) ? wait.average.toFixed(0) : 0}m
              </span>
              <span style={styles.kpiLabel}>Avg Wait Time</span>
            </div>
          </div>
        </div>

        {/* Chart + Most Ordered Row */}
        <div style={styles.middleRow}>
          {/* Revenue Chart */}
          <div style={{ ...styles.card, flex: 2, minWidth: 0 }}>
            <div style={styles.cardHeaderRow}>
              <span style={styles.cardTitle}>Revenue Overview</span>
              <span style={styles.cardSubtitle}>Monthly sales this year</span>
            </div>
            <div style={styles.chartWrap}>
              <BarGraph data={chartData} />
            </div>
          </div>

          {/* Most Ordered Items */}
          <div style={{ ...styles.card, flex: 1, minWidth: 260 }}>
            <span style={styles.cardTitle}>Most Ordered Items</span>
            {details.mostOrderProducts.length > 0 ? (
              <div style={styles.itemsList}>
                {details.mostOrderProducts.map((item, i) => (
                  <div key={item.name} style={styles.itemRow}>
                    <div style={styles.itemLeft}>
                      <div
                        style={{
                          ...styles.rankBadge,
                          backgroundColor:
                            i === 0
                              ? "#fef3c7"
                              : i === 1
                                ? "#f1f5f9"
                                : "#fff7ed",
                          color:
                            i === 0
                              ? "#92400e"
                              : i === 1
                                ? "#475569"
                                : "#9a3412",
                        }}
                      >
                        <FiStar size={12} />
                      </div>
                      <span style={styles.itemName}>{item.name}</span>
                    </div>
                    <span style={styles.itemOrders}>{item.orders} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyItems}>
                <span style={styles.emptyText}>No orders yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Types Row */}
        <div style={styles.orderTypesRow}>
          {/* Pickup */}
          <div style={styles.orderCard}>
            <div style={styles.orderCardHeader}>
              <div
                style={{
                  ...styles.orderIconWrap,
                  backgroundColor: "#eff6ff",
                }}
              >
                <FiShoppingBag size={18} color="#1D294E" />
              </div>
              <span style={styles.orderCardTitle}>Pickup Orders</span>
            </div>
            <div style={styles.orderStats}>
              <div>
                <span style={styles.orderStatValue}>
                  ${pickupOrders.revenue.toFixed(2)}
                </span>
                <span style={styles.orderStatLabel}>Revenue</span>
              </div>
              <div style={styles.orderStatDivider} />
              <div>
                <span style={styles.orderStatValue}>
                  {pickupOrders.orders}
                </span>
                <span style={styles.orderStatLabel}>Orders</span>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div style={styles.orderCard}>
            <div style={styles.orderCardHeader}>
              <div
                style={{
                  ...styles.orderIconWrap,
                  backgroundColor: "#fef3c7",
                }}
              >
                <FiTruck size={18} color="#d97706" />
              </div>
              <span style={styles.orderCardTitle}>Delivery Orders</span>
            </div>
            <div style={styles.orderStats}>
              <div>
                <span style={styles.orderStatValue}>
                  ${deliveryOrders.revenue.toFixed(2)}
                </span>
                <span style={styles.orderStatLabel}>Revenue</span>
              </div>
              <div style={styles.orderStatDivider} />
              <div>
                <span style={styles.orderStatValue}>
                  {deliveryOrders.orders}
                </span>
                <span style={styles.orderStatLabel}>Orders</span>
              </div>
            </div>
          </div>

          {/* In-Store */}
          <div style={styles.orderCard}>
            <div style={styles.orderCardHeader}>
              <div
                style={{
                  ...styles.orderIconWrap,
                  backgroundColor: "#f0fdf4",
                }}
              >
                <FiHome size={18} color="#16a34a" />
              </div>
              <span style={styles.orderCardTitle}>In-Store Orders</span>
            </div>
            <div style={styles.orderStats}>
              <div>
                <span style={styles.orderStatValue}>
                  ${inStoreOrders.revenue.toFixed(2)}
                </span>
                <span style={styles.orderStatLabel}>Revenue</span>
              </div>
              <div style={styles.orderStatDivider} />
              <div>
                <span style={styles.orderStatValue}>
                  {inStoreOrders.orders}
                </span>
                <span style={styles.orderStatLabel}>Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wait Time Card */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Order Wait Time (Minutes)</span>
          <div style={styles.waitGrid}>
            {[
              {
                label: "Shortest",
                value: wait.shortest,
                bg: "#f0fdf4",
                color: "#16a34a",
              },
              {
                label: "Longest",
                value: wait.longest,
                bg: "#fef2f2",
                color: "#dc2626",
              },
              {
                label: "Average",
                value: wait.average,
                bg: "#eff6ff",
                color: "#1D294E",
              },
              {
                label: "Mean",
                value: wait.mean,
                bg: "#faf5ff",
                color: "#9333ea",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{ ...styles.waitItem, backgroundColor: item.bg }}
              >
                <FiClock size={18} color={item.color} />
                <span style={{ ...styles.waitValue, color: item.color }}>
                  {!isNaN(item.value) ? item.value.toFixed(0) : 0}
                </span>
                <span style={styles.waitLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexShrink: 0,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingBottom: 20,
  },
  // KPI cards
  kpiRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  kpiCard: {
    flex: "1 1 200px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  kpiIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
    display: "block",
  },
  // Chart + Most Ordered
  middleRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    flexShrink: 0,
  },
  cardHeaderRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  chartWrap: {
    height: 220,
    width: "100%",
  },
  // Most ordered items
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  itemLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  itemOrders: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyItems: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  // Order type cards
  orderTypesRow: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  orderCard: {
    flex: "1 1 260px",
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  orderCardHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  orderStats: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  orderStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  orderStatLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
    display: "block",
  },
  orderStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#e2e8f0",
  },
  // Wait time
  waitGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  waitItem: {
    flex: "1 1 120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: 16,
    borderRadius: 10,
  },
  waitValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  waitLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
};

export default Dashboard;
