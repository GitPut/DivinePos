import React from "react";
import { Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";
import StockLevelsList from "./StockLevelsList";
import IngredientsTab from "./IngredientsTab";

const InventoryPage = ({ match }: { match: { url: string } }) => {
  const history = useHistory();
  const pathname = useLocation().pathname;
  const isIngredients = pathname.includes("/ingredients");
  const isProducts = pathname.includes("/stocklevels");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <div style={styles.tabRow}>
        <button
          style={{
            ...styles.tab,
            ...(isIngredients ? styles.tabActive : {}),
          }}
          onClick={() => history.push(`${match.url}/ingredients`)}
        >
          <span
            style={{
              ...styles.tabText,
              ...(isIngredients ? styles.tabTextActive : {}),
            }}
          >
            Ingredients
          </span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(isProducts ? styles.tabActive : {}),
          }}
          onClick={() => history.push(`${match.url}/stocklevels`)}
        >
          <span
            style={{
              ...styles.tabText,
              ...(isProducts ? styles.tabTextActive : {}),
            }}
          >
            Product Stock
          </span>
        </button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Switch>
          <Redirect exact from={`${match.url}/`} to={`${match.url}/ingredients`} />
          <Route path={`${match.url}/ingredients`} component={IngredientsTab} />
          <Route path={`${match.url}/stocklevels`} component={StockLevelsList} />
        </Switch>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tabRow: {
    display: "flex",
    flexDirection: "row",
    gap: 0,
    padding: "16px 24px 0",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    borderBottom: "2px solid transparent",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  tabActive: {
    borderBottomColor: "#1e293b",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
  },
  tabTextActive: {
    color: "#1e293b",
    fontWeight: "600",
  },
};

export default InventoryPage;
