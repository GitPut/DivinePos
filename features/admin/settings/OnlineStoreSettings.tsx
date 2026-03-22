import React, { useRef, useState } from "react";
import {
  activePlanState,
  onlineStoreState,
  setOnlineStoreState,
  storeDetailsState,
  setStoreDetailsState,
  storeProductsState,
} from "store/appState";
import { auth, db, storage } from "services/firebase/config";
import { createCheckoutSession, updateStoreDetails } from "services/firebase/functions";
import Switch from "shared/components/ui/Switch";
import { useAlert } from "react-alert";
import { FiGlobe, FiLock, FiShoppingBag, FiCheck, FiUpload, FiX, FiDroplet, FiType } from "react-icons/fi";
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
    onlineStoreDetails.onlineStoreActive ?? false,
  );
  const [loading, setloading] = useState(false);
  const [brandColor, setBrandColor] = useState(onlineStoreDetails.brandColor || "#0d0d0d");
  const [tagline, setTagline] = useState(onlineStoreDetails.tagline || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(storeDetails.logoUrl || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const alertP = useAlert();
  const history = useHistory();

  const PRESET_COLORS = [
    { label: "Black", value: "#0d0d0d" },
    { label: "Navy", value: "#1D294E" },
    { label: "Dark Red", value: "#7f1d1d" },
    { label: "Forest", value: "#14532d" },
    { label: "Charcoal", value: "#1e293b" },
    { label: "Wine", value: "#4a0e2e" },
    { label: "Midnight", value: "#0f172a" },
    { label: "Espresso", value: "#3b1f0b" },
  ];

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alertP.error("Logo must be under 2MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const uploadLogo = async (): Promise<{ hasLogo: boolean; logoUrl: string | undefined }> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { hasLogo: false, logoUrl: undefined };

    if (logoFile) {
      const ref = storage.ref(uid + "/logo/store-logo");
      await ref.put(logoFile);
      const url = await ref.getDownloadURL();
      return { hasLogo: true, logoUrl: url };
    }

    if (!logoPreview && storeDetails.hasLogo) {
      try { await storage.ref(uid + "/logo/store-logo").delete(); } catch {}
      return { hasLogo: false, logoUrl: undefined };
    }

    return { hasLogo: storeDetails.hasLogo || false, logoUrl: storeDetails.logoUrl || undefined };
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

    // Allow if the only match is the current user's own doc (partial setup retry)
    const isTakenByOther = querySnapshot.docs.some((doc) => doc.id !== uid);
    if (!querySnapshot.empty && isTakenByOther) {
      alertP.error(
        "This url ending is already taken. Please choose another one.",
      );
      return;
    }

    try {
      setUploadingLogo(true);
      const logo = await uploadLogo();

      const updatedStoreDetails = {
        ...storeDetails,
        hasLogo: logo.hasLogo,
        logoUrl: logo.logoUrl ?? "",
      };

      // Clean storeDetails for public doc — strip sensitive/internal fields
      const publicStoreDetails = JSON.parse(JSON.stringify({
        name: updatedStoreDetails.name ?? "",
        phoneNumber: updatedStoreDetails.phoneNumber ?? "",
        website: updatedStoreDetails.website ?? "",
        address: updatedStoreDetails.address ?? null,
        deliveryPrice: updatedStoreDetails.deliveryPrice ?? "",
        taxRate: updatedStoreDetails.taxRate ?? "13",
        hasLogo: updatedStoreDetails.hasLogo ?? false,
        logoUrl: updatedStoreDetails.logoUrl ?? "",
        acceptDelivery: updatedStoreDetails.acceptDelivery ?? false,
        deliveryRange: updatedStoreDetails.deliveryRange ?? "",
      }));

      const stripePublicKeyVal = (stripePublicKey ?? "").length > 0 ? stripePublicKey : "";
      const stripeSecretKeyVal = (stripeSecretKey ?? "").length > 0 ? stripeSecretKey : null;

      await db.collection("public").doc(uid).set({
        storeDetails: publicStoreDetails,
        categories: catalog.categories,
        urlEnding: urlEnding,
        stripePublicKey: stripePublicKeyVal ?? "",
        brandColor: brandColor || "",
        tagline: tagline || "",
      }, { merge: true });

      const batch = db.batch();
      catalog.products.forEach((product) => {
        const ref = db
          .collection("public")
          .doc(uid)
          .collection("products")
          .doc(product.id);
        // Clean product to remove undefined values that Firestore rejects
        batch.set(ref, JSON.parse(JSON.stringify(product)));
      });
      batch.update(db.collection("users").doc(uid), {
        onlineStoreActive: onlineStoreActive ?? false,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        stripePublicKey: stripePublicKeyVal,
        stripeSecretKey: stripeSecretKeyVal,
        brandColor: brandColor,
        tagline: tagline,
        "storeDetails.hasLogo": logo.hasLogo,
        "storeDetails.logoUrl": logo.logoUrl ?? "",
      });
      await batch.commit();

      setStoreDetailsState(updatedStoreDetails);
      setOnlineStoreState({
        ...onlineStoreDetails,
        onlineStoreActive: onlineStoreActive ?? false,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        stripePublicKey: stripePublicKeyVal,
        stripeSecretKey: stripeSecretKeyVal,
        brandColor: brandColor,
        tagline: tagline,
      });
      setLogoFile(null);
      setUploadingLogo(false);
      alertP.success("Online store set up successfully!");
    } catch (err) {
      console.error("startOnlineStore error:", err);
      setUploadingLogo(false);
      alertP.error("An error occurred while setting up the online store.");
    }
  };

  const UpdateStoreDetails = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setUploadingLogo(true);
      const logo = await uploadLogo();

      const updatedStoreDetails = {
        ...storeDetails,
        hasLogo: logo.hasLogo,
        logoUrl: logo.logoUrl ?? "",
      };
      // Clean storeDetails for public doc — strip sensitive/internal fields
      const cleanStoreDetails = JSON.parse(JSON.stringify({
        name: updatedStoreDetails.name ?? "",
        phoneNumber: updatedStoreDetails.phoneNumber ?? "",
        website: updatedStoreDetails.website ?? "",
        address: updatedStoreDetails.address ?? null,
        deliveryPrice: updatedStoreDetails.deliveryPrice ?? "",
        taxRate: updatedStoreDetails.taxRate ?? "13",
        hasLogo: updatedStoreDetails.hasLogo ?? false,
        logoUrl: updatedStoreDetails.logoUrl ?? "",
        acceptDelivery: updatedStoreDetails.acceptDelivery ?? false,
        deliveryRange: updatedStoreDetails.deliveryRange ?? "",
      }));

      const batch = db.batch();

      catalog.products.forEach((product) => {
        const ref = db
          .collection("public")
          .doc(uid)
          .collection("products")
          .doc(product.id);
        batch.set(ref, JSON.parse(JSON.stringify(product)));
      });

      batch.update(db.collection("users").doc(uid), {
        onlineStoreActive: onlineStoreActive ?? false,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        stripePublicKey: stripePublicKey,
        stripeSecretKey: stripeSecretKey,
        brandColor: brandColor,
        tagline: tagline,
        "storeDetails.hasLogo": logo.hasLogo,
        "storeDetails.logoUrl": logo.logoUrl ?? "",
      });

      batch.update(db.collection("public").doc(uid), {
        onlineStoreActive: onlineStoreActive ?? false,
        onlineStoreSetUp: true,
        urlEnding: urlEnding,
        storeDetails: cleanStoreDetails,
        categories: catalog.categories,
        stripePublicKey: stripePublicKey || "",
        brandColor: brandColor || "",
        tagline: tagline || "",
      });

      await batch.commit();

      setStoreDetailsState(updatedStoreDetails);
      setOnlineStoreState({
        ...onlineStoreDetails,
        onlineStoreActive: onlineStoreActive ?? false,
        stripePublicKey: stripePublicKey,
        stripeSecretKey: stripeSecretKey,
        brandColor: brandColor,
        tagline: tagline,
      });
      setLogoFile(null);
      setUploadingLogo(false);
      alertP.success("Online store details updated successfully");
    } catch (err) {
      console.error("UpdateStoreDetails error:", err);
      setUploadingLogo(false);
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

        {/* Appearance Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FiDroplet size={18} color="#1D294E" />
            <span style={styles.cardTitle}>Store Appearance</span>
          </div>

          {/* Logo Upload */}
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Store Logo</span>
            <span style={styles.fieldHint}>
              Displayed on your storefront. Recommended: PNG with transparent background, under 2MB.
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={logoInputRef}
              onChange={handleLogoSelect}
              style={{ display: "none" }}
            />
            {logoPreview ? (
              <div style={styles.logoPreviewRow}>
                <div style={styles.logoPreviewBox}>
                  <img src={logoPreview} style={styles.logoPreviewImg} alt="Logo" />
                </div>
                <div style={styles.logoActions}>
                  <button
                    style={styles.logoChangeBtn}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Change Logo
                  </button>
                  <button
                    style={styles.logoRemoveBtn}
                    onClick={handleRemoveLogo}
                  >
                    <FiX size={14} color="#ef4444" />
                    <span style={{ color: "#ef4444", fontSize: 13, fontWeight: "500" }}>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={styles.logoUploadBtn}
                onClick={() => logoInputRef.current?.click()}
              >
                <FiUpload size={18} color="#94a3b8" />
                <span style={styles.logoUploadTxt}>Click to upload logo</span>
                <span style={styles.logoUploadHint}>PNG, JPG up to 2MB</span>
              </button>
            )}
          </div>

          {/* Brand Color */}
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Background Color</span>
            <span style={styles.fieldHint}>
              The main background color of your storefront landing page
            </span>
            <div style={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: c.value,
                    ...(brandColor === c.value
                      ? { outline: "2px solid #1D294E", outlineOffset: 2 }
                      : {}),
                  }}
                  onClick={() => setBrandColor(c.value)}
                  title={c.label}
                />
              ))}
              <div style={styles.customColorRow}>
                <span style={styles.customColorLabel}>Custom:</span>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  style={styles.colorPicker}
                />
                <input
                  style={styles.colorHexInput}
                  value={brandColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setBrandColor(val);
                  }}
                  placeholder="#0d0d0d"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={styles.fieldGroup}>
            <div style={styles.cardHeader}>
              <FiType size={16} color="#1D294E" />
              <span style={styles.fieldLabel}>Tagline</span>
            </div>
            <span style={styles.fieldHint}>
              A short message shown below your store name on the landing page
            </span>
            <input
              style={styles.input}
              placeholder="e.g. Fresh, hot, and made to order"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={80}
            />
          </div>

          {/* Live Preview */}
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Preview</span>
            <div style={{ ...styles.previewBox, backgroundColor: brandColor }}>
              {logoPreview ? (
                <img src={logoPreview} style={styles.previewLogo} alt="" />
              ) : (
                <div style={styles.previewLogoFallback}>
                  <span style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
                    {(storeDetails.name || "S").charAt(0)}
                  </span>
                </div>
              )}
              <span style={styles.previewName}>{storeDetails.name}</span>
              <span style={styles.previewTagline}>
                {tagline || "Your tagline will appear here"}
              </span>
            </div>
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
  // Logo upload
  logoPreviewRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  logoPreviewBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#0d0d0d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  logoPreviewImg: {
    maxWidth: 72,
    maxHeight: 72,
    objectFit: "contain" as const,
  },
  logoActions: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  logoChangeBtn: {
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: "500",
    color: "#1D294E",
    backgroundColor: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  logoRemoveBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  logoUploadBtn: {
    width: "100%",
    height: 100,
    border: "2px dashed #e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fafbfc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    cursor: "pointer",
    marginTop: 4,
  },
  logoUploadTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  logoUploadHint: {
    fontSize: 11,
    color: "#94a3b8",
  },
  // Color picker
  colorGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 4,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.1)",
    cursor: "pointer",
    display: "inline-flex",
    marginRight: 6,
    marginBottom: 4,
  },
  customColorRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  customColorLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  colorPicker: {
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    padding: 0,
    backgroundColor: "transparent",
  },
  colorHexInput: {
    width: 90,
    height: 32,
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "0 8px",
    fontSize: 13,
    color: "#0f172a",
    fontFamily: "monospace",
    boxSizing: "border-box" as const,
  },
  // Preview
  previewBox: {
    borderRadius: 12,
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    border: "1px solid #e2e8f0",
  },
  previewLogo: {
    maxWidth: 60,
    maxHeight: 40,
    objectFit: "contain" as const,
    marginBottom: 4,
  },
  previewLogoFallback: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  previewTagline: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
};

export default OnlineStoreSettings;
