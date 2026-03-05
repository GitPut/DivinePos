import React, { useState } from "react";
import InputField from "./components/InputField";
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
    <div
      style={{
        ...styles.contentContainer,
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 30,
        }}
      >
        <div style={styles.inputsLeftAndRight}>
          <div style={styles.leftSideGroup}>
            <InputField
              lbl="Store Name"
              style={styles.storeNameInput}
              placeholder="Enter store name"
              onChangeText={(val) => setname(val)}
              value={name}
            />
            <InputField
              lbl="Store Website URL"
              style={styles.storeWebsiteUrlInput}
              placeholder="Enter store website URL"
              onChangeText={(val) => setwebsite(val)}
              value={website}
            />
            <InputField
              lbl="Store Phone Number"
              style={styles.storePhoneNumberInput}
              placeholder="Enter store phone number"
              onChangeText={(val) => setphoneNumber(val)}
              value={phoneNumber}
            />
            <InputField
              lbl="Settings Password"
              style={styles.settingsPasswordInput}
              placeholder="Enter settings password"
              onChangeText={(val) => setsettingsPassword(val)}
              value={settingsPassword}
            />
          </div>
          <div style={styles.rightSideGroup}>
            <InputField
              lbl="Tax Rate - Default (13%)"
              style={styles.taxRateInput}
              placeholder="Enter tax rate (Ex. 13%)"
              onChangeText={(val) => {
                settaxRate(val);
              }}
              value={taxRate ? taxRate.toString() : ""}
            />
            <div
              style={{
                ...styles.taxRateInput,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontWeight: "700",
                  color: "#020202",
                  fontSize: 17,
                  height: 20,
                  alignSelf: "stretch",
                  display: "inline-block",
                }}
              >
                Store Address
              </span>
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
                  menuPortalTarget: document.body,
                  styles: GooglePlacesStyles,
                }}
              />
            </div>
            <div style={styles.acceptDeliveryGroup}>
              <span style={styles.acceptDeliveryLbl}>Accept Delivery?</span>
              <Switch
                isActive={acceptDelivery}
                toggleSwitch={() => setacceptDelivery((prev) => !prev)}
              />
            </div>
            {acceptDelivery && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <InputField
                  lbl="Delivery Fee"
                  style={{ height: 89, width: "48%" }}
                  placeholder="Enter delivery price"
                  onChangeText={(val) => setdeliveryPrice(val)}
                  value={deliveryPrice}
                />
                <InputField
                  lbl="Delivery Radius (KM)"
                  style={{ height: 89, width: "48%" }}
                  placeholder="Enter delivery range in KM"
                  onChangeText={(val) => setdeliveryRange(val)}
                  value={deliveryRange}
                />
              </div>
            )}
            {!acceptDelivery && <div style={{ height: 89, width: "100%" }} />}
          </div>
        </div>
        <div style={styles.btnContainer}>
          <button style={styles.saveBtn} onClick={handleDataUpdate}>
            <span style={styles.saveBtnTxt}>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: 759,
  },
  headerLbl: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 16,
  },
  contentContainer: {
    width: "100%",
    height: "100%",
  },
  inputsLeftAndRight: {
    display: "flex",
    width: "95%",
    height: 414,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSideGroup: {
    display: "flex",
    flexDirection: "column",
    width: "40%",
    height: 414,
    justifyContent: "space-between",
  },
  storeNameInput: {
    height: 89,
    width: "100%",
  },
  storeWebsiteUrlInput: {
    height: 89,
    width: "100%",
  },
  storePhoneNumberInput: {
    height: 89,
    width: "100%",
  },
  settingsPasswordInput: {
    height: 89,
    width: "100%",
  },
  rightSideGroup: {
    display: "flex",
    flexDirection: "column",
    width: "40%",
    height: 414,
    justifyContent: "space-between",
  },
  acceptDeliveryGroup: {
    display: "flex",
    width: "100%",
    height: 89,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingBottom: 27,
  },
  acceptDeliveryLbl: {
    fontWeight: "700",
    color: "#121212",
    textDecoration: "underline",
    fontSize: 17,
    marginRight: 10,
  },
  acceptDeliverySwitch: {
    width: 46,
    height: 20,
    backgroundColor: "#E6E6E6",
  },
  deliveryPriceInput: {
    height: 89,
    width: "100%",
  },
  deliveryRangeInput: {
    height: 89,
    width: "100%",
  },
  taxRateInput: {
    height: 89,
    width: "100%",
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

export default GeneralSettings;
