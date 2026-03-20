import React, { useState } from "react";
import {
  onlineStoreState,
  setStoreDetailsState,
  storeDetailsState,
} from "store/appState";
import { updateStoreDetails } from "services/firebase/functions";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Switch from "shared/components/ui/Switch";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";
import { useAlert } from "react-alert";
import { AddressType } from "types";

function GeneralSettings() {
  const storeDetails = storeDetailsState.use();
  if (!storeDetails) return null;
  const [name, setname] = useState<string>(storeDetails.name);
  const [phoneNumber, setphoneNumber] = useState<string>(
    storeDetails.phoneNumber,
  );
  const [address, setaddress] = useState<AddressType | undefined>(
    storeDetails.address ?? undefined,
  );
  const [website, setwebsite] = useState<string>(storeDetails.website);
  const [deliveryPrice, setdeliveryPrice] = useState<string>(
    storeDetails.deliveryPrice,
  );
  const [acceptDelivery, setacceptDelivery] = useState<boolean>(
    storeDetails.acceptDelivery,
  );
  const [deliveryRange, setdeliveryRange] = useState<string>(
    storeDetails.deliveryRange,
  );
  const [taxRate, settaxRate] = useState<string>(storeDetails.taxRate ?? "0");
  const [settingsPassword, setsettingsPassword] = useState<string>(
    storeDetails.settingsPassword,
  );
  const alertP = useAlert();

  const onlineStoreDetails = onlineStoreState.use();

  const handleDataUpdate = () => {
    if (name !== null && phoneNumber !== null && address !== null) {
      setStoreDetailsState({
        name: name ? name : "",
        phoneNumber: phoneNumber ? phoneNumber : "",
        address: address && address,
        website: website ? website : "",
        deliveryPrice: deliveryPrice ? deliveryPrice : "",
        settingsPassword: settingsPassword ? settingsPassword : "",
        taxRate: parseFloat(taxRate) >= 0 ? taxRate.toString() : "13",
        onlineStoreActive: onlineStoreDetails.onlineStoreActive
          ? onlineStoreDetails.onlineStoreActive
          : false,
        acceptDelivery: acceptDelivery ? acceptDelivery : false,
        deliveryRange: deliveryRange ? deliveryRange : "",
      });
      updateStoreDetails({
        name: name ? name : "",
        phoneNumber: phoneNumber ? phoneNumber : "",
        address: address && address,
        website: website ? website : "",
        deliveryPrice: deliveryPrice ? deliveryPrice : "",
        settingsPassword: settingsPassword ? settingsPassword : "",
        taxRate: (parseFloat(taxRate) >= 0
          ? parseFloat(taxRate)
          : 13
        ).toString(),
        onlineStoreActive: onlineStoreDetails.onlineStoreActive
          ? onlineStoreDetails.onlineStoreActive
          : false,
        acceptDelivery: acceptDelivery ? acceptDelivery : false,
        deliveryRange: deliveryRange ? deliveryRange : "",
      });
      alertP.success("Settings updated successfully");
    } else {
      alertP.error("Please fill in all fields");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>General Settings</span>
          <span style={styles.subtitle}>
            Manage your store details and preferences
          </span>
        </div>
        <button style={styles.saveBtn} onClick={handleDataUpdate}>
          Save Changes
        </button>
      </div>

      {/* Scrollable content */}
      <div style={styles.scrollArea}>
        {/* Store Information Card */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Store Information</span>
          <div style={styles.fieldGrid}>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Store Name</span>
              <input
                style={styles.input}
                placeholder="Enter store name"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Phone Number</span>
              <input
                style={styles.input}
                placeholder="Enter store phone number"
                value={phoneNumber}
                onChange={(e) => setphoneNumber(e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Website URL</span>
              <input
                style={styles.input}
                placeholder="Enter store website URL"
                value={website}
                onChange={(e) => setwebsite(e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Store Address</span>
              <GooglePlacesAutocomplete
                apiOptions={{ region: "CA" }}
                debounce={800}
                apiKey={GOOGLE_API_KEY}
                selectProps={{
                  value: address,
                  onChange: setaddress,
                  defaultValue: address,
                  menuPortalTarget: document.body,
                  styles: GooglePlacesStyles,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tax & Security Card */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Tax & Security</span>
          <div style={styles.fieldGrid}>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Tax Rate (%)</span>
              <input
                style={styles.input}
                placeholder="Enter tax rate (e.g. 13)"
                value={taxRate ? taxRate.toString() : ""}
                onChange={(e) => settaxRate(e.target.value)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Settings Password</span>
              <input
                style={styles.input}
                placeholder="Enter settings password"
                value={settingsPassword}
                onChange={(e) => setsettingsPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Delivery</span>
          <div style={styles.switchRow}>
            <div>
              <span style={styles.switchLabel}>Accept Delivery Orders</span>
              <span style={styles.switchDescription}>
                Enable delivery ordering for your customers
              </span>
            </div>
            <Switch
              isActive={acceptDelivery}
              toggleSwitch={() => setacceptDelivery((prev) => !prev)}
            />
          </div>
          {acceptDelivery && (
            <div style={styles.fieldGrid}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Delivery Fee ($)</span>
                <input
                  style={styles.input}
                  placeholder="Enter delivery price"
                  value={deliveryPrice}
                  onChange={(e) => setdeliveryPrice(e.target.value)}
                />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Delivery Radius (KM)</span>
                <input
                  style={styles.input}
                  placeholder="Enter delivery range in KM"
                  value={deliveryRange}
                  onChange={(e) => setdeliveryRange(e.target.value)}
                />
              </div>
            </div>
          )}
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
    backgroundColor: "#1470ef",
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
};

export default GeneralSettings;
