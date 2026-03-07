import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import GeneralSettings from "./GeneralSettings";
import DeviceSettings from "./DeviceSettings";
import OnlineStoreSettings from "./OnlineStoreSettings";
import WooCommerceSettings from "./WooCommerceSettings";

const SettingsPage = ({ match }: { match: { url: string } }) => (
  <Switch>
    <Redirect
      exact
      from={`${match.url}/`}
      to={`${match.url}/generalsettings`}
    />
    <Route path={`${match.url}/generalsettings`} component={GeneralSettings} />
    <Route path={`${match.url}/devicesettings`} component={DeviceSettings} />
    <Route
      path={`${match.url}/onlinestoresettings`}
      component={OnlineStoreSettings}
    />
    <Route path={`${match.url}/woocommerce`} component={WooCommerceSettings} />
  </Switch>
);

export default SettingsPage;
