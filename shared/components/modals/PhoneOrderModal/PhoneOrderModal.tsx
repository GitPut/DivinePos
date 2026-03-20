import React, { useState, useEffect } from "react";
import { FiUser, FiPhone, FiX, FiUsers } from "react-icons/fi";
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
import { shallowEqual } from "simpler-state";
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
  } = posState.use(
    (s) => ({
      name: s.name,
      phone: s.phone,
      address: s.address,
      deliveryChecked: s.deliveryChecked,
      ongoingDelivery: s.ongoingDelivery,
      buzzCode: s.buzzCode,
      unitNumber: s.unitNumber,
      savedCustomerDetails: s.savedCustomerDetails,
      deliveryModal: s.deliveryModal,
      updatingOrder: s.updatingOrder,
    }),
    shallowEqual
  );
  const alertP = useAlert();

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function getLatLng(placeId: string) {
    const response = await fetch("https://us-central1-posmate-5fc0a.cloudfunctions.net/getLatLng", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId }),
    });
    try {
      const responseData = await response.json();
      if (response.ok && responseData.success) return responseData.data;
    } catch { /* ignore */ }
  }

  async function calculateDistanceBetweenAddresses(address1: string, address2: string) {
    try {
      const { lat: lat1, lng: lon1 } = await getLatLng(address1);
      const { lat: lat2, lng: lon2 } = await getLatLng(address2);
      return calculateDistance(lat1, lon1, lat2, lon2);
    } catch { return null; }
  }

  const SaveCustomer = () => {
    addCustomerDetailsToDb({
      name, phone, address: address ? address : null, buzzCode: buzzCode ? buzzCode : null,
      unitNumber: unitNumber ? unitNumber : null, orders: [], id: "",
    }).then((docRef) => {
      updatePosState({
        savedCustomerDetails: { name, phone, address: address ? address : null, buzzCode: buzzCode ? buzzCode : null, unitNumber: unitNumber ? unitNumber : null, orders: [], id: docRef.id },
      });
      setCustomersState([...customers, { name, phone, address: address ? address : null, buzzCode: buzzCode ? buzzCode : null, unitNumber: unitNumber ? unitNumber : null, orders: [], id: docRef.id }]);
    });
  };

  useEffect(() => {
    if (!address) return;
    if (address.value?.reference && storeDetails?.address?.value?.reference) {
      setlocalAddress(address);
      try {
        calculateDistanceBetweenAddresses(storeDetails?.address?.value?.reference, address.value?.reference).then((distance) => {
          if (distance !== null && storeDetails.deliveryRange && distance > parseFloat(storeDetails.deliveryRange) && deliveryChecked) {
            alertP.error("The delivery address is out of range");
          }
        });
      } catch { alertP.error("Error calculating distance between addresses"); }
    }
  }, []);

  useEffect(() => {
    if (!localAddress) return;
    if (localAddress.value?.reference && storeDetails.address?.value?.reference) {
      updatePosState({ address: localAddress });
      try {
        calculateDistanceBetweenAddresses(storeDetails.address.value.reference, localAddress.value.reference).then((distance) => {
          if (distance !== null && storeDetails.deliveryRange && distance > parseFloat(storeDetails.deliveryRange) && deliveryChecked) {
            alertP.error("The delivery address is out of range");
          }
        });
      } catch { alertP.error("Error calculating distance between addresses"); }
    }
  }, [localAddress]);

  const closeModal = () => {
    if (ongoingDelivery || updatingOrder) {
      updatePosState({ deliveryModal: false });
    } else {
      updatePosState({ deliveryModal: false, ongoingDelivery: false, name: "", phone: "", address: null, buzzCode: "", unitNumber: "", deliveryChecked: false });
    }
  };

  return (
    <Modal isVisible={deliveryModal} onBackdropPress={closeModal}>
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.title}>Phone Order</span>
            <button style={styles.closeBtn} onClick={closeModal}>
              <FiX size={16} color="#64748b" />
            </button>
          </div>

          {/* Form */}
          <div style={styles.form}>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Customer Name</span>
              <div style={styles.inputRow}>
                <FiUser size={16} color="#94a3b8" />
                <input style={styles.input} placeholder="Enter name" value={name} onChange={(e) => updatePosState({ name: e.target.value })} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Phone Number</span>
              <div style={styles.inputRow}>
                <FiPhone size={16} color="#94a3b8" />
                <input style={styles.input} placeholder="Enter phone number" value={phone} onChange={(e) => updatePosState({ phone: e.target.value })} />
              </div>
            </div>

            {!savedCustomerDetails && (
              <div style={styles.toggleRow}>
                <span style={styles.toggleLabel}>Save customer for future orders</span>
                <Switch isActive={saveCustomerChecked} toggleSwitch={() => setsaveCustomerChecked(!saveCustomerChecked)} />
              </div>
            )}

            {storeDetails.acceptDelivery ? (
              <div style={styles.toggleRow}>
                <span style={styles.toggleLabel}>Delivery</span>
                <Switch isActive={deliveryChecked ?? false} toggleSwitch={() => updatePosState({ deliveryChecked: !deliveryChecked })} />
              </div>
            ) : (
              <div style={styles.hintBox}>
                <span style={styles.hintText}>Delivery is not enabled. Turn it on in Settings.</span>
              </div>
            )}

            {storeDetails.acceptDelivery && deliveryChecked && (
              <div style={styles.addressSection}>
                <span style={styles.fieldLabel}>Delivery Address</span>
                <div style={styles.addressRow}>
                  <div style={{ flex: 1 }}>
                    <GooglePlacesAutocomplete
                      apiOptions={{ region: "CA" }}
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
                  <input style={styles.smallInput} placeholder="Unit #" value={unitNumber ?? ""} onChange={(e) => updatePosState({ unitNumber: e.target.value })} />
                  <input style={styles.smallInput} placeholder="Buzz #" value={buzzCode ?? ""} onChange={(e) => updatePosState({ buzzCode: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              style={{ ...styles.orderBtn, ...(!name || !phone ? { opacity: 0.5 } : {}) }}
              disabled={!name || !phone}
              onClick={() => {
                if (name && phone) {
                  updatePosState({ deliveryModal: false, ongoingDelivery: true });
                  if (saveCustomerChecked) SaveCustomer();
                }
              }}
            >
              <span style={styles.orderBtnTxt}>{ongoingDelivery ? "Update Order" : "Start Order"}</span>
            </button>
            <button
              style={styles.savedCustomersBtn}
              onClick={() => {
                setsaveCustomerChecked(false);
                updatePosState({ ongoingDelivery: false, name: "", phone: "", address: null, buzzCode: "", unitNumber: "", deliveryChecked: false, deliveryModal: false, saveCustomerModal: true });
              }}
            >
              <FiUsers size={15} color="#1470ef" />
              <span style={styles.savedCustomersTxt}>Saved Customers</span>
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
    width: 480,
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  form: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  inputRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
  },
  input: {
    flex: 1,
    height: 42,
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "transparent",
  },
  toggleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #f1f5f9",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  hintBox: {
    padding: "10px 14px",
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    border: "1px solid #fee2e2",
  },
  hintText: {
    fontSize: 13,
    color: "#ef4444",
  },
  addressSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  addressRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  smallInput: {
    width: 80,
    height: 44,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 10px",
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    textAlign: "center" as const,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "16px 24px 20px",
    borderTop: "1px solid #f1f5f9",
  },
  orderBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1470ef",
    borderRadius: 10,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  orderBtnTxt: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15,
  },
  savedCustomersBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  savedCustomersTxt: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1470ef",
  },
};
