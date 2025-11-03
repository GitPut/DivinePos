import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { auth, db } from "state/firebaseConfig";
import { loadStripe } from "@stripe/stripe-js";
import { updateFreeTrial, updateStoreDetails } from "state/firebaseFunctions";
import { storeDetailState } from "state/state";
import Axios from "axios";
import { useAlert } from "react-alert";
import PlanStage from "./components/PlanStage";
import Header from "components/Header/Header";
import SideBar from "./components/SideBar";
import DetailsStage from "./components/DetailsStage";
import { AddressType } from "types/global";

const NewUserPayment = () => {
  const [planType, setplanType] = useState<string | null>(null);
  const [stageNum, setstageNum] = useState(1);
  const storeDetails = storeDetailState.use();
  const [storeName, setstoreName] = useState(storeDetails.name);
  const [phoneNumber, setphoneNumber] = useState(storeDetails.phoneNumber);
  const [address, setaddress] = useState<null | AddressType>(
    storeDetails.address ? storeDetails.address : null
  );
  const [website, setwebsite] = useState(storeDetails.website);
  const [paymentTerm, setpaymentTerm] = useState<string>("monthly");
  const alertP = useAlert();
  const { height } = useWindowDimensions();

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
        // console.log(JSON.stringify(response.data));
      })
      .catch(function () {
        // alertP.error(error);
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
      // Get today's date
      const tomorrow = new Date();
      // Change the date by adding 1 to it (tomorrow + 1 = tomorrow)
      tomorrow.setDate(tomorrow.getDate() + 31);
      // return yyyy-mm-dd format
      updateFreeTrial(tomorrow);
      SendEmail();
    } else {
      let priceId;
      if (paymentTerm === "monthly") {
        if (planType === "standard") {
          priceId = "price_1Mb2s4CIw3L7DOwI5PDx3qKx"; // Standard price monthly
        } else if (planType === "premium") {
          priceId = "price_1P6zUFCIw3L7DOwIo9SCcg2R"; // Premium price monthly
        }
      } else {
        if (planType === "standard") {
          priceId = "price_1Mb2s4CIw3L7DOwIF00zPa4q"; // Standard price yearly
        } else if (planType === "premium") {
          priceId = "price_1P6zV2CIw3L7DOwIsuPy0rnM"; // Premium price yearly
        }
      }
      await db
        .collection("users")
        .doc(auth.currentUser?.uid)
        .collection("checkout_sessions")
        .add({
          price: priceId, // todo price Id from your products price in the Stripe Dashboard
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancelled`,
        })
        .then((docRef) => {
          // Wait for the checkoutSession to get attached by the extension
          docRef.onSnapshot(async (snap) => {
            const { error, sessionId } = snap.data() ?? {};
            if (error) {
              // Show an error to your customer and inspect
              // your Cloud Function logs in the Firebase console.
              alertP.error(`An error occurred`);
            }

            if (sessionId) {
              // We have a session, let's redirect to Checkout
              // Init Stripe
              const stripe = await loadStripe(
                "pk_live_51MHqrvCIw3L7DOwI0ol9CTCSH7mQXTLKpxTWKzmwOY1MdKwaYwhdJq6WTpkWdBeql3sS44JmybynlRnaO2nSa1FK001dHiEOZO" // todo enter your public stripe key here
              );
              if (!stripe) return;
              await stripe.redirectToCheckout({ sessionId });
            }
          });
        })
        .finally(() => {
          // Check if the current page is the success page
          if (window.location.pathname === "/success") {
            SendEmail(); // Call the function to send an email
            window.location.reload(); // Reload the page
          }
        });
    }
  };

  return (
    <>
      <Header />
      <View style={[styles.container, { height: height - 75 }]}>
        <View style={styles.leftContainer}>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
            }}
          >
            {stageNum === 1 && (
              <PlanStage
                planType={planType}
                setplanType={setplanType}
                setpaymentTerm={setpaymentTerm}
                paymentTerm={paymentTerm}
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
                paymentTerm={paymentTerm}
                setpaymentTerm={setpaymentTerm}
                planType={planType}
                storeName={storeName}
                phoneNumber={phoneNumber}
                website={website}
              />
            )}
          </ScrollView>
        </View>
        <SideBar
          stageNum={stageNum}
          setstageNum={setstageNum}
          planType={planType}
          CheckOutFunc={CheckOutFunc}
          detailsFilledOut={
            storeName?.length > 0 && phoneNumber?.length > 0 && !!address
          }
        />
      </View>
    </>
  );
};

export default NewUserPayment;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#EEF2FF",
  },
  leftContainer: {
    width: "72%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  backAndForwardContainer: {
    width: 830,
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon6: {
    color: "rgba(128,128,128,0.25)",
    fontSize: 50,
  },
  icon22: {
    color: "rgba(128,128,128,1)",
    fontSize: 50,
  },
  storeDetailsTxtContainer: {
    width: 280,
    height: 61,
    alignItems: "center",
    justifyContent: "space-between",
  },
  storeDetails: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 35,
    height: 38,
  },
  rect13: {
    width: 58,
    height: 10,
    backgroundColor: "rgba(218,215,215,1)",
    borderRadius: 30,
  },
  planItemContainer: {
    width: 691,
    height: 445,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 30,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 150,
    shadowOpacity: 0.22,
    shadowRadius: 50,
    justifyContent: "space-around",
  },
  pITopContainer: {
    height: 431,
    padding: 20,
  },
  group4: {
    width: 617,
    height: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  group24: {
    width: 227,
    height: 33,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  standard: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 30,
  },
  plan2: {
    fontWeight: "600",
    color: "rgba(31,35,48,1)",
    fontSize: 25,
  },
  group23: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  icon16: {
    color: "rgba(255,255,255,1)",
    fontSize: 36,
  },
  allYearPayment: {
    fontWeight: "600",
    color: "rgba(155,155,155,1)",
    fontSize: 25,
    width: 240,
  },
  group6: {
    width: 428,
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },
  overview1: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 50,
  },
  monthly5: {
    fontWeight: "600",
    color: "rgba(31,35,48,1)",
    fontSize: 35,
  },
  group5: {
    width: 224,
    height: 45,
    flexDirection: "row",
    backgroundColor: "rgba(20,112,239,1)",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "space-around",
  },
  monthly6: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 19,
  },
  icon14: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  group7: {
    width: 210,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cloudBased: {
    fontWeight: "500",
    color: "rgba(0,0,0,1)",
    fontSize: 20,
  },
  checkIcon: {
    color: "rgba(74,74,74,1)",
    fontSize: 30,
  },
  group8: {
    width: 190,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  easyToUse: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  icon18: {
    color: "rgba(74,74,74,1)",
    fontSize: 50,
    width: 40,
    height: 44,
  },
  group9: {
    width: 365,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  easyToUse2: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  icon19: {
    color: "rgba(74,74,74,1)",
    fontSize: 50,
    width: 40,
    height: 44,
  },
  group10: {
    width: 206,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text9: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 25,
  },
  icon20: {
    color: "rgba(74,74,74,1)",
    fontSize: 50,
    width: 40,
    height: 44,
  },
  pITBottomContainer: {
    width: 690,
    height: 12,
  },
  rect33: {
    width: 690,
    height: 12,
    backgroundColor: "rgba(208,208,208,0.96)",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  rect32: {
    width: 300,
    height: 12,
    backgroundColor: "rgba(51,81,243,1)",
    opacity: 0.96,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    marginLeft: 2,
  },
  downloadBtnContainer: {
    width: "100%",
  },
  group12: {
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
  rect21: {
    width: 150,
    height: 100,
    alignItems: "center",
    backgroundColor: "rgba(20,112,239,1)",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 30,
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },
  icon9: {
    color: "rgba(255,255,255,1)",
    fontSize: 70,
  },
  rect22: {
    width: "100%",
    height: 12,
    position: "absolute",
    backgroundColor: "rgba(208,208,208,1)",
    bottom: 0,
    opacity: 0.74,
  },
  group12Stack: {
    width: "100%",
    alignItems: "center",
  },
  rightContainer: {
    width: "30%",
    height: "100%",
    backgroundColor: "#1D294E",
    shadowColor: "rgba(85,85,85,1)",
    shadowOffset: {
      width: -3,
      height: -3,
    },
    elevation: 15,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    justifyContent: "space-around",
    alignItems: "center",
  },
  pageStatusContainer: {
    width: 279,
    height: 65,
  },
  greyDivider: {
    width: 71,
    height: 5,
    backgroundColor: "rgba(155,155,155,1)",
  },
  darkGreyDivider: {
    width: 71,
    height: 5,
    backgroundColor: "rgba(155,155,155,1)",
    opacity: 0.15,
  },
  ActiveIconContainer: {
    width: 66,
    height: 66,
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 33,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 90,
    shadowOpacity: 0.54,
    shadowRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: "rgba(255,255,255,1)",
    fontSize: 35,
  },
  rect41: {
    top: 0,
    left: 107,
    width: 66,
    height: 64,
    position: "absolute",
    backgroundColor: "rgba(51,81,243,1)",
    borderRadius: 100,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 150,
    shadowOpacity: 0.61,
    shadowRadius: 50,
  },
  icon25: {
    color: "rgba(255,255,255,1)",
    fontSize: 36,
    width: 40,
    height: 44,
    marginTop: 12,
    marginLeft: 14,
  },
  rect38Stack: {
    top: 0,
    left: 0,
    width: 173,
    height: 64,
    position: "absolute",
  },
  rect39: {
    top: 31,
    left: 0,
    width: 71,
    height: 5,
    position: "absolute",
    backgroundColor: "rgba(155,155,155,1)",
    opacity: 0.15,
  },
  notActiveIconContainer: {
    width: 66,
    height: 66,
    backgroundColor: "rgba(208,213,243,1)",
    borderRadius: 33,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 150,
    shadowOpacity: 0.61,
    shadowRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  icon26: {
    color: "rgba(255,255,255,1)",
    fontSize: 36,
    width: 40,
    height: 44,
    marginTop: 12,
    marginLeft: 14,
  },
  rect39Stack: {
    top: 1,
    left: 160,
    width: 119,
    height: 64,
    position: "absolute",
  },
  rect38StackStack: {
    width: 279,
    height: 65,
  },
  pageStatusTxtContainer: {
    width: 315,
    height: 252,
  },
  onH1Txt: {
    position: "absolute",
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
    width: 246,
    height: 38,
  },
  stageChecked: {
    width: 26,
    height: 26,
    backgroundColor: "rgba(10,188,27,1)",
    borderRadius: 13,
    shadowColor: "rgba(0,0,0,1)",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    elevation: 90,
    shadowOpacity: 0.54,
    shadowRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  subscription1Stack: {
    top: 0,
    left: 0,
    width: 252,
    height: 50,
    position: "absolute",
  },
  planInfo1: {
    top: 38,
    left: 0,
    position: "absolute",
    fontWeight: "500",
    color: "rgba(155,155,155,1)",
    fontSize: 23,
  },
  subscription1StackStack: {
    width: 252,
    height: 50,
    marginLeft: 42,
  },
  onNumTxt: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 30,
    width: 22,
    height: 38,
    marginLeft: -294,
    marginTop: 14,
  },
  subscription1StackStackRow: {
    height: 52,
    flexDirection: "row",
    marginRight: 21,
  },
  storeSetup1: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 30,
    width: 246,
    height: 38,
  },
  storeInfo1: {
    fontWeight: "600",
    color: "rgba(155,155,155,1)",
    fontSize: 25,
  },
  storeSetup1Column: {
    width: 246,
    marginLeft: 39,
    marginBottom: 2,
  },
  text10: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 30,
    width: 22,
    height: 38,
    marginLeft: -285,
    marginTop: 2,
  },
  storeSetup1ColumnRow: {
    height: 40,
    flexDirection: "row",
    marginTop: 48,
    marginLeft: 1,
    marginRight: 29,
  },
  rect36: {
    width: 55,
    height: 2,
    backgroundColor: "rgba(155,155,155,1)",
    transform: [
      {
        rotate: "90.00deg",
      },
    ],
    marginTop: -67,
    marginLeft: -18,
  },
  rect37: {
    width: 55,
    height: 2,
    backgroundColor: "rgba(155,155,155,1)",
    transform: [
      {
        rotate: "90.00deg",
      },
    ],
    marginTop: 85,
    marginLeft: -18,
  },
  connectShop1: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
    width: 246,
    height: 38,
    opacity: 0.44,
  },
  link1: {
    fontWeight: "500",
    color: "rgba(155,155,155,1)",
    fontSize: 22,
    opacity: 0.44,
  },
  connectShop1Column: {
    width: 246,
    marginLeft: 39,
    marginBottom: 3,
  },
  offNumTxt: {
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    fontSize: 30,
    width: 22,
    height: 38,
    marginLeft: -285,
    marginTop: 3,
  },
  connectShop1ColumnRow: {
    height: 41,
    flexDirection: "row",
    marginTop: 24,
    marginLeft: 1,
    marginRight: 29,
  },
  priceAndBtnContainer: {
    width: 336,
    height: 131,
  },
  group18: {
    width: 336,
    height: 38,
    flexDirection: "row",
  },
  planPrice1: {
    fontWeight: "600",
    color: "rgba(74,74,74,1)",
    fontSize: 23,
  },
  wooCommerce1: {
    fontWeight: "600",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
    opacity: 0.44,
    marginLeft: 16,
  },
  planPrice1Row: {
    height: 38,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  group17: {
    width: 288,
    height: 60,
    marginTop: 33,
    marginLeft: 24,
  },
  rect34: {
    width: 288,
    height: 60,
    backgroundColor: "rgba(155,155,155,0.68)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  checkOut1: {
    fontWeight: "600",
    color: "rgba(0,0,0,1)",
    fontSize: 26,
    opacity: 0.26,
  },
});
