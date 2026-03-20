import React, { useState } from "react";
import {
  activePlanState,
  onlineStoreState,
  setOnlineStoreState,
  storeDetailsState,
  storeProductsState,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import { createCheckoutSession } from "services/firebase/functions";
import Switch from "shared/components/ui/Switch";
import { useAlert } from "react-alert";
import { FiGlobe, FiLock, FiShoppingBag, FiCheck } from "react-icons/fi";
import { useHistory } from "react-router-dom";

function OnlineStoreSettings() {
  const activePlan = activePlanState.use();
  const onlineStoreDetails = onlineStoreState.use();
  const storeDetails = storeDetailsState.use();
  const catalog = storeProductsState.use();
  const [urlEnding, seturlEnding] = useState(onlineStoreDetails.urlEnding);
  const [stripePublicKey, setstripePublicKey] = useState(
    onlineStoreDetails.stripePublicKey,
  );
  const [stripeSecretKey, setstripeSecretKey] = useState(
    onlineStoreDetails.stripeSecretKey,
  );
  const [onlineStoreActive, setonlineStoreActive] = useState(
    onlineStoreDetails.onlineStoreActive,
  );
  const [loading, setloading] = useState(false);
  const alertP = useAlert();
  const history = useHistory();

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
        "This url ending is already taken. Please choose another one.",
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
      alertP.success("Online store set up successfully!");
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
    setloading(true);
    await createCheckoutSession(
      "price_1OdwZqCIw3L7DOwIj1Fu96SW",
      window.location.href,
      window.location.href,
      (msg) => alertP.error(msg || "An error occurred"),
    );
    setloading(false);
  };

  // Not on Professional plan — show upgrade prompt
  if (activePlan !== "professional") {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <span style={styles.title}>Online Store Settings</span>
            <span style={styles.subtitle}>
              Set up and manage your online ordering store
            </span>
          </div>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.upgradeCard}>
            <div style={styles.upgradeIconWrap}>
              <FiShoppingBag size={32} color="#1D294E" />
            </div>
            <span style={styles.upgradeTitle}>
              Online Store is a Professional Feature
            </span>
            <span style={styles.upgradeText}>
              Upgrade to the Professional plan to set up your online store, accept
              online orders, and process payments through Stripe.
            </span>
            <button
              style={styles.upgradeBtn}
              onClick={() =>
                history.push("/authed/settings/billingsettings")
              }
            >
              Upgrade to Professional
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Professional plan but hasn't paid for online store add-on
  if (onlineStoreDetails.paidStatus !== "active") {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <span style={styles.title}>Online Store Settings</span>
            <span style={styles.subtitle}>
              Set up and manage your online ordering store
            </span>
          </div>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <FiShoppingBag size={24} color="#1D294E" />
              <span style={styles.pricingTitle}>Online Store</span>
            </div>
            <span style={styles.pricingDescription}>
              Take your business to the next level with an online ordering store
            </span>
            <div style={styles.priceRow}>
              <span style={styles.priceAmount}>$40</span>
              <span style={styles.priceUnit}>/month</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.benefitsList}>
              {[
                "Manage straight from POS",
                "24/7 Support",
                "Simple and powerful",
              ].map((benefit) => (
                <div key={benefit} style={styles.benefitRow}>
                  <FiCheck size={16} color="#10b981" />
                  <span style={styles.benefitText}>{benefit}</span>
                </div>
              ))}
            </div>
            <button
              style={{
                ...styles.getStartedBtn,
                opacity: loading ? 0.5 : 1,
              }}
              onClick={payOnlineStore}
              disabled={loading}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active online store — show settings
  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Online Store Settings</span>
          <span style={styles.subtitle}>
            {onlineStoreDetails.onlineStoreSetUp
              ? "Manage your online store configuration"
              : "Set up your online ordering store"}
          </span>
        </div>
        <button
          style={styles.saveBtn}
          onClick={
            onlineStoreDetails.onlineStoreSetUp
              ? UpdateStoreDetails
              : startOnlineStore
          }
        >
          {onlineStoreDetails.onlineStoreSetUp ? "Save Changes" : "Confirm Setup"}
        </button>
      </div>

      <div style={styles.scrollArea}>
        {/* Store URL Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FiGlobe size={18} color="#1D294E" />
            <span style={styles.cardTitle}>Store URL</span>
          </div>
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>URL Ending</span>
            {onlineStoreDetails.onlineStoreSetUp ? (
              <div style={styles.lockedUrlRow}>
                <FiLock size={14} color="#94a3b8" />
                <span style={styles.lockedUrlText}>
                  {onlineStoreDetails.urlEnding}
                </span>
              </div>
            ) : (
              <div style={styles.urlInputRow}>
                <span style={styles.urlPrefix}>divinepos.com/order/</span>
                <input
                  style={styles.urlInput}
                  placeholder="yourstorename"
                  value={
                    onlineStoreDetails.urlEnding
                      ? onlineStoreDetails.urlEnding
                      : urlEnding
                  }
                  onChange={(e) => {
                    if (!onlineStoreDetails.onlineStoreSetUp) {
                      seturlEnding(
                        e.target.value
                          .replace(/[^a-zA-Z-]/g, "")
                          .toLowerCase(),
                      );
                    }
                  }}
                />
              </div>
            )}
            <span style={styles.fieldHint}>
              {onlineStoreDetails.onlineStoreSetUp
                ? "Your store URL has been set and cannot be changed"
                : "Once confirmed, your URL cannot be changed"}
            </span>
          </div>
        </div>

        {/* Stripe Keys Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FiLock size={18} color="#1D294E" />
            <span style={styles.cardTitle}>Stripe Payment Keys</span>
          </div>
          <div style={styles.fieldGrid}>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Stripe Public Key</span>
              <input
                style={styles.input}
                placeholder="Enter public key"
                value={
                  onlineStoreDetails.stripePublicKey
                    ? onlineStoreDetails.stripePublicKey
                    : stripePublicKey ?? ""
                }
                onChange={(e) => setstripePublicKey(e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Stripe Secret Key</span>
              <input
                style={styles.input}
                placeholder="Enter secret key"
                value={
                  onlineStoreDetails.stripeSecretKey
                    ? onlineStoreDetails.stripeSecretKey
                    : stripeSecretKey ?? ""
                }
                onChange={(e) => setstripeSecretKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Store Status Card */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Store Status</span>
          <div style={styles.switchRow}>
            <div>
              <span style={styles.switchLabel}>Online Store Active</span>
              <span style={styles.switchDescription}>
                When enabled, customers can place orders through your online store
              </span>
            </div>
            <Switch
              isActive={onlineStoreActive}
              toggleSwitch={() => setonlineStoreActive((prev) => !prev)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: 30,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexShrink: 0,
  },
  title: {
    fontWeight: "700",
    fontSize: 24,
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  saveBtn: {
    padding: "10px 24px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    flexShrink: 0,
  },
  cardHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  fieldGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 calc(50% - 8px)",
    minWidth: 240,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  fieldHint: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  input: {
    height: 42,
    padding: "0 12px",
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
  },
  urlInputRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  urlPrefix: {
    fontSize: 13,
    color: "#94a3b8",
    padding: "0 12px",
    backgroundColor: "#f8fafc",
    height: 42,
    display: "flex",
    alignItems: "center",
    borderRight: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    flexDirection: "row",
  },
  urlInput: {
    flex: 1,
    height: 42,
    padding: "0 12px",
    fontSize: 14,
    color: "#0f172a",
    border: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  lockedUrlRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    padding: "0 12px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  lockedUrlText: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "monospace",
  },
  switchRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
  },
  switchDescription: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    display: "block",
  },
  // Upgrade prompt (non-Professional)
  upgradeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    maxWidth: 480,
  },
  upgradeIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  upgradeText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.6",
    maxWidth: 360,
  },
  upgradeBtn: {
    padding: "12px 28px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 8,
  },
  // Pricing card (pay for online store)
  pricingCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    maxWidth: 400,
  },
  pricingHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  pricingDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: "1.5",
  },
  priceRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0f172a",
  },
  priceUnit: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  benefitsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  benefitRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: "#334155",
  },
  getStartedBtn: {
    padding: "12px 28px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    alignSelf: "flex-start",
    marginTop: 8,
  },
};

export default OnlineStoreSettings;
