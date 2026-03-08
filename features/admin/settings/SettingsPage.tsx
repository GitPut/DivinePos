import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import GeneralSettings from "./GeneralSettings";
import DeviceSettings from "./DeviceSettings";
import OnlineStoreSettings from "./OnlineStoreSettings";
import WooCommerceSettings from "./WooCommerceSettings";
import TableSettings from "./TableSettings";
import BillingSettings from "./BillingSettings";
import DeliveryPlatformsSettings from "./DeliveryPlatformsSettings";

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
    <Route path={`${match.url}/tablesettings`} component={TableSettings} />
    <Route path={`${match.url}/deliveryplatforms`} component={DeliveryPlatformsSettings} />
    <Route path={`${match.url}/billingsettings`} component={BillingSettings} />
  </Switch>
);

export default SettingsPage;
