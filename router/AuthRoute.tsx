import React, { useEffect } from "react";
import BackendPosContainer from "features/admin/AdminContainer";
import HomeScreen from "features/pos/PosScreen";
import CustomerDisplay from "features/customer-display/CustomerDisplay";
import {
  RouteComponentProps,
  Switch,
  useHistory,
  Route,
} from "react-router-dom";

interface AuthRouteProps extends RouteComponentProps {}

const AuthRoute: React.FC<AuthRouteProps> = (props) => {
  const { location } = props;
  const history = useHistory();

  useEffect(() => {
    const isLoginSettings = localStorage.getItem("isAuthedBackend");
    if (location.pathname?.includes("authed")) {
      if (isLoginSettings === "false") {
        history.push("/pos");
      }
    } else if (!location.pathname?.includes("customer-display")) {
      history.push("/pos");
    }
  }, [location.pathname]);

  return (
    <Switch>
      <Route path="/pos" component={HomeScreen} />
      <Route path="/authed" component={BackendPosContainer} />
      <Route path="/customer-display" component={CustomerDisplay} />
    </Switch>
  );
};

export default AuthRoute;
