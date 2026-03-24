import React, { useState } from "react";
import DropdownMenuButton from "./components/DropdownMenuButton";
import { Route, useHistory, useLocation, withRouter } from "react-router-dom";
import MenuButton from "./components/MenuButton";
import index from "./index";
import Header from "shared/components/header/Header";
import useWindowSize from "shared/hooks/useWindowSize";
import {
  FiBarChart2,
  FiBook,
  FiPackage,
  FiFileText,
  FiSettings,
  FiHelpCircle,
  FiPlayCircle,
  FiGlobe,
} from "react-icons/fi";
import { triggerWalkthrough } from "router/AuthRoute";
import { franchiseState } from "store/appState";

function AdminContainer(props: { match: { url: string } }) {
  const { match } = props;
  const [isSideMenu, setSideMenu] = useState("");
  const history = useHistory();
  const location = useLocation();
  const pathname = location.pathname;
  const { height } = useWindowSize();
  const franchise = franchiseState.use();

  return (
    <div style={styles.container}>
      <Header
        onPressLogo={() => {
          history.push("/authed/dashboard");
          setSideMenu("");
        }}
        isPosHeader={true}
      />
      <div style={{ ...styles.bottom, height: height - 75 }}>
        <div style={styles.leftMenu}>
          <div style={styles.menuOptionsContainer}>
            <MenuButton
              labelIcon={<FiBarChart2 size={18} />}
              labelText="Dashboard"
              active={pathname.includes("dashboard")}
              onPress={() => {
                history.push("/authed/dashboard");
                setSideMenu("");
              }}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/product")}
              dropDownOpen={isSideMenu === "product"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "product" ? "" : "product"))
              }
              labelIcon={<FiBook size={18} />}
              labelText="Menu"
              options={[
                {
                  label: "Category Management",
                  link: "/authed/product/categorylist-product",
                  active: pathname.includes("categorylist"),
                },
                {
                  label: "Product Management",
                  link: "/authed/product/productlist-product",
                  active: pathname.includes("productlist-"),
                },
                {
                  label: "Option Templates",
                  link: "/authed/product/option-templates",
                  active: pathname.includes("option-templates"),
                },
              ]}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/inventory")}
              dropDownOpen={isSideMenu === "inventory"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "inventory" ? "" : "inventory"))
              }
              labelIcon={<FiPackage size={18} />}
              labelText="Inventory"
              options={[
                {
                  label: "Ingredients",
                  link: "/authed/inventory/ingredients",
                  active: pathname.includes("/inventory/ingredients"),
                },
                {
                  label: "Product Stock",
                  link: "/authed/inventory/stocklevels",
                  active: pathname.includes("/inventory/stocklevels"),
                },
              ]}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/report")}
              dropDownOpen={isSideMenu === "report"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "report" ? "" : "report"))
              }
              labelIcon={<FiFileText size={18} />}
              labelText="Reports"
              options={[
                {
                  label: "Invoice Report",
                  link: "/authed/report/invoicereport",
                  active: pathname.includes("invoicereport"),
                },
                {
                  label: "Employees Report",
                  link: "/authed/report/employeesreport",
                  active: pathname.includes("employeesreport"),
                },
                {
                  label: "Activity Log",
                  link: "/authed/report/activitylog",
                  active: pathname.includes("activitylog"),
                },
              ]}
            />
            <DropdownMenuButton
              active={pathname.includes("/authed/settings")}
              dropDownOpen={isSideMenu === "settings"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "settings" ? "" : "settings"))
              }
              labelIcon={<FiSettings size={18} />}
              labelText="Store Settings"
              options={[
                {
                  label: "General Settings",
                  link: "/authed/settings/generalsettings",
                  active: pathname.includes("generalsettings"),
                },
                {
                  label: "Device Settings",
                  link: "/authed/settings/devicesettings",
                  active: pathname.includes("devicesettings"),
                },
                {
                  label: franchise.franchiseRole === "location" ? "Payment Settings" : "Online Store Settings",
                  link: "/authed/settings/onlinestoresettings",
                  active: pathname.includes("onlinestoresettings"),
                },
                {
                  label: "WooCommerce",
                  link: "/authed/settings/woocommerce",
                  active: pathname.includes("woocommerce"),
                },
                {
                  label: "Table Settings",
                  link: "/authed/settings/tablesettings",
                  active: pathname.includes("tablesettings"),
                },
                {
                  label: "Billing",
                  link: "/authed/settings/billingsettings",
                  active: pathname.includes("billingsettings"),
                },
              ]}
            />
            {franchise.franchiseRole === "hub" && (
              <DropdownMenuButton
                active={pathname.includes("/authed/franchise")}
                dropDownOpen={isSideMenu === "franchise"}
                toggleDropdown={() =>
                  setSideMenu((prev) => (prev === "franchise" ? "" : "franchise"))
                }
                labelIcon={<FiGlobe size={18} />}
                labelText="Franchise"
                options={[
                  {
                    label: "Overview",
                    link: "/authed/franchise/overview",
                    active: pathname.includes("franchise/overview"),
                  },
                  {
                    label: "Locations",
                    link: "/authed/franchise/locations",
                    active: pathname.includes("franchise/locations"),
                  },
                ]}
              />
            )}
            <DropdownMenuButton
              labelIcon={<FiHelpCircle size={18} />}
              labelText="Help"
              active={pathname.includes("help")}
              dropDownOpen={isSideMenu === "help"}
              toggleDropdown={() =>
                setSideMenu((prev) => (prev === "help" ? "" : "help"))
              }
              options={[
                {
                  label: "Getting Started",
                  link: "/authed/help/1",
                  active: pathname.includes("help/1"),
                },
                {
                  label: "Device & Store Settings",
                  link: "/authed/help/2",
                  active: pathname.includes("help/2"),
                },
                {
                  label: "Dashboard & Analytics",
                  link: "/authed/help/3",
                  active: pathname.includes("help/3"),
                },
                {
                  label: "Building Products",
                  link: "/authed/help/4",
                  active: pathname.includes("help/4"),
                },
                {
                  label: "Managing Reports",
                  link: "/authed/help/5",
                  active: pathname.includes("help/5"),
                },
              ]}
            />
            <MenuButton
              labelIcon={<FiPlayCircle size={18} />}
              labelText="Walkthrough"
              active={false}
              onPress={() => {
                if (triggerWalkthrough) triggerWalkthrough();
              }}
            />
          </div>
        </div>
        <div style={styles.rightSide}>
          <div style={{ height: "100%" }}>
            <div style={styles.page}>
              {index &&
                index.map((route, key) => (
                  <Route
                    key={key}
                    path={`${match.url}/${route.path}`}
                    component={route.component}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  bottom: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    overflow: "hidden",
  },
  leftMenu: {
    width: 240,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  menuOptionsContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    gap: 2,
    overflow: "auto",
    flex: 1,
  },
  rightSide: {
    flex: 1,
    display: "flex",
    minWidth: 0,
    overflow: "hidden",
  },
  page: {
    width: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};

export default withRouter(AdminContainer);
