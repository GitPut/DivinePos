import React, { useEffect, useState } from "react";
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
import Walkthrough from "shared/components/Walkthrough";

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

// Export so sidebar can trigger it
export let triggerWalkthrough: (() => void) | null = null;

const AuthRoute: React.FC<AuthRouteProps> = (props) => {
  const { location } = props;
  const history = useHistory();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Auto-show walkthrough on first login (per-user)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    const key = uid ? `walkthroughCompleted_${uid}` : "walkthroughCompleted";
    const completed = localStorage.getItem(key);
    if (!completed) {
      const timer = setTimeout(() => setShowWalkthrough(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expose trigger for sidebar "Walkthrough" button
  useEffect(() => {
    triggerWalkthrough = () => setShowWalkthrough(true);
    return () => { triggerWalkthrough = null; };
  }, []);

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
    <>
      <Switch>
        <Route path="/superadmin" component={SuperAdminGuard} />
        <Route path="/pos" component={HomeScreen} />
        <Route path="/authed" component={BackendPosContainer} />
        <Route path="/customer-display" component={CustomerDisplay} />
        <Route path="/order/:urlEnding" component={OrderPage} />
      </Switch>
      <Walkthrough
        isVisible={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
      />
    </>
  );
};

export default AuthRoute;
