import React, { useEffect } from "react";
import BackendPosContainer from "features/admin/AdminContainer";
import HomeScreen from "features/pos/PosScreen";
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
    } else {
      history.push("/pos");
    }
  }, [location.pathname]);

  return (
    <Switch>
      <Route path="/pos" component={HomeScreen} />
      <Route path="/authed" component={BackendPosContainer} />
    </Switch>
  );
};

export default AuthRoute;
