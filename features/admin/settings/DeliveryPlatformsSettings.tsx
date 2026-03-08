import React, { useState, useEffect } from "react";
import {
  activePlanState,
  deliveryPlatformsState,
  setDeliveryPlatformsState,
  DeliveryPlatformsState,
  DeliveryPlatformConfig,
} from "store/appState";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import Switch from "shared/components/ui/Switch";
import { useHistory } from "react-router-dom";
import { FiCopy } from "react-icons/fi";

const PLATFORMS = [
  { key: "doordash" as const, label: "DoorDash", color: "#FF3008" },
  { key: "ubereats" as const, label: "Uber Eats", color: "#06C167" },
  { key: "skipthedishes" as const, label: "Skip The Dishes", color: "#EC6730" },
  { key: "grubhub" as const, label: "Grubhub", color: "#F63440" },
];

const WEBHOOK_BASE_URL = "https://us-central1-posmate-5fc0a.cloudfunctions.net/deliveryWebhook";

function DeliveryPlatformsSettings() {
  const activePlan = activePlanState.use();
  const savedConfig = deliveryPlatformsState.use();
  const alertP = useAlert();
  const history = useHistory();
  const [config, setConfig] = useState<DeliveryPlatformsState>(savedConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(savedConfig);
  }, [savedConfig]);

  const uid = auth.currentUser?.uid;

  const getWebhookUrl = (platform: string) =>
    uid ? `${WEBHOOK_BASE_URL}/${uid}/${platform}` : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alertP.success("Webhook URL copied to clipboard");
  };

  const updatePlatform = (
    platform: keyof DeliveryPlatformsState,
    field: keyof DeliveryPlatformConfig,
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await db.collection("users").doc(uid).update({
        deliveryPlatforms: config,
      });
      setDeliveryPlatformsState(config);
      alertP.success("Delivery platform settings saved");
    } catch (error) {
      alertP.error("Error saving settings");
    }
    setSaving(false);
  };

  if (activePlan !== "professional") {
    return (
      <div style={{ height: "100%", width: "100%", overflow: "auto", padding: 20 }}>
        <span style={styles.pageLbl}>Delivery Platform Integrations</span>
        <div style={styles.upgradeBox}>
          <span style={styles.upgradeText}>
            Delivery platform integrations are available on the Professional plan.
          </span>
          <button
            style={styles.upgradeBtn}
            onClick={() => history.push("/authed/settings/billingsettings")}
          >
            Upgrade to Professional
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", overflow: "auto", padding: 20 }}>
      <span style={styles.pageLbl}>Delivery Platform Integrations</span>
      <span style={styles.subtitle}>
        Connect your delivery platform accounts to automatically receive orders in your POS.
      </span>

      {PLATFORMS.map(({ key, label, color }) => (
        <div key={key} style={styles.platformCard}>
          <div style={styles.platformHeader}>
            <div style={{ ...styles.platformDot, backgroundColor: color }} />
            <span style={styles.platformLabel}>{label}</span>
            <div style={{ marginLeft: "auto" }}>
              <Switch
                isActive={config[key].enabled}
                toggleSwitch={() => updatePlatform(key, "enabled", !config[key].enabled)}
              />
            </div>
          </div>

          {config[key].enabled && (
            <div style={styles.platformFields}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Webhook Secret</span>
                <input
                  style={styles.input}
                  type="password"
                  value={config[key].webhookSecret}
                  onChange={(e) => updatePlatform(key, "webhookSecret", e.target.value)}
                  placeholder="Enter webhook signing secret"
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Store / Merchant ID</span>
                <input
                  style={styles.input}
                  value={config[key].storeId}
                  onChange={(e) => updatePlatform(key, "storeId", e.target.value)}
                  placeholder="Enter your store ID"
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Webhook URL</span>
                <div style={styles.webhookUrlRow}>
                  <input
                    style={{ ...styles.input, flex: 1, color: "#64748b", fontSize: 12 }}
                    value={getWebhookUrl(key)}
                    readOnly
                  />
                  <button
                    style={styles.copyBtn}
                    onClick={() => copyToClipboard(getWebhookUrl(key))}
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
                <span style={styles.helpText}>
                  Copy this URL and paste it in your {label} developer portal webhook settings.
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageLbl: {
    fontWeight: "700",
    fontSize: 24,
    color: "#1a1a1a",
    display: "block",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    display: "block",
    marginBottom: 24,
  },
  platformCard: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  platformHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  platformDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  platformLabel: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1a1a1a",
  },
  platformFields: {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  fieldLabel: {
    fontWeight: "500",
    fontSize: 13,
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    color: "#1a1a1a",
    outline: "none",
    fontFamily: "inherit",
  },
  webhookUrlRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  copyBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  helpText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  saveBtn: {
    padding: "12px 32px",
    backgroundColor: "#1470ef",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 8,
  },
  upgradeBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 12,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 480,
  },
  upgradeText: {
    fontSize: 15,
    color: "#1e40af",
    lineHeight: "1.5",
  },
  upgradeBtn: {
    padding: "12px 28px",
    backgroundColor: "#1470ef",
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
};

export default DeliveryPlatformsSettings;
