import React, { useState } from "react";
import {
  onlineStoreState,
  setOnlineStoreState,
  storeDetailsState,
  storeProductsState,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import { createCheckoutSession } from "services/firebase/functions";
import Switch from "shared/components/ui/Switch";
import PayForOnlineStore from "./components/PayForOnlineStore";
import { useAlert } from "react-alert";
import loadingGif from "assets/loading.gif";

function OnlineStoreSettings() {
  const onlineStoreDetails = onlineStoreState.use();
  const storeDetails = storeDetailsState.use();
  const catalog = storeProductsState.use();
  const [urlEnding, seturlEnding] = useState(onlineStoreDetails.urlEnding);
  const [stripePublicKey, setstripePublicKey] = useState(
    onlineStoreDetails.stripePublicKey
  );
  const [stripeSecretKey, setstripeSecretKey] = useState(
    onlineStoreDetails.stripeSecretKey
  );
  const [onlineStoreActive, setonlineStoreActive] = useState(
    onlineStoreDetails.onlineStoreActive
  );
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [viewVisible, setviewVisible] = useState(false);
  const alertP = useAlert();

  const fadeIn = () => {
    setFadeOpacity(1);
  };

  const resetLoader = () => {
    setviewVisible(true);
    fadeIn();
  };

  const startOnlineStore = async () => {
    if (!urlEnding) {
      alertP.error("Please enter a url ending");
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const querySnapshot = await db
      .collection("public")
      .where("urlEnding", "==", urlEnding)
      .get();

    if (!querySnapshot.empty) {
      alertP.error(
        "This url ending is already taken. Please choose another one."
      );
      return;
    }

    try {
      await db.collection("public").doc(uid).set({
        storeDetails: storeDetails,
        categories: catalog.categories,
        urlEnding: urlEnding,
        stripePublicKey:
          stripePublicKey?.length ?? 0 > 0 ? stripePublicKey : null,
      });

      const batch = db.batch();
      catalog.products.forEach((product) => {
        const ref = db
          .collection("public")
          .doc(uid)
          .collection("products")
          .doc(product.id);
        batch.set(ref, product);
      });
      batch.update(db.collection("users").doc(uid), {
        onlineStoreActive: onlineStoreActive,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        stripePublicKey:
          stripePublicKey?.length ?? 0 > 0 ? stripePublicKey : null,
        stripeSecretKey:
          stripeSecretKey?.length ?? 0 > 0 ? stripeSecretKey : null,
      });
      await batch.commit();

      setOnlineStoreState({
        ...onlineStoreDetails,
        onlineStoreActive: onlineStoreActive,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        stripePublicKey:
          stripePublicKey?.length ?? 0 > 0 ? stripePublicKey : null,
        stripeSecretKey:
          stripeSecretKey?.length ?? 0 > 0 ? stripeSecretKey : null,
      });
    } catch {
      alertP.error("An error occurred while setting up the online store.");
    }
  };

  const UpdateStoreDetails = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const batch = db.batch();

      catalog.products.forEach((product) => {
        const ref = db
          .collection("public")
          .doc(uid)
          .collection("products")
          .doc(product.id);
        batch.set(ref, product);
      });

      batch.update(db.collection("users").doc(uid), {
        onlineStoreActive: onlineStoreActive,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        stripePublicKey: stripePublicKey,
        stripeSecretKey: stripeSecretKey,
      });

      batch.update(db.collection("public").doc(uid), {
        onlineStoreActive: onlineStoreActive,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        storeDetails: storeDetails,
        categories: catalog.categories,
        stripePublicKey: stripePublicKey,
      });

      await batch.commit();

      setOnlineStoreState({
        ...onlineStoreDetails,
        onlineStoreActive: onlineStoreActive,
        stripePublicKey: stripePublicKey,
        stripeSecretKey: stripeSecretKey,
      });

      alertP.success("Online store details updated successfully");
    } catch {
      alertP.error("An error occurred while updating store details.");
    }
  };

  const payOnlineStore = async () => {
    resetLoader();
    await createCheckoutSession(
      "price_1OdwZqCIw3L7DOwIj1Fu96SW",
      window.location.href,
      window.location.href,
      (msg) => alertP.error(msg || "An error occurred")
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <span style={styles.onlineStoreSettingsHeader}>
          Online Store Settings
        </span>
      </div>
      <div style={styles.onlineStoreInnerContainer}>
        {onlineStoreDetails.paidStatus === "active" ? (
          <div style={styles.innerGroup}>
            <div style={styles.inputsGroup}>
              <div style={styles.urlEndingInputGroup}>
                <span style={styles.onlineUrlEndingTxt}>Online URL Ending</span>
                {onlineStoreDetails.onlineStoreSetUp ? (
                  <button
                    style={{ ...styles.uRLBox, justifyContent: "center", display: "flex", alignItems: "center", cursor: "default" }}
                  >
                    <span>{onlineStoreDetails.urlEnding}</span>
                  </button>
                ) : (
                  <input
                    style={styles.uRLBox}
                    placeholder="yourstorename"
                    value={
                      onlineStoreDetails.urlEnding
                        ? onlineStoreDetails.urlEnding
                        : urlEnding
                    }
                    onChange={(e) => {
                      if (!onlineStoreDetails.onlineStoreSetUp) {
                        seturlEnding(
                          e.target.value.replace(/[^a-zA-Z-]/g, "").toLowerCase()
                        );
                      }
                    }}
                  />
                )}
              </div>
              <div style={styles.stripePublicKeyInputGroup}>
                <span style={styles.stripePublicKeyTxt}>Stripe Public Key</span>
                <input
                  style={styles.stripeKeyBox}
                  placeholder="Enter Public Key"
                  value={
                    onlineStoreDetails.stripePublicKey
                      ? onlineStoreDetails.stripePublicKey
                      : stripePublicKey ?? ""
                  }
                  onChange={(e) => {
                    setstripePublicKey(e.target.value);
                  }}
                />
              </div>
              <div style={styles.stripePrivateKeyInputGroup}>
                <span style={styles.stripePrivateKeyTxt}>
                  Stripe Private Key
                </span>
                <input
                  style={styles.stripePrivateKeyBox}
                  placeholder="Enter Private Key"
                  value={
                    onlineStoreDetails.stripeSecretKey
                      ? onlineStoreDetails.stripeSecretKey
                      : stripeSecretKey ?? ""
                  }
                  onChange={(e) => {
                    setstripeSecretKey(e.target.value);
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <span style={{ fontWeight: "700", marginRight: 10 }}>
                  Online Store Active Status:
                </span>
                <Switch
                  isActive={onlineStoreActive}
                  toggleSwitch={() => setonlineStoreActive((prev) => !prev)}
                />
              </div>
            </div>
            <div style={styles.bottomBtnGroup}>
              <span style={styles.readInfo}>
                {onlineStoreDetails.onlineStoreSetUp
                  ? "*Your Store Url Has Already Been Set"
                  : "*Once Confirmed Your Url CAN NOT BE CHANGED"}
              </span>
              {onlineStoreDetails.onlineStoreSetUp ? (
                <button
                  style={styles.confirmBtn}
                  onClick={UpdateStoreDetails}
                >
                  <span style={styles.confirmTxtBtn}>Update</span>
                </button>
              ) : (
                <button style={styles.confirmBtn} onClick={startOnlineStore}>
                  <span style={styles.confirmTxtBtn}>Confirm</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <PayForOnlineStore payOnlineStore={payOnlineStore} />
        )}
      </div>
      {viewVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              position: "absolute",
              opacity: fadeOpacity,
              height: "100%",
              width: "100%",
              transition: "opacity 500ms",
            }}
          >
            <img
              src={loadingGif}
              alt="Loading"
              style={{ width: 450, height: 450, objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: 691,
    height: 562,
  },
  headerContainer: {
    height: 19,
    alignSelf: "stretch",
  },
  onlineStoreSettingsHeader: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  onlineStoreInnerContainer: {
    display: "flex",
    width: 499,
    height: 485,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bfc1cb",
    boxShadow: "3px 3px 10px rgba(182, 184, 194, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerGroup: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 419,
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputsGroup: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 300,
    justifyContent: "space-between",
  },
  urlEndingInputGroup: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 86,
    justifyContent: "space-between",
  },
  onlineUrlEndingTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  uRLBox: {
    width: 358,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#9b9b9b",
    padding: 10,
    boxSizing: "border-box",
  },
  stripePublicKeyInputGroup: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 87,
    justifyContent: "space-between",
  },
  stripePublicKeyTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  stripeKeyBox: {
    width: 358,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#9b9b9b",
    padding: 10,
    boxSizing: "border-box",
  },
  stripePrivateKeyInputGroup: {
    display: "flex",
    flexDirection: "column",
    width: 358,
    height: 86,
    justifyContent: "space-between",
  },
  stripePrivateKeyTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 17,
  },
  stripePrivateKeyBox: {
    width: 358,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#9b9b9b",
    padding: 10,
    boxSizing: "border-box",
  },
  bottomBtnGroup: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: 69,
    justifyContent: "center",
    alignItems: "center",
  },
  readInfo: {
    color: "rgba(0,0,0,1)",
    fontSize: 12,
  },
  confirmBtn: {
    width: 173,
    height: 46,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    border: "none",
    cursor: "pointer",
  },
  confirmTxtBtn: {
    fontWeight: "700",
    color: "rgba(255,245,245,1)",
    fontSize: 14,
  },
};

export default OnlineStoreSettings;
