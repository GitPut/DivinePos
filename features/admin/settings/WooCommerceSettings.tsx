import React, { useState } from "react";
import InputField from "./components/InputField";
import Switch from "shared/components/ui/Switch";
import { activePlanState, setWooCommerceState, wooCommerceState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";

function WooCommerceSettings() {
  const activePlan = activePlanState.use();
  const wooCredentials = wooCommerceState.use();
  const [apiUrl, setApiUrl] = useState(wooCredentials.apiUrl ?? "");
  const [ck, setCk] = useState(wooCredentials.ck ?? "");
  const [cs, setCs] = useState(wooCredentials.cs ?? "");
  const [useWoocommerce, setUseWoocommerce] = useState(
    wooCredentials.useWoocommerce ?? false
  );
  const alertP = useAlert();

  const handleSave = () => {
    if (useWoocommerce && (!apiUrl || !ck || !cs)) {
      alertP.error("Please fill in all WooCommerce fields");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const creds = { apiUrl, ck, cs, useWoocommerce };
    setWooCommerceState(creds);
    db.collection("users")
      .doc(userId)
      .update({ wooCredentials: creds })
      .then(() => {
        alertP.success("WooCommerce settings updated");
      })
      .catch(() => {
        alertP.error("Failed to save WooCommerce settings");
      });
  };

  if (activePlan !== "professional") {
    return (
      <div style={styles.contentContainer}>
        <div style={styles.inner}>
          <span style={styles.title}>WooCommerce Integration</span>
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 24, maxWidth: 480, display: "flex", flexDirection: "column" as const, gap: 16, marginTop: 16 }}>
            <span style={{ fontSize: 15, color: "#1e40af", lineHeight: "1.5" }}>
              WooCommerce integration is available on the Professional plan.
            </span>
            <button
              style={{ padding: "12px 28px", backgroundColor: "#1470ef", color: "#fff", fontWeight: "600", fontSize: 15, border: "none", borderRadius: 10, cursor: "pointer", alignSelf: "flex-start" }}
              onClick={() => window.location.href = "/authed/settings/billingsettings"}
            >
              Upgrade to Professional
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.contentContainer}>
      <div style={styles.inner}>
        <span style={styles.title}>WooCommerce Integration</span>
        <span style={styles.subtitle}>
          Connect your WooCommerce store to automatically receive and print
          online orders.
        </span>

        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>Enable WooCommerce</span>
          <Switch
            isActive={useWoocommerce}
            toggleSwitch={() => setUseWoocommerce((prev) => !prev)}
          />
        </div>

        {useWoocommerce && (
          <div style={styles.fieldsContainer}>
            <InputField
              lbl="Store URL"
              style={styles.inputField}
              placeholder="https://yourstore.com"
              onChangeText={(val) => setApiUrl(val)}
              value={apiUrl}
            />
            <InputField
              lbl="Consumer Key"
              style={styles.inputField}
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              onChangeText={(val) => setCk(val)}
              value={ck}
            />
            <InputField
              lbl="Consumer Secret"
              style={styles.inputField}
              placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              onChangeText={(val) => setCs(val)}
              value={cs}
            />
            <div style={styles.helpBox}>
              <span style={styles.helpTitle}>How to get your API keys:</span>
              <span style={styles.helpText}>
                In your WordPress admin, go to WooCommerce → Settings → Advanced
                → REST API → Add Key. Set permissions to "Read" and click
                "Generate API Key".
              </span>
            </div>
          </div>
        )}

        <div style={styles.btnContainer}>
          <button style={styles.saveBtn} onClick={handleSave}>
            <span style={styles.saveBtnTxt}>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  contentContainer: {
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    padding: 30,
    maxWidth: 500,
  },
  title: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  toggleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  toggleLabel: {
    fontWeight: "700",
    color: "#020202",
    fontSize: 17,
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputField: {
    height: 89,
    width: "100%",
  },
  helpBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  helpTitle: {
    fontWeight: "600",
    fontSize: 13,
    color: "#334155",
  },
  helpText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: "1.5",
  },
  btnContainer: {
    display: "flex",
    width: "100%",
    height: 111,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    width: 173,
    height: 46,
    backgroundColor: "#1c294e",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
  },
  saveBtnTxt: {
    fontWeight: "700",
    color: "rgba(255,245,245,1)",
    fontSize: 14,
  },
};

export default WooCommerceSettings;
