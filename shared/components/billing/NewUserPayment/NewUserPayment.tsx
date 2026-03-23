import React, { useState } from "react";
import { auth, db } from "services/firebase/config";
import { updateFreeTrial, updateStoreDetails, createCheckoutSession } from "services/firebase/functions";
import firebase from "firebase/compat/app";
import { storeDetailsState, setStoreDetailsState } from "store/appState";
import Axios from "axios";
import { useAlert } from "react-alert";
import PlanStage from "./components/PlanStage";
import Header from "shared/components/header/Header";
import SideBar from "./components/SideBar";
import DetailsStage from "./components/DetailsStage";
import { AddressType } from "types";
import useWindowSize from "shared/hooks/useWindowSize";
import logoImg from "assets/dpos-logo-black.png";

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
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        alertP.error("Not authenticated. Please try signing up again.");
        return;
      }

      // Use set with merge to ensure doc exists (handles case where signup
      // created the auth user but failed to create the Firestore doc)
      const userRef = db.collection("users").doc(uid);
      await userRef.set({
        storeDetails: {
          name: storeName,
          phoneNumber: phoneNumber,
          address: address ?? null,
          website: website ? website : "",
          deliveryPrice: "",
          settingsPassword: "",
          taxRate: "13",
        },
      }, { merge: true });

      setStoreDetailsState({
        name: storeName,
        phoneNumber: phoneNumber,
        address: address ?? null,
        website: website ? website : "",
        deliveryPrice: "",
        settingsPassword: "",
        taxRate: "13",
        acceptDelivery: false,
        deliveryRange: "",
      });

      if (planType === "freeTrial") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 31);
        const timestamp = firebase.firestore.Timestamp.fromDate(tomorrow);
        await userRef.set({ freeTrial: timestamp }, { merge: true });
        SendEmail();
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
    } catch (err) {
      console.error("Checkout error:", err);
      alertP.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ ...styles.page, minHeight: height }}>
      {/* Decorative circles */}
      <div style={{ ...styles.circle, width: 500, height: 500, top: -150, right: -150, opacity: 0.12 }} />
      <div style={{ ...styles.circle, width: 350, height: 350, bottom: -100, left: -100, opacity: 0.09 }} />
      <div style={{ ...styles.circle, width: 250, height: 250, top: "30%", right: "5%", opacity: 0.09 }} />
      <div style={{ ...styles.circle, width: 180, height: 180, bottom: "20%", left: "8%", opacity: 0.07 }} />

      {/* Logo */}
      <a href="https://divinepos.com" style={{ textDecoration: "none", marginBottom: 20, zIndex: 1 }}>
        <img src={logoImg} style={styles.logo} alt="Divine POS" />
      </a>

      {/* Wizard */}
      <div style={styles.wizardContainer}>
        <SideBar
          stageNum={stageNum}
          setstageNum={setstageNum}
          planType={planType}
          CheckOutFunc={CheckOutFunc}
          detailsFilledOut={
            storeName?.length > 0 && phoneNumber?.length > 0 && !!address
          }
        >
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
        </SideBar>
      </div>
    </div>
  );
};

export default NewUserPayment;

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    backgroundColor: "#f5f6f8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    padding: "32px 20px 48px",
    boxSizing: "border-box" as const,
    position: "relative" as const,
  },
  circle: {
    position: "absolute" as const,
    borderRadius: "50%",
    backgroundColor: "#c0c9d4",
  },
  logo: {
    height: 48,
    width: 160,
    objectFit: "contain" as const,
  },
  wizardContainer: {
    width: "100%",
    maxWidth: 960,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
};
