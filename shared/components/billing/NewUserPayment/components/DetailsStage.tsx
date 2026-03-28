import React from "react";
import { FiShoppingBag, FiPhone, FiMapPin, FiGlobe } from "react-icons/fi";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import { AddressType } from "types";
import { sanitizePhone } from "utils/phoneValidation";

const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";

interface DetailsStageProps {
  setstageNum: (num: number) => void;
  setstoreName: (storeName: string) => void;
  setphoneNumber: (phoneNumber: string) => void;
  setwebsite: (website: string) => void;
  setaddress: (address: AddressType) => void;
  address: AddressType | null;
  planType: string | null;
  storeName: string;
  phoneNumber: string;
  website: string;
}

function DetailsStage({
  setstageNum,
  setstoreName,
  setphoneNumber,
  setwebsite,
  setaddress,
  address,
  storeName,
  phoneNumber,
  website,
}: DetailsStageProps) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.title}>Set up your store</span>
        <span style={styles.subtitle}>Enter your store details to get started</span>
      </div>
      <div style={styles.divider} />
      <div style={styles.form}>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Store Name *</span>
          <div style={styles.inputRow}>
            <FiShoppingBag size={18} color="#94a3b8" />
            <input
              style={styles.input}
              placeholder="My Pizza Shop"
              value={storeName}
              onChange={(e) => setstoreName(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Phone Number *</span>
          <div style={styles.inputRow}>
            <FiPhone size={18} color="#94a3b8" />
            <input
              style={styles.input}
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setphoneNumber(sanitizePhone(e.target.value))}
              maxLength={10}
            />
          </div>
        </div>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Address *</span>
          <div style={styles.addressRow}>
            <FiMapPin size={18} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <GooglePlacesAutocomplete
                apiOptions={{ region: "CA" }}
                debounce={800}
                apiKey={GOOGLE_API_KEY}
                selectProps={{
                  value: address,
                  onChange: setaddress,
                  defaultValue: address,
                  placeholder: "Enter store address",
                  menuPortalTarget: document.body,
                  styles: GooglePlacesStyles,
                }}
              />
            </div>
          </div>
        </div>
        <div style={styles.fieldGroup}>
          <span style={styles.label}>Website <span style={styles.optional}>optional</span></span>
          <div style={styles.inputRow}>
            <FiGlobe size={18} color="#94a3b8" />
            <input
              style={styles.input}
              placeholder="www.mypizzashop.com"
              value={website}
              onChange={(e) => setwebsite(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
    width: "100%",
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    marginBottom: 8,
  },
  cardHeader: {
    padding: "28px 36px 0",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    margin: "18px 36px",
  },
  form: {
    padding: "0 36px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  optional: {
    fontSize: 12,
    fontWeight: "400",
    color: "#94a3b8",
    marginLeft: 4,
  },
  inputRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 52,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 16px",
    backgroundColor: "#fff",
  },
  addressRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 16px",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 50,
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "transparent",
  },
};

export default DetailsStage;
