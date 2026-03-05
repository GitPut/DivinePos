import React from "react";
import { FaPhone } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import CheckOutDetails from "../components/CheckOutDetails";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import dposLogoWhite from "assets/images/dpos-logo-white.png";
import dashImg from "assets/images/image_ridw..png";
import facebookIcon from "assets/images/image_pDaA..png";
import instagramIcon from "assets/images/image_CLpi..png";

function OnlineOrderHomeCheckout() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();

  if (!storeDetails.stripePublicKey) return null;

  return (
    <div style={styles.container}>
      <div style={styles.backgroundContainer}>
        <div style={styles.plantImgContainer}>
          <div style={styles.wingImgContainer}>
            <div style={styles.pizzaImgContainer}>
              <div style={styles.frontContainer}>
                <div style={styles.logoGroup}>
                  {storeDetails?.hasLogo ? (
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => {
                        if (page === 5) {
                          setOrderDetailsState({
                            page: 4,
                          });
                        } else {
                          setOrderDetailsState({
                            ...orderDetails,
                            delivery: false,
                            address: null,
                            page: 1,
                          });
                        }
                      }}
                    >
                      <img
                        src={dposLogoWhite}
                        style={styles.logo}
                        alt=""
                      />
                    </button>
                  ) : (
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => {
                        if (page === 5) {
                          setOrderDetailsState({
                            page: 4,
                          });
                        } else {
                          setOrderDetailsState({
                            ...orderDetails,
                            delivery: false,
                            address: null,
                            page: 1,
                          });
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: screenWidth < 1000 ? 30 : 35,
                          fontWeight: "700",
                          color: "white",
                        }}
                      >
                        {storeDetails.name}
                      </span>
                    </button>
                  )}
                  <img
                    src={dashImg}
                    style={styles.dash}
                    alt=""
                  />
                </div>
                {screenWidth > 1000 ? (
                  <Elements stripe={loadStripe(storeDetails.stripePublicKey)}>
                    <CheckOutDetails />
                  </Elements>
                ) : (
                  <div
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Elements stripe={loadStripe(storeDetails.stripePublicKey)}>
                      <CheckOutDetails />
                    </Elements>
                  </div>
                )}
                <div style={styles.bottomRowGroup}>
                  <div style={styles.detailsLocationGroup}>
                    <div style={styles.phoneNumberRow}>
                      <FaPhone
                        style={{
                          ...styles.phoneNumberIcon,
                          ...(screenWidth < 1000 ? { fontSize: 35 } : {}),
                        }}
                      />
                      <span style={styles.phoneNumberTxt}>
                        {storeDetails.phoneNumber}
                      </span>
                    </div>
                    <div style={styles.addressRow}>
                      <IoLocationSharp
                        style={{
                          ...styles.addressIcon,
                          ...(screenWidth < 1000 ? { fontSize: 35 } : {}),
                        }}
                      />
                      <span style={styles.addressTxt}>
                        {
                          storeDetails.address?.value?.structured_formatting?.main_text
                        }
                        {"\n"}
                        {
                          storeDetails.address?.value?.structured_formatting?.secondary_text
                        }
                      </span>
                    </div>
                  </div>
                  {storeDetails.hasSocial && (
                    <div style={styles.socialIconsGroup}>
                      <img
                        src={facebookIcon}
                        style={styles.facebookIcon}
                        alt=""
                      />
                      <img
                        src={instagramIcon}
                        style={styles.instagramIcon}
                        alt=""
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    width: "100%",
  },
  backgroundContainer: {
    height: "100%",
    width: "100%",
  },
  plantImgContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-end",
    height: "100%",
    width: "100%",
    display: "flex",
  },
  plantImg: {
    height: 520,
    width: 200,
  },
  wingImgContainer: {
    top: 0,
    left: 0,
    position: "absolute",
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    display: "flex",
  },
  wingImg: {
    height: 200,
    width: "50%",
  },
  pizzaImgContainer: {
    top: 0,
    left: 0,
    position: "absolute",
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    display: "flex",
  },
  pizzaImg: {
    height: 1000,
    width: 401,
  },
  frontContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  logoGroup: {
    justifyContent: "space-between",
    alignSelf: "stretch",
    padding: 10,
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    width: 237,
    height: 78,
    objectFit: "contain",
  },
  dash: {
    height: 35,
    width: "50%",
    objectFit: "contain",
  },
  btnContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 60,
    width: 683,
    display: "flex",
  },
  pickupBtn: {
    width: 219,
    height: 60,
    backgroundColor: "rgba(238,125,67,1)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  pickupBtnTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  deliveryBtn: {
    width: 219,
    height: 60,
    backgroundColor: "rgba(238,125,67,1)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  deliveryBtnTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 18,
  },
  bottomRowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    alignSelf: "stretch",
    display: "flex",
  },
  detailsLocationGroup: {
    justifyContent: "center",
    margin: 10,
    display: "flex",
    flexDirection: "column",
  },
  phoneNumberRow: {
    width: 231,
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  phoneNumberIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 50,
  },
  phoneNumberTxt: {
    color: "rgba(255,255,255,1)",
    fontSize: 25,
  },
  addressRow: {
    width: 231,
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
  },
  addressIcon: {
    color: "rgba(255,255,255,1)",
    fontSize: 50,
  },
  addressTxt: {
    color: "rgba(255,255,255,1)",
    fontSize: 23,
    whiteSpace: "pre-line",
  },
  socialIconsGroup: {
    width: 190,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
    display: "flex",
  },
  facebookIcon: {
    height: 57,
    width: 72,
    objectFit: "contain",
  },
  instagramIcon: {
    height: 57,
    width: 72,
    objectFit: "contain",
  },
};

export default OnlineOrderHomeCheckout;
