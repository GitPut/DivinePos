import React, { Suspense } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import Header from "shared/components/header/Header";
import useWindowSize from "shared/hooks/useWindowSize";
import ComponentLoader from "shared/components/ui/ComponentLoader";

const DashboardOverview = React.lazy(() => import("./DashboardOverview"));
const AccountsList = React.lazy(() => import("./AccountsList"));
const AccountDetail = React.lazy(() => import("./AccountDetail"));
const ActivityFeed = React.lazy(() => import("./ActivityFeed"));
const ErrorFeed = React.lazy(() => import("./ErrorFeed"));
const OnlineStores = React.lazy(() => import("./OnlineStores"));
const FranchisesList = React.lazy(() => import("./FranchisesList"));

const TABS = [
  { label: "Overview", path: "/superadmin", exact: true },
  { label: "Accounts", path: "/superadmin/accounts" },
  { label: "Franchises", path: "/superadmin/franchises" },
  { label: "Online Stores", path: "/superadmin/online-stores" },
  { label: "Activity", path: "/superadmin/activity" },
  { label: "Errors", path: "/superadmin/errors" },
];

const SuperAdminContainer: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { height } = useWindowSize();

  return (
    <div style={styles.container}>
      <Header onPressLogo={() => history.push("/superadmin")} />
      <div style={{ ...styles.body, height: height - 75 }}>
        <div style={styles.sidebar}>
          <span style={styles.sidebarTitle}>Super Admin</span>
          {TABS.map((tab) => {
            const isActive = tab.exact
              ? location.pathname === tab.path
              : location.pathname.startsWith(tab.path) &&
                location.pathname !== "/superadmin";
            return (
              <button
                key={tab.path}
                onClick={() => history.push(tab.path)}
                style={{
                  ...styles.tabBtn,
                  ...(isActive ? styles.tabBtnActive : {}),
                }}
              >
                <span
                  style={{
                    ...styles.tabLabel,
                    ...(isActive ? styles.tabLabelActive : {}),
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        <div style={styles.content}>
          <Suspense fallback={<ComponentLoader />}>
            <Switch>
              <Route exact path="/superadmin" component={DashboardOverview} />
              <Route
                exact
                path="/superadmin/accounts"
                component={AccountsList}
              />
              <Route
                path="/superadmin/accounts/:uid"
                component={AccountDetail}
              />
              <Route path="/superadmin/franchises" component={FranchisesList} />
              <Route path="/superadmin/online-stores" component={OnlineStores} />
              <Route path="/superadmin/activity" component={ActivityFeed} />
              <Route path="/superadmin/errors" component={ErrorFeed} />
            </Switch>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  body: {
    flexDirection: "row",
    overflow: "hidden",
  },
  sidebar: {
    width: 220,
    backgroundColor: "#1c294e",
    padding: "24px 0",
    gap: 4,
    overflowY: "auto",
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    padding: "0 20px",
    marginBottom: 16,
  },
  tabBtn: {
    padding: "12px 20px",
    cursor: "pointer",
    borderLeft: "3px solid transparent",
    transition: "background-color 0.15s",
  },
  tabBtnActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderLeftColor: "#4f8cff",
  },
  tabLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: 28,
  },
};

export default SuperAdminContainer;
