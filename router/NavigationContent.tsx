import React from "react";
import { Route } from "react-router-dom";
import { TrialDetailsStateProps } from "types";

const PaymentUpdateNotification = React.lazy(
  () => import("shared/components/billing/PaymentUpdateNotification")
);
const AuthRoute = React.lazy(() => import("./AuthRoute"));
const TrialEnded = React.lazy(
  () => import("shared/components/billing/TrialEnded")
);
const NewUserPayment = React.lazy(
  () => import("shared/components/billing/NewUserPayment/NewUserPayment")
);

interface NavigationContentProps {
  isNewUser: boolean;
  isCanceled: boolean;
  isSubscribed: boolean;
  trialDetails: TrialDetailsStateProps;
}

const NavigationContent = ({
  isNewUser,
  isCanceled,
  isSubscribed,
  trialDetails,
}: NavigationContentProps) => {
  if (trialDetails.hasEnded && !isSubscribed && !isNewUser) {
    return <TrialEnded />;
  } else if (isNewUser) {
    return <NewUserPayment />;
  } else if (isCanceled && !isSubscribed && !isNewUser) {
    return <PaymentUpdateNotification isCanceled={isCanceled} />;
  } else {
    return <Route path="/" component={AuthRoute} />;
  }
};

export default NavigationContent;
