import React, { useEffect } from "react";
import Login from "features/auth/Login";
import Signup from "features/auth/Signup";
import ResetPassword from "features/auth/ResetPassword";
import OrderPage from "features/online-store/OrderPage";
import {
  RouteComponentProps,
  Switch,
  useHistory,
  Route,
} from "react-router-dom";

interface PublicRouteProps extends RouteComponentProps {}

const PublicRoute: React.FC<PublicRouteProps> = (props) => {
  const { location } = props;
  const history = useHistory();

  useEffect(() => {
    if (location.pathname.includes("/authed")) {
      history.push("/");
    }
    if (
      location.pathname !== "/log-in" &&
      location.pathname !== "/sign-up" &&
      location.pathname !== "/reset-password" &&
      !location.pathname.includes("/order/")
    ) {
      history.push("/log-in");
    }
  }, [location.pathname]);

  return (
    <Switch>
      <Route path="/log-in" component={Login} />
      <Route path="/sign-up" component={Signup} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/order/:urlEnding" component={OrderPage} />
    </Switch>
  );
};

export default PublicRoute;
