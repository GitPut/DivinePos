import React, { useState } from "react";
import FieldInput from "./FieldInput";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStylesDark as GooglePlacesStyles } from "utils/googlePlacesStyles";
const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";
import { useAlert } from "react-alert";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import { AddressType } from "types";
import useWindowSize from "shared/hooks/useWindowSize";
import { sanitizePhone, isValidPhone, isValidFullName } from "utils/phoneValidation";

function DeliveryDetails({ contrast }: { contrast?: any }) {
  const orderDetails = orderDetailsState.use();
  const storeDetails = storeDetailsState.use();
  const [localName, setlocalName] = useState(orderDetails.customer.name);
  const [localPhoneNumber, setlocalPhoneNumber] = useState(
    orderDetails.customer.phone,
  );
  const [localAddress, setlocalAddress] = useState<AddressType | null>(
    orderDetails.address ?? null,
  );
  const [localBuzzCode, setlocalBuzzCode] = useState(
    orderDetails.customer.buzzCode,
  );
  const [localUnitNumber, setlocalUnitNumber] = useState(
    orderDetails.customer.unitNumber,
  );
  const [checkingDeliveryRange, setcheckingDeliveryRange] = useState(false);
  const alertP = useAlert();
  const { width } = useWindowSize();

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  async function getLatLng(placeId: string) {
    const response = await fetch(
      "https://us-central1-posmate-5fc0a.cloudfunctions.net/getLatLng",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: placeId,
        }),
      },
    );

    try {
      const responseData = await response.json();

      if (response.ok && responseData.success) {
        return responseData.data;
      } else {
        console.error(responseData.message);
      }
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
    }
  }

  async function calculateDistanceBetweenAddresses(
    address1: string,
    address2: string,
  ) {
    try {
      const { lat: lat1, lng: lon1 } = await getLatLng(address1);
      const { lat: lat2, lng: lon2 } = await getLatLng(address2);
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      return distance;
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
    }
  }

  const isDisabled =
    checkingDeliveryRange ||
    !localAddress ||
    localName === "" ||
    localPhoneNumber === "";

  return (
    <div style={styles.wrapper}>
      <div style={styles.fieldsGroup}>
        <FieldInput
          txtInput="Your full name"
          label="Name"
          style={styles.field}
          value={localName}
          onChangeText={(text) => setlocalName(text)}
          textContentType="name"
          maxLength={25}
          contrast={contrast}
        />
        <FieldInput
          txtInput="(123) 456-7890"
          label="Phone Number"
          style={styles.field}
          value={localPhoneNumber}
          onChangeText={(text) => setlocalPhoneNumber(sanitizePhone(text))}
          textContentType="telephoneNumber"
          maxLength={10}
          contrast={contrast}
        />
        <FieldInput
          txtInput="Delivery Address"
          label="Delivery Address"
          style={styles.field}
          renderCustomInput={() => (
            <GooglePlacesAutocomplete
              apiOptions={{
                region: "CA",
              }}
              debounce={800}
              apiKey={GOOGLE_API_KEY}
              selectProps={{
                value: localAddress,
                onChange: (address: AddressType) => setlocalAddress(address),
                defaultValue: localAddress,
                menuPortalTarget: document.body,
                styles: GooglePlacesStyles,
              }}
            />
          )}
        />
        <div style={styles.halfRow}>
          <FieldInput
            txtInput="Code"
            label="Buzz Code"
            style={styles.halfField}
            value={localBuzzCode}
            onChangeText={(text) => setlocalBuzzCode(text)}
            textContentType="none"
            contrast={contrast}
          />
          <FieldInput
            txtInput="Unit #"
            label="Unit Number"
            style={styles.halfField}
            value={localUnitNumber}
            onChangeText={(text) => setlocalUnitNumber(text)}
            textContentType="none"
            contrast={contrast}
          />
        </div>
      </div>
      <button
        style={{
          ...styles.continueBtn,
          ...(contrast ? { backgroundColor: contrast.btnBg } : {}),
          ...(isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        }}
        disabled={isDisabled}
        onClick={() => {
          setcheckingDeliveryRange(true);
          if (localName === "" || localPhoneNumber === "" || !localAddress) {
            setcheckingDeliveryRange(false);
            return alertP.error("Please fill in all fields");
          }
          if (!isValidFullName(localName)) {
            setcheckingDeliveryRange(false);
            return alertP.error("Please enter your full name (first and last)");
          }
          if (!isValidPhone(localPhoneNumber)) {
            setcheckingDeliveryRange(false);
            return alertP.error("Please enter a valid 10-digit phone number");
          }

          calculateDistanceBetweenAddresses(
            storeDetails.address?.value?.reference ?? "",
            localAddress?.value?.reference ?? "",
          ).then((distance) => {
            if (distance !== null) {
              if (storeDetails.deliveryRange) {
                if (distance > parseFloat(storeDetails.deliveryRange)) {
                  alertP.error("The delivery address is out of range");
                  setcheckingDeliveryRange(false);
                } else {
                  setOrderDetailsState({
                    address: localAddress,
                    customer: {
                      ...orderDetails.customer,
                      name: localName,
                      phone: localPhoneNumber,
                      buzzCode: localBuzzCode,
                      unitNumber: localUnitNumber,
                    },
                    delivery: true,
                  });
                  setOrderDetailsState({ page: 4 });
                  setcheckingDeliveryRange(false);
                }
              } else {
                setOrderDetailsState({
                  address: localAddress,
                  customer: {
                    ...orderDetails.customer,
                    name: localName,
                    phone: localPhoneNumber,
                    buzzCode: localBuzzCode,
                    unitNumber: localUnitNumber,
                  },
                  delivery: true,
                });
                setOrderDetailsState({ page: 4 });
                setcheckingDeliveryRange(false);
              }
            } else {
              alertP.error(
                "Distance calculation failed. Please try selecting your address again.",
              );
              setcheckingDeliveryRange(false);
            }
          });
        }}
      >
        <span style={{ ...styles.continueBtnTxt, ...(contrast ? { color: contrast.btnText } : {}) }}>
          {checkingDeliveryRange ? "Checking..." : "Continue"}
        </span>
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: 24,
    display: "flex",
    flexDirection: "column",
  },
  fieldsGroup: {
    width: "100%",
    gap: 16,
    display: "flex",
    flexDirection: "column",
  },
  field: {
    width: "100%",
  },
  halfRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    display: "flex",
    flexWrap: "wrap" as const,
  },
  halfField: {
    flex: "1 1 140px",
    minWidth: 120,
  },
  continueBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  continueBtnTxt: {
    color: "#1D294E",
    fontSize: 16,
    fontWeight: "700",
  },
};

export default DeliveryDetails;
