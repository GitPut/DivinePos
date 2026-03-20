import React, { useState } from "react";
import { auth } from "services/firebase/config";
import { updateFreeTrial, updateStoreDetails, createCheckoutSession } from "services/firebase/functions";
import { storeDetailsState } from "store/appState";
import Axios from "axios";
import { useAlert } from "react-alert";
import PlanStage from "./components/PlanStage";
import Header from "shared/components/header/Header";
import SideBar from "./components/SideBar";
import DetailsStage from "./components/DetailsStage";
import { AddressType } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

const STARTER_PRICE_ID = "price_1T8TIlCIw3L7DOwIDUpngIcI";
const PROFESSIONAL_PRICE_ID = "price_1T8s0hCIw3L7DOwIuHk36Ly3";

const NewUserPayment = () => {
  const [planType, setplanType] = useState<string | null>(null);
  const [stageNum, setstageNum] = useState(1);
  const storeDetails = storeDetailsState.use();
  const [storeName, setstoreName] = useState(storeDetails.name);
  const [phoneNumber, setphoneNumber] = useState(storeDetails.phoneNumber);
  const [address, setaddress] = useState<null | AddressType>(
    storeDetails.address ? storeDetails.address : null
  );
  const [website, setwebsite] = useState(storeDetails.website);
  const alertP = useAlert();
  const { height } = useWindowSize();

  const SendEmail = () => {
    const data = JSON.stringify({
      email: auth.currentUser?.email,
      name: storeName,
      isFreeTrial: planType === "freeTrial",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://us-central1-posmate-5fc0a.cloudfunctions.net/sendWelcomeEmail",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    Axios(config)
      .then(function () {
        // success
      })
      .catch(function () {
        // error
      });
  };

  const CheckOutFunc = async () => {
    updateStoreDetails({
      name: storeName,
      phoneNumber: phoneNumber,
      address: address ?? undefined,
      website: website ? website : "",
      deliveryPrice: "",
      settingsPassword: "",
      taxRate: "13",
    });

    if (planType === "freeTrial") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 31);
      await updateFreeTrial(tomorrow);
      SendEmail();
      // Full reload so Router re-bootstraps and sees the freeTrial field
      window.location.href = "/pos";
    } else {
      let priceId;
      if (planType === "starter") {
        priceId = STARTER_PRICE_ID;
      } else if (planType === "professional") {
        priceId = PROFESSIONAL_PRICE_ID;
      }
      if (!priceId) return;

      await createCheckoutSession(
        priceId,
        `${window.location.origin}/success`,
        `${window.location.origin}/cancelled`,
        (msg) => alertP.error(msg || "An error occurred")
      );
    }
  };

  return (
    <>
      <Header />
      <div style={{ ...styles.container, height: height - 75 }}>
        <div style={styles.innerContainer}>
          <SideBar
            stageNum={stageNum}
            setstageNum={setstageNum}
            planType={planType}
            CheckOutFunc={CheckOutFunc}
            detailsFilledOut={
              storeName?.length > 0 && phoneNumber?.length > 0 && !!address
            }
          />
          {stageNum === 1 && (
            <PlanStage
              planType={planType}
              setplanType={setplanType}
            />
          )}
          {stageNum === 2 && (
            <DetailsStage
              setstageNum={setstageNum}
              setstoreName={setstoreName}
              setphoneNumber={setphoneNumber}
              setwebsite={setwebsite}
              setaddress={setaddress}
              address={address}
              planType={planType}
              storeName={storeName}
              phoneNumber={phoneNumber}
              website={website}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default NewUserPayment;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    padding: "20px 20px 40px",
    boxSizing: "border-box" as const,
  },
  innerContainer: {
    width: "100%",
    maxWidth: 960,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
};
