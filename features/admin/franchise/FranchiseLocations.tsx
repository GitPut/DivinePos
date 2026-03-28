import React, { useState } from "react";
import { FiPlus, FiMapPin, FiPhone, FiCheck, FiX } from "react-icons/fi";
import { franchiseState, updateFranchiseState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import Modal from "shared/components/ui/Modal";
import { FranchiseLocationInfo } from "types";
import { sanitizePhone, isValidPhone } from "utils/phoneValidation";
import firebase from "firebase/compat/app";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import { AddressType } from "types";

const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";

function FranchiseLocations() {
  const franchise = franchiseState.use();
  const alertP = useAlert();
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Add location form
  const [locName, setLocName] = useState("");
  const [locEmail, setLocEmail] = useState("");
  const [locPassword, setLocPassword] = useState("");
  const [locPhone, setLocPhone] = useState("");
  const [locAddress, setLocAddress] = useState<AddressType | null>(null);
  const [locAcceptDelivery, setLocAcceptDelivery] = useState(false);
  const [locDeliveryPrice, setLocDeliveryPrice] = useState("");
  const [locDeliveryRange, setLocDeliveryRange] = useState("");

  const resetForm = () => {
    setLocName("");
    setLocEmail("");
    setLocPassword("");
    setLocPhone("");
    setLocAddress(null);
    setLocAcceptDelivery(false);
    setLocDeliveryPrice("");
    setLocDeliveryRange("");
  };

  const handleCreate = async () => {
    if (!locName || !locEmail || !locPassword) {
      return alertP.error("Please fill in location name, email, and password");
    }
    if (locPhone && !isValidPhone(locPhone)) {
      return alertP.error("Please enter a valid 10-digit phone number");
    }
    if (locPassword.length < 6) {
      return alertP.error("Password must be at least 6 characters");
    }

    setCreating(true);
    try {
      const createFn = firebase.functions().httpsCallable("createFranchiseLocation");
      const result = await createFn({
        hubUid: auth.currentUser?.uid,
        email: locEmail,
        password: locPassword,
        locationName: locName,
        address: locAddress,
        phoneNumber: locPhone,
        acceptDelivery: locAcceptDelivery,
        deliveryPrice: locDeliveryPrice,
        deliveryRange: locDeliveryRange,
      });

      if (result.data?.success) {
        alertP.success(`Location "${locName}" created successfully`);

        // Update local franchise state
        const newLocation: FranchiseLocationInfo = {
          uid: result.data.locationUid,
          name: locName,
          address: locAddress,
          phoneNumber: locPhone,
          isActive: true,
          acceptDelivery: locAcceptDelivery,
          deliveryPrice: locDeliveryPrice,
          deliveryRange: locDeliveryRange,
        };

        if (franchise.config) {
          updateFranchiseState({
            config: {
              ...franchise.config,
              locations: [...franchise.config.locations, newLocation],
              locationUids: [...franchise.config.locationUids, result.data.locationUid],
            },
          });
        }

        resetForm();
        setShowAddModal(false);
      }
    } catch (err: any) {
      alertP.error(err.message || "Failed to create location");
    } finally {
      setCreating(false);
    }
  };

  const locations = franchise.config?.locations ?? [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <span style={styles.title}>Franchise Locations</span>
          <span style={styles.subtitle}>{locations.length} location{locations.length !== 1 ? "s" : ""}</span>
        </div>
        <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <FiPlus size={16} color="#fff" />
          <span style={styles.addBtnTxt}>Add Location</span>
        </button>
      </div>

      {/* Locations list */}
      <div style={styles.list}>
        {locations.length === 0 ? (
          <div style={styles.emptyState}>
            <FiMapPin size={32} color="#cbd5e1" />
            <span style={styles.emptyTitle}>No locations yet</span>
            <span style={styles.emptySubtitle}>Add your first franchise location to get started</span>
          </div>
        ) : (
          locations.map((loc) => (
            <div key={loc.uid} style={styles.locationCard}>
              <div style={styles.locationIcon}>
                <FiMapPin size={20} color="#6366f1" />
              </div>
              <div style={styles.locationInfo}>
                <span style={styles.locationName}>{loc.name}</span>
                <span style={styles.locationDetail}>
                  {loc.address?.value?.structured_formatting?.main_text || loc.address?.label || "No address set"}
                </span>
                {loc.phoneNumber && (
                  <span style={styles.locationDetail}>
                    <FiPhone size={11} color="#94a3b8" /> {loc.phoneNumber}
                  </span>
                )}
              </div>
              <div style={styles.statusBadge}>
                <div style={{ ...styles.statusDot, backgroundColor: loc.isActive ? "#16a34a" : "#94a3b8" }} />
                <span style={styles.statusText}>{loc.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Location Modal */}
      <Modal isVisible={showAddModal} onBackdropPress={() => { if (!creating) { setShowAddModal(false); resetForm(); } }}>
        <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add New Location</span>
              <button style={styles.closeBtn} onClick={() => { setShowAddModal(false); resetForm(); }}>
                <FiX size={16} color="#64748b" />
              </button>
            </div>

            <div style={styles.modalForm}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Location Name *</span>
                <input style={styles.input} placeholder='e.g. "Downtown" or "Mall Location"' value={locName} onChange={(e) => setLocName(e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Login Email *</span>
                <input style={styles.input} placeholder="location@company.com" value={locEmail} onChange={(e) => setLocEmail(e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Login Password *</span>
                <input style={styles.input} type="password" placeholder="Min 6 characters" value={locPassword} onChange={(e) => setLocPassword(e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Phone Number</span>
                <input style={styles.input} placeholder="(123) 456-7890" value={locPhone} onChange={(e) => setLocPhone(sanitizePhone(e.target.value))} maxLength={10} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Address</span>
                <GooglePlacesAutocomplete
                  apiOptions={{ region: "CA" }}
                  debounce={800}
                  apiKey={GOOGLE_API_KEY}
                  selectProps={{
                    value: locAddress,
                    onChange: setLocAddress,
                    placeholder: "Enter location address",
                    menuPortalTarget: document.body,
                    styles: GooglePlacesStyles,
                  }}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </button>
              <button
                style={{ ...styles.createBtn, ...(creating ? { opacity: 0.6 } : {}) }}
                disabled={creating}
                onClick={handleCreate}
              >
                {creating ? "Creating..." : "Create Location"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 28,
    overflow: "auto",
    flex: 1,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    display: "block",
  },
  addBtn: {
    height: 40,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  addBtnTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  locationCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: "18px 20px",
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locationInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
    minWidth: 0,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  locationDetail: {
    fontSize: 13,
    color: "#94a3b8",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  // Modal
  modal: {
    width: 480,
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
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
  modalForm: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: 400,
    overflowY: "auto" as const,
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
  input: {
    height: 42,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    width: "100%",
  },
  modalFooter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
  },
  cancelBtn: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#344054",
    cursor: "pointer",
  },
  createBtn: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    cursor: "pointer",
  },
};

export default FranchiseLocations;
