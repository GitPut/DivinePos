import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import FranchiseDashboard from "./FranchiseDashboard";
import FranchiseLocations from "./FranchiseLocations";

function FranchisePage() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/locations`} component={FranchiseLocations} />
      <Route path={`${path}/overview`} component={FranchiseDashboard} />
      <Route path={path} component={FranchiseDashboard} />
    </Switch>
  );
}

export default FranchisePage;
