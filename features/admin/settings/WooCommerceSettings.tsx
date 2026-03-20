import React, { useState } from "react";
import Switch from "shared/components/ui/Switch";
import {
  activePlanState,
  setWooCommerceState,
  wooCommerceState,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import { useHistory } from "react-router-dom";
import { FiLink, FiKey, FiShoppingCart, FiInfo } from "react-icons/fi";

function WooCommerceSettings() {
  const activePlan = activePlanState.use();
  const wooCredentials = wooCommerceState.use();
  const [apiUrl, setApiUrl] = useState(wooCredentials.apiUrl ?? "");
  const [ck, setCk] = useState(wooCredentials.ck ?? "");
  const [cs, setCs] = useState(wooCredentials.cs ?? "");
  const [useWoocommerce, setUseWoocommerce] = useState(
    wooCredentials.useWoocommerce ?? false,
  );
  const alertP = useAlert();
  const history = useHistory();

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
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <span style={styles.title}>WooCommerce Integration</span>
            <span style={styles.subtitle}>
              Connect your WooCommerce store to receive online orders
            </span>
          </div>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.upgradeCard}>
            <div style={styles.upgradeIconWrap}>
              <FiShoppingCart size={32} color="#1D294E" />
            </div>
            <span style={styles.upgradeTitle}>
              WooCommerce is a Professional Feature
            </span>
            <span style={styles.upgradeText}>
              Upgrade to the Professional plan to connect your WooCommerce store,
              automatically receive orders, and print them directly from your POS.
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

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>WooCommerce Integration</span>
          <span style={styles.subtitle}>
            Connect your WooCommerce store to automatically receive and print
            online orders
          </span>
        </div>
        <button style={styles.saveBtn} onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div style={styles.scrollArea}>
        {/* Enable Toggle Card */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Connection</span>
          <div style={styles.switchRow}>
            <div>
              <span style={styles.switchLabel}>Enable WooCommerce</span>
              <span style={styles.switchDescription}>
                When enabled, the POS will poll your WooCommerce store for new
                orders every 10 seconds
              </span>
            </div>
            <Switch
              isActive={useWoocommerce}
              toggleSwitch={() => setUseWoocommerce((prev) => !prev)}
            />
          </div>
        </div>

        {useWoocommerce && (
          <>
            {/* API Credentials Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <FiKey size={18} color="#1D294E" />
                <span style={styles.cardTitle}>API Credentials</span>
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Store URL</span>
                <div style={styles.urlInputRow}>
                  <FiLink size={14} color="#94a3b8" />
                  <input
                    style={styles.urlInput}
                    placeholder="https://yourstore.com"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.fieldGrid}>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Consumer Key</span>
                  <input
                    style={styles.input}
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={ck}
                    onChange={(e) => setCk(e.target.value)}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Consumer Secret</span>
                  <input
                    style={styles.input}
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={cs}
                    onChange={(e) => setCs(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div style={styles.helpCard}>
              <div style={styles.cardHeader}>
                <FiInfo size={18} color="#0ea5e9" />
                <span style={styles.helpTitle}>How to get your API keys</span>
              </div>
              <span style={styles.helpText}>
                In your WordPress admin, go to WooCommerce → Settings → Advanced
                → REST API → Add Key. Set permissions to "Read" and click
                "Generate API Key".
              </span>
            </div>
          </>
        )}
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
    gap: 8,
    height: 42,
    padding: "0 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
  urlInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#0f172a",
    border: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  helpCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    border: "1px solid #bae6fd",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flexShrink: 0,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0c4a6e",
  },
  helpText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: "1.6",
  },
  // Upgrade prompt
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
};

export default WooCommerceSettings;
