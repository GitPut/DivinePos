import React, { useEffect } from "react";
import BackendPosContainer from "features/admin/AdminContainer";
import HomeScreen from "features/pos/PosScreen";
import CustomerDisplay from "features/customer-display/CustomerDisplay";
import OrderPage from "features/online-store/OrderPage";
import { auth, OWNER_OVERRIDE_UID } from "services/firebase/config";
import {
  RouteComponentProps,
  Switch,
  useHistory,
  Route,
} from "react-router-dom";

const SuperAdminContainer = React.lazy(
  () => import("features/superadmin/SuperAdminContainer")
);

interface AuthRouteProps extends RouteComponentProps {}

const SuperAdminGuard: React.FC = () => {
  const history = useHistory();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (uid !== OWNER_OVERRIDE_UID) {
      history.push("/pos");
    }
  }, [uid]);

  if (uid !== OWNER_OVERRIDE_UID) return null;
  return (
    <React.Suspense fallback={<div />}>
      <SuperAdminContainer />
    </React.Suspense>
  );
};

const AuthRoute: React.FC<AuthRouteProps> = (props) => {
  const { location } = props;
  const history = useHistory();

  useEffect(() => {
    const isLoginSettings = localStorage.getItem("isAuthedBackend");
    if (location.pathname?.includes("authed")) {
      if (isLoginSettings === "false") {
        history.push("/pos");
      }
    } else if (
      !location.pathname?.includes("customer-display") &&
      !location.pathname?.includes("/order/") &&
      !location.pathname?.includes("/superadmin")
    ) {
      history.push("/pos");
    }
  }, [location.pathname]);

  return (
    <Switch>
      <Route path="/superadmin" component={SuperAdminGuard} />
      <Route path="/pos" component={HomeScreen} />
      <Route path="/authed" component={BackendPosContainer} />
      <Route path="/customer-display" component={CustomerDisplay} />
      <Route path="/order/:urlEnding" component={OrderPage} />
    </Switch>
  );
};

export default AuthRoute;
