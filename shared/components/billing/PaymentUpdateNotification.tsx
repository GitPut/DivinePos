import React from "react";
import { auth } from "services/firebase/config";
import firebase from "firebase/compat/app";
import Logo from "assets/dpos-logo-black.png";
import { SlLogout } from "react-icons/sl";
import { logout, createCheckoutSession } from "services/firebase/functions";
import { useAlert } from "react-alert";

interface PaymentUpdateNotificationProps {
  isCanceled: boolean;
}

const PaymentUpdateNotification = ({
  isCanceled,
}: PaymentUpdateNotificationProps) => {
  const alertP = useAlert();

  const sendToCheckout = async () => {
    if (!auth.currentUser) return;
    await createCheckoutSession(
      "price_1T8TIlCIw3L7DOwIDUpngIcI",
      window.location.origin,
      window.location.origin,
      (msg) => alertP.error(msg || "An error occurred")
    );
  };

  const Manage = () => {
    firebase
      .functions()
      .httpsCallable("ext-firestore-stripe-payments-createPortalLink")({
        returnUrl: `${window.location.origin}`,
        locale: "auto",
      })
      .then((response) => {
        window.location = response.data.url;
      })
      .catch(() => {
        alertP.error("Unknown error has occured");
      });
  };

  if (isCanceled) {
    return (
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
            <button
              style={{
                height: 50,
                width: 50,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                backgroundColor: "#F5F5F5",
                marginRight: 20,
                border: "none",
                cursor: "pointer",
              }}
              onClick={logout}
            >
              <SlLogout size={32} color="black" />
            </button>
            <img
              src={Logo}
              alt=""
              style={styles.logo}
              key={"logo"}
            />
          </div>
          <div style={styles.attentionWrapper}>
            <span style={styles.attentionNeeded}>ATTENTION NEEDED</span>
          </div>
        </div>
        <span style={styles.txt1}>We&apos;re sad to see you go :(</span>
        <span style={styles.txt2}>
          Please let us make this right! If theres a feature that missing or
          something you dont like about the software, we can change that.
        </span>
        <span style={styles.txt3}>
          Resubscribe to have access of your store again starting at $49/month.
        </span>
        <button
          style={{ ...styles.updateBtn, width: 450 }}
          onClick={sendToCheckout}
        >
          <span style={styles.updateBilling}>Resubscribe for $49/month</span>
        </button>
        <span style={styles.txt4}>
          Please call (226) 600-5925 or email us at Support@DivinePos.com so
          that we can solve the problem you had
        </span>
      </div>
    );
  } else {
    return (
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <img
            src={Logo}
            alt=""
            style={styles.logo}
            key={"logo"}
          />
          <div style={styles.attentionWrapper}>
            <span style={styles.attentionNeeded}>ATTENTION NEEDED</span>
          </div>
        </div>
        <span style={styles.txt1}>
          Unfortunualy there was issue with your payment
        </span>
        <span style={styles.txt2}>
          This can occur for multiple reasons; if your billing details dont
          match the card attached. Have a look with your credit/debit provider
        </span>
        <span style={styles.txt3}>
          We dont your store to have any down time so please have a look at
          updating the details.
        </span>
        <button style={styles.updateBtn} onClick={Manage}>
          <span style={styles.updateBilling}>UPDATE BILLING</span>
        </button>
        <span style={styles.txt4}>
          If. you have any questions or need help please call (226) 600-5925 or
          email us at Support@DivinePos.com
        </span>
      </div>
    );
  }
};

export default PaymentUpdateNotification;

const styles: Record<string, React.CSSProperties> = {
  container: {
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    paddingBottom: 50,
  },
  headerContainer: {
    width: "90%",
    height: 90,
    borderBottom: "1px solid rgba(170,164,164,1)",
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 25,
  },
  logo: {
    width: 220,
    height: 85,
    objectFit: "contain",
  },
  attentionWrapper: {
    width: 248,
    height: 64,
    backgroundColor: "#ffed95",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  attentionNeeded: {
    fontWeight: "700",
    color: "#c2a61f",
    fontSize: 22,
  },
  txt1: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 25,
    width: 792,
    height: 29,
    display: "block",
  },
  txt2: {
    color: "#121212",
    fontSize: 22,
    width: 792,
    height: 73,
    display: "block",
  },
  updateBtn: {
    width: 326,
    height: 90,
    backgroundColor: "#7c2bfe",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  updateBilling: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 25,
  },
  txt3: {
    color: "#121212",
    fontSize: 22,
    width: 792,
    height: 73,
    display: "block",
  },
  txt4: {
    color: "#121212",
    fontSize: 22,
    width: 792,
    height: 73,
    display: "block",
  },
};
