import Dashboard from "./dashboard/Dashboard";
import HelpPage from "./help/HelpPage";
import InventoryPage from "./inventory/InventoryPage";
import ProductsPage from "./products/ProductsPage";
import ReportsPage from "./reports/ReportsPage";
import SettingsPage from "./settings/SettingsPage";
import FranchisePage from "./franchise/FranchisePage";
import AnalyticsPage from "./analytics/AnalyticsPage";

const index = [
  {
    path: "dashboard",
    component: Dashboard,
  },
  {
    path: "product",
    component: ProductsPage,
  },
  {
    path: "inventory",
    component: InventoryPage,
  },
  {
    path: "report",
    component: ReportsPage,
  },
  {
    path: "analytics",
    component: AnalyticsPage,
  },
  {
    path: "settings",
    component: SettingsPage,
  },
  {
    path: "franchise",
    component: FranchisePage,
  },
  {
    path: "help",
    component: HelpPage,
  },
];

export default index;
