import React from "react";
import HeaderTxt from "./HeaderTxt";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import InputWithLabel from "shared/components/ui/InputWithLabel";
import { AddressType } from "types";

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
    <div style={styles.container}>
      <button style={styles.backLink} onClick={() => setstageNum(1)}>
        <span style={styles.backLinkText}>Back to plan selection</span>
      </button>
      <HeaderTxt
        Txt="Set up your store"
        SubTxt="Enter your store details to get started"
      />
      <div style={styles.card}>
        <div style={styles.formContainer}>
          <div style={styles.inputGroup}>
            <span style={styles.inputLabel}>Store Name *</span>
            <input
              style={styles.input}
              placeholder="Enter store name"
              value={storeName}
              onChange={(e) => setstoreName(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <span style={styles.inputLabel}>Phone Number *</span>
            <input
              style={styles.input}
              placeholder="Enter store phone number"
              value={phoneNumber}
              onChange={(e) => setphoneNumber(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <span style={styles.inputLabel}>Address *</span>
            <GooglePlacesAutocomplete
              apiOptions={{
                region: "CA",
              }}
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
          <div style={styles.inputGroup}>
            <span style={styles.inputLabel}>Website</span>
            <input
              style={styles.input}
              placeholder="Enter store website (optional)"
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
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 520,
  },
  backLink: {
    alignSelf: "flex-start",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 16,
  },
  backLinkText: {
    color: "#1470ef",
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    padding: "32px 28px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  input: {
    height: 48,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 16px",
    fontSize: 15,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },
};

export default DetailsStage;
