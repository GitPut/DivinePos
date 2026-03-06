import Dashboard from "./dashboard/Dashboard";
import HelpPage from "./help/HelpPage";
import InventoryPage from "./inventory/InventoryPage";
import ProductsPage from "./products/ProductsPage";
import ReportsPage from "./reports/ReportsPage";
import SettingsPage from "./settings/SettingsPage";

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
    path: "settings",
    component: SettingsPage,
  },
  {
    path: "help",
    component: HelpPage,
  },
];

export default index;
