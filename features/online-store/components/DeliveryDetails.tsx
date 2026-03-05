import React, { useState } from "react";
import FieldInput from "./FieldInput";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";
import { useAlert } from "react-alert";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
} from "store/appState";
import { AddressType } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

function DeliveryDetails() {
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

  return (
    <>
      <div
        style={{
          ...styles.fieldsGroup,
          ...(width < 1000 ? { width: width * 0.9 } : {}),
        }}
      >
        <FieldInput
          txtInput="Name"
          label="Name*"
          style={styles.nameField}
          value={localName}
          onChangeText={(text) => setlocalName(text)}
          textContentType="name"
          maxLength={25}
        />
        <FieldInput
          txtInput="(123) 456-7890"
          label="Phone Number*"
          style={styles.nameField}
          value={localPhoneNumber}
          onChangeText={(text) => setlocalPhoneNumber(text)}
          textContentType="telephoneNumber"
          maxLength={10}
        />
        <FieldInput
          txtInput="Delivery Address"
          label="Delivery Address*"
          style={styles.addressField}
          customInput={() => (
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
        <div style={styles.buzzCodeAndPhoneRow}>
          <FieldInput
            txtInput="#"
            label="Buzz Code"
            style={styles.buzzCodeField}
            value={localBuzzCode}
            onChangeText={(text) => setlocalBuzzCode(text)}
            textContentType="none"
          />
          <FieldInput
            txtInput="#"
            label="Unit Number"
            style={styles.phoneNumberField}
            value={localUnitNumber}
            onChangeText={(text) => setlocalUnitNumber(text)}
            textContentType="none"
          />
        </div>
      </div>
      <button
        style={{
          ...styles.continueBtn,
          opacity:
            checkingDeliveryRange ||
            !localAddress ||
            localName === "" ||
            localPhoneNumber === ""
              ? 0.8
              : 1,
        }}
        disabled={
          checkingDeliveryRange ||
          !localAddress ||
          localName === "" ||
          localPhoneNumber === ""
        }
        onClick={() => {
          setcheckingDeliveryRange(true);
          if (localName === "" || localPhoneNumber === "" || !localAddress)
            return alertP.error("Please fill in all fields");

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
              alert(
                "Distance calculation between the store and your location failed. Please refresh page.",
              );
              setcheckingDeliveryRange(false);
            }
          });
        }}
      >
        <span style={styles.continueBtnTxt}>CONTINUE</span>
      </button>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fieldsGroup: {
    width: 380,
    height: 325,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  },
  nameField: {
    height: 70,
    width: "100%",
  },
  addressField: {
    height: 70,
    width: "100%",
  },
  buzzCodeAndPhoneRow: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    display: "flex",
  },
  buzzCodeField: {
    height: 70,
    width: "48%",
  },
  phoneNumberField: {
    height: 70,
    width: "48%",
  },
  continueBtn: {
    width: 219,
    height: 60,
    backgroundColor: "rgba(238,125,67,1)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
    marginTop: 10,
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  continueBtnTxt: {
    color: "rgba(255,255,255,1)",
    fontSize: 18,
    fontWeight: "700",
  },
};

export default DeliveryDetails;
