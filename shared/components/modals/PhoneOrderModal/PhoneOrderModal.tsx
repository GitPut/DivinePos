import React, { useState, useEffect } from "react";
import { MdPerson, MdHistory } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { FaPhone } from "react-icons/fa";
import {
  customersState,
  setCustomersState,
  storeDetailsState,
} from "store/appState";
import { addCustomerDetailsToDb } from "services/firebase/functions";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Switch from "shared/components/ui/Switch";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import Modal from "shared/components/ui/Modal";
import { posState, updatePosState } from "store/posState";
import { useAlert } from "react-alert";
import { AddressType } from "types";

const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";

const PhoneOrderModal = () => {
  const [localAddress, setlocalAddress] = useState<AddressType | null>(null);
  const [saveCustomerChecked, setsaveCustomerChecked] = useState(false);
  const customers = customersState.use();
  const storeDetails = storeDetailsState.use();
  const {
    name,
    phone,
    address,
    deliveryChecked,
    ongoingDelivery,
    buzzCode,
    unitNumber,
    savedCustomerDetails,
    deliveryModal,
    updatingOrder,
  } = posState.use();
  const alertP = useAlert();

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
      }
    } catch (jsonError) {
      // ignore JSON parse errors
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
      return null;
    }
  }

  const SaveCustomer = () => {
    addCustomerDetailsToDb({
      name: name,
      phone: phone,
      address: address ? address : null,
      buzzCode: buzzCode ? buzzCode : null,
      unitNumber: unitNumber ? unitNumber : null,
      orders: [],
      id: "",
    }).then((docRef) => {
      updatePosState({
        savedCustomerDetails: {
          name: name,
          phone: phone,
          address: address ? address : null,
          buzzCode: buzzCode ? buzzCode : null,
          unitNumber: unitNumber ? unitNumber : null,
          orders: [],
          id: docRef.id,
        },
      });

      setCustomersState([
        ...customers,
        {
          name: name,
          phone: phone,
          address: address ? address : null,
          buzzCode: buzzCode ? buzzCode : null,
          unitNumber: unitNumber ? unitNumber : null,
          orders: [],
          id: docRef.id,
        },
      ]);
    });
  };

  useEffect(() => {
    if (!address) return;
    if (address.value?.reference && storeDetails?.address?.value?.reference) {
      setlocalAddress(address);
      try {
        calculateDistanceBetweenAddresses(
          storeDetails?.address?.value?.reference,
          address.value?.reference,
        ).then((distance) => {
          if (distance !== null) {
            if (storeDetails.deliveryRange) {
              if (
                distance > parseFloat(storeDetails.deliveryRange) &&
                deliveryChecked
              ) {
                alertP.error("The delivery address is out of range");
              }
            }
          }
        });
      } catch {
        alertP.error("Error calculating distance between addresses");
      }
    }
  }, []);

  useEffect(() => {
    if (!localAddress) return;
    if (
      localAddress.value?.reference &&
      storeDetails.address?.value?.reference
    ) {
      updatePosState({ address: localAddress });
      try {
        calculateDistanceBetweenAddresses(
          storeDetails.address.value.reference,
          localAddress.value.reference,
        ).then((distance) => {
          if (distance !== null) {
            if (storeDetails.deliveryRange) {
              if (
                distance > parseFloat(storeDetails.deliveryRange) &&
                deliveryChecked
              ) {
                alertP.error("The delivery address is out of range");
              }
            }
          }
        });
      } catch {
        alertP.error("Error calculating distance between addresses");
      }
    }
  }, [localAddress]);

  return (
    <Modal
      isVisible={deliveryModal}
      onBackdropPress={() => {
        if (ongoingDelivery || updatingOrder) {
          updatePosState({ deliveryModal: false });
        } else {
          updatePosState({
            deliveryModal: false,
            ongoingDelivery: false,
            name: "",
            phone: "",
            address: null,
            buzzCode: "",
            unitNumber: "",
            deliveryChecked: false,
          });
        }
      }}
    >
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          <div style={styles.topHeaderAndCloseGroup}>
            <div style={styles.closeRow}>
              <button
                onClick={() => {
                  if (ongoingDelivery || updatingOrder) {
                    updatePosState({ deliveryModal: false });
                  } else {
                    updatePosState({
                      deliveryModal: false,
                      ongoingDelivery: false,
                      name: "",
                      phone: "",
                      address: null,
                      buzzCode: "",
                      unitNumber: "",
                      deliveryChecked: false,
                    });
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <IoClose style={styles.escapeIcon} />
              </button>
            </div>
            <span style={styles.phoneOrder}>Phone Order</span>
          </div>
          <div style={styles.middleGroup}>
            <div style={styles.customerNameRow}>
              <MdPerson style={styles.customerIcon} />
              <input
                placeholder="Enter name"
                style={styles.namedTxtBox}
                value={name}
                onChange={(e) => {
                  updatePosState({ name: e.target.value });
                }}
              />
            </div>
            <div style={styles.customerPhoneRow}>
              <FaPhone style={styles.numberIcon} />
              <input
                placeholder="Enter phone number"
                style={styles.phoneNumberTxtBox}
                value={phone}
                onChange={(e) => {
                  updatePosState({ phone: e.target.value });
                }}
              />
            </div>
            {!savedCustomerDetails && (
              <div style={styles.saveCustomerRow}>
                <span style={styles.savedCustomersTxt}>
                  Would you like to save customer?
                </span>
                <Switch
                  isActive={saveCustomerChecked}
                  toggleSwitch={() =>
                    setsaveCustomerChecked(!saveCustomerChecked)
                  }
                />
              </div>
            )}
            {storeDetails.acceptDelivery ? (
              <div style={styles.deliveryRow}>
                <span style={styles.delivery}>Delivery</span>
                <Switch
                  isActive={deliveryChecked ?? false}
                  toggleSwitch={() =>
                    updatePosState({
                      deliveryChecked: !deliveryChecked,
                    })
                  }
                />
              </div>
            ) : (
              <span>
                You do not accept delivery. (If you would like to please go to
                settings and switch accept delivery to true)
              </span>
            )}
            {storeDetails.acceptDelivery && deliveryChecked && (
              <div style={styles.addressTxtBox}>
                <div style={{ width: "60%", height: "100%" }}>
                  <GooglePlacesAutocomplete
                    apiOptions={{
                      region: "CA",
                    }}
                    debounce={800}
                    apiKey={GOOGLE_API_KEY}
                    selectProps={{
                      value: localAddress,
                      onChange: setlocalAddress,
                      placeholder: "Enter customer address",
                      defaultValue: address,
                      menuPortalTarget: document.body,
                      styles: GooglePlacesStyles,
                    }}
                  />
                </div>
                <input
                  placeholder="Unit #"
                  style={{
                    width: "18%",
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,1)",
                    borderWidth: 1,
                    borderColor: "#000000",
                    borderRadius: 10,
                    padding: 10,
                    borderStyle: "solid" as const,
                    boxSizing: "border-box" as const,
                  }}
                  value={unitNumber ?? ""}
                  onChange={(e) => {
                    updatePosState({ unitNumber: e.target.value });
                  }}
                />
                <input
                  placeholder="Buzz #"
                  style={{
                    width: "18%",
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,1)",
                    borderWidth: 1,
                    borderColor: "#000000",
                    borderRadius: 10,
                    padding: 10,
                    borderStyle: "solid" as const,
                    boxSizing: "border-box" as const,
                  }}
                  value={buzzCode ?? ""}
                  onChange={(e) => {
                    updatePosState({ buzzCode: e.target.value });
                  }}
                />
              </div>
            )}
          </div>
          <div style={styles.bottomGroup}>
            <button
              style={{
                ...styles.orderButton,
                ...((!name || !phone) && { opacity: 0.8 }),
              }}
              disabled={!name || !phone}
              onClick={() => {
                if (name && phone) {
                  updatePosState({
                    deliveryModal: false,
                    ongoingDelivery: true,
                  });
                  if (saveCustomerChecked) {
                    SaveCustomer();
                  }
                }
              }}
            >
              <span style={styles.orderButtonTxt}>
                {ongoingDelivery ? "Update" : "Order"}
              </span>
            </button>
            <button
              style={styles.viewSavedCustomersRow}
              onClick={() => {
                setsaveCustomerChecked(false);
                updatePosState({
                  ongoingDelivery: false,
                  name: "",
                  phone: "",
                  address: null,
                  buzzCode: "",
                  unitNumber: "",
                  deliveryChecked: false,
                  deliveryModal: false,
                  saveCustomerModal: true,
                });
              }}
            >
              <MdHistory style={styles.savedCustomersIcon} />
              <span style={styles.savedCustomers}>Saved Customers</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PhoneOrderModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    width: 540,
    height: 608,
    backgroundColor: "rgba(255,255,255,1)",
    display: "flex",
    flexDirection: "column",
  },
  topHeaderAndCloseGroup: {
    width: 495,
    height: 64,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
  },
  closeRow: {
    height: 36,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    alignSelf: "stretch",
    display: "flex",
  },
  escapeIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
  },
  phoneOrder: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    display: "block",
  },
  middleGroup: {
    width: 400,
    height: 285,
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  customerNameRow: {
    width: 400,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  customerIcon: {
    color: "#1d284e",
    fontSize: 45,
  },
  namedTxtBox: {
    width: 344,
    height: 52,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid" as const,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  customerPhoneRow: {
    width: 394,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  numberIcon: {
    color: "#1c294e",
    fontSize: 42,
  },
  phoneNumberTxtBox: {
    width: 344,
    height: 52,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid" as const,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  saveCustomerRow: {
    width: 396,
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  savedCustomersTxt: {
    color: "#121212",
    fontSize: 15,
  },
  deliveryRow: {
    width: 395,
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  delivery: {
    color: "#121212",
    fontSize: 15,
  },
  addressTxtBox: {
    width: 394,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  bottomGroup: {
    width: 283,
    height: 110,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    display: "flex",
    flexDirection: "column",
  },
  orderButton: {
    width: 283,
    height: 43,
    backgroundColor: "#1c294e",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    border: "none",
    cursor: "pointer",
  },
  orderButtonTxt: {
    fontWeight: "700",
    color: "rgba(255,255,255,1)",
    fontSize: 20,
  },
  viewSavedCustomersRow: {
    width: 153,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  savedCustomersIcon: {
    color: "rgba(2,2,2,1)",
    fontSize: 30,
  },
  savedCustomers: {
    color: "#797272",
    fontSize: 15,
  },
};
