import React, { useEffect, useState } from "react";
import { FiPlus, FiMapPin, FiGlobe, FiChevronDown, FiChevronUp, FiUser, FiTrash2 } from "react-icons/fi";
import { db } from "services/firebase/config";
import { useAlert } from "react-alert";
import Swal from "sweetalert2";
import firebase from "firebase/compat/app";
import { sanitizePhone, isValidPhone } from "utils/phoneValidation";

interface LocationDoc {
  uid: string;
  name: string;
  phoneNumber?: string;
  isActive?: boolean;
  address?: any;
}

interface FranchiseDoc {
  hubUid: string;
  name: string;
  locationUids: string[];
  urlEnding?: string;
  onlineStoreActive?: boolean;
  createdAt?: any;
  locations?: LocationDoc[];
}

function FranchisesList() {
  const [franchises, setFranchises] = useState<FranchiseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState<string | null>(null);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const alertP = useAlert();

  useEffect(() => {
    db.collection("franchises")
      .get()
      .then((snap) => {
        const docs: FranchiseDoc[] = [];
        snap.forEach((doc) => {
          docs.push({ ...doc.data(), hubUid: doc.id } as FranchiseDoc);
        });
        setFranchises(docs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadLocations = async (hubUid: string) => {
    if (expandedUid === hubUid) {
      setExpandedUid(null);
      return;
    }
    setExpandedUid(hubUid);
    setLocationLoading(hubUid);
    try {
      const locSnap = await db.collection("franchises").doc(hubUid).collection("locations").get();
      const locs: LocationDoc[] = [];
      locSnap.forEach((doc) => locs.push({ ...doc.data(), uid: doc.id } as LocationDoc));
      setFranchises((prev) =>
        prev.map((f) => (f.hubUid === hubUid ? { ...f, locations: locs } : f))
      );
    } catch {
      alertP.error("Failed to load locations");
    }
    setLocationLoading(null);
  };

  const handleAddLocation = async (hubUid: string) => {
    const { value: formValues } = await Swal.fire({
      title: "Add Franchise Location",
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:13px; font-weight:600; color:#344054; display:block; margin-bottom:4px;">Location Name *</label>
            <input id="swal-name" class="swal2-input" placeholder='e.g. "Downtown"' style="margin:0; width:100%; box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#344054; display:block; margin-bottom:4px;">Login Email *</label>
            <input id="swal-email" class="swal2-input" placeholder="location@company.com" style="margin:0; width:100%; box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#344054; display:block; margin-bottom:4px;">Login Password *</label>
            <input id="swal-password" class="swal2-input" type="password" placeholder="Min 6 characters" style="margin:0; width:100%; box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#344054; display:block; margin-bottom:4px;">Phone Number</label>
            <input id="swal-phone" class="swal2-input" placeholder="(123) 456-7890" maxlength="10" style="margin:0; width:100%; box-sizing:border-box;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create Location",
      confirmButtonColor: "#1D294E",
      preConfirm: () => {
        const name = (document.getElementById("swal-name") as HTMLInputElement)?.value;
        const email = (document.getElementById("swal-email") as HTMLInputElement)?.value;
        const password = (document.getElementById("swal-password") as HTMLInputElement)?.value;
        const phone = (document.getElementById("swal-phone") as HTMLInputElement)?.value;
        if (!name || !email || !password) {
          Swal.showValidationMessage("Name, email, and password are required");
          return;
        }
        if (password.length < 6) {
          Swal.showValidationMessage("Password must be at least 6 characters");
          return;
        }
        if (phone && !isValidPhone(phone)) {
          Swal.showValidationMessage("Phone must be 10 digits");
          return;
        }
        return { name, email, password, phone };
      },
    });

    if (!formValues) return;

    setCreatingLocation(true);
    try {
      const createFn = firebase.functions().httpsCallable("createFranchiseLocation");
      const result = await createFn({
        hubUid,
        email: formValues.email,
        password: formValues.password,
        locationName: formValues.name,
        phoneNumber: formValues.phone || "",
        acceptDelivery: false,
        deliveryPrice: "",
        deliveryRange: "",
      });

      if (result.data?.success) {
        alertP.success(`Location "${formValues.name}" created (${formValues.email})`);

        // Update local state
        const newLoc: LocationDoc = {
          uid: result.data.locationUid,
          name: formValues.name,
          phoneNumber: formValues.phone || "",
          isActive: true,
        };
        setFranchises((prev) =>
          prev.map((f) => {
            if (f.hubUid !== hubUid) return f;
            return {
              ...f,
              locationUids: [...(f.locationUids || []), result.data.locationUid],
              locations: [...(f.locations || []), newLoc],
            };
          })
        );
      }
    } catch (err: any) {
      alertP.error(err.message || "Failed to create location");
    }
    setCreatingLocation(false);
  };

  const handleCreateFranchise = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Create Franchise",
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-size:13px; font-weight:600; color:#344054; display:block; margin-bottom:4px;">Account UID *</label>
            <input id="swal-uid" class="swal2-input" placeholder="Existing user UID" style="margin:0; width:100%; box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px; font-weight:600; color:#344054; display:block; margin-bottom:4px;">Franchise Name *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g. Pizza Palace" style="margin:0; width:100%; box-sizing:border-box;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create",
      confirmButtonColor: "#1D294E",
      preConfirm: () => {
        const uid = (document.getElementById("swal-uid") as HTMLInputElement)?.value;
        const name = (document.getElementById("swal-name") as HTMLInputElement)?.value;
        if (!uid || !name) {
          Swal.showValidationMessage("UID and name are required");
          return;
        }
        return { uid, name };
      },
    });

    if (!formValues) return;

    try {
      const createFn = firebase.functions().httpsCallable("createFranchise");
      await createFn(formValues);
      alertP.success(`Franchise "${formValues.name}" created`);
      setFranchises((prev) => [
        ...prev,
        { hubUid: formValues.uid, name: formValues.name, locationUids: [] },
      ]);
    } catch (err: any) {
      alertP.error(err.message || "Failed to create franchise");
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.title}>Franchises</span>
        <button style={styles.createBtn} onClick={handleCreateFranchise}>
          <FiPlus size={16} color="#fff" />
          <span style={styles.createBtnTxt}>Create Franchise</span>
        </button>
      </div>

      {loading ? (
        <span style={styles.loadingText}>Loading...</span>
      ) : franchises.length === 0 ? (
        <div style={styles.emptyState}>
          <FiGlobe size={32} color="#cbd5e1" />
          <span style={styles.emptyTitle}>No franchises yet</span>
          <span style={styles.emptySubtitle}>Create a franchise from an existing account</span>
        </div>
      ) : (
        <div style={styles.list}>
          {franchises.map((f) => {
            const isExpanded = expandedUid === f.hubUid;
            return (
              <div key={f.hubUid} style={styles.cardWrapper}>
                <button
                  style={styles.card}
                  onClick={() => loadLocations(f.hubUid)}
                >
                  <div style={styles.cardIcon}>
                    <FiGlobe size={20} color="#6366f1" />
                  </div>
                  <div style={styles.cardInfo}>
                    <span style={styles.cardName}>{f.name}</span>
                    <span style={styles.cardDetail}>Hub: {f.hubUid.slice(0, 16)}...</span>
                  </div>
                  <div style={styles.cardBadge}>
                    <FiMapPin size={12} color="#64748b" />
                    <span style={styles.cardBadgeText}>{f.locationUids?.length ?? 0} locations</span>
                  </div>
                  {isExpanded ? <FiChevronUp size={18} color="#94a3b8" /> : <FiChevronDown size={18} color="#94a3b8" />}
                </button>

                {isExpanded && (
                  <div style={styles.expandedSection}>
                    {locationLoading === f.hubUid ? (
                      <span style={styles.loadingText}>Loading locations...</span>
                    ) : (
                      <>
                        {(f.locations ?? []).length === 0 ? (
                          <span style={{ fontSize: 13, color: "#94a3b8", padding: "8px 0" }}>No locations added yet</span>
                        ) : (
                          (f.locations ?? []).map((loc) => (
                            <div key={loc.uid} style={styles.locationRow}>
                              <FiUser size={14} color="#64748b" />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={styles.locationName}>{loc.name}</span>
                                <span style={styles.locationUid}>{loc.uid}</span>
                              </div>
                              <button
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                                title="Delete location account"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { isConfirmed } = await Swal.fire({
                                    title: `Delete "${loc.name}"?`,
                                    text: "This will permanently delete this location account and all its data.",
                                    showCancelButton: true,
                                    confirmButtonText: "Delete",
                                    confirmButtonColor: "#ef4444",
                                  });
                                  if (!isConfirmed) return;
                                  try {
                                    const deleteFn = firebase.functions().httpsCallable("deleteAccount");
                                    await deleteFn({ uid: loc.uid });
                                    // Remove from franchise doc
                                    await db.collection("franchises").doc(f.hubUid).collection("locations").doc(loc.uid).delete();
                                    await db.collection("franchises").doc(f.hubUid).update({
                                      locationUids: firebase.firestore.FieldValue.arrayRemove(loc.uid),
                                    });
                                    // Remove from public doc
                                    const pubDoc = await db.collection("public").doc(f.hubUid).get();
                                    if (pubDoc.exists) {
                                      const locs = (pubDoc.data()?.locations || []).filter((l: any) => l.uid !== loc.uid);
                                      await db.collection("public").doc(f.hubUid).update({ locations: locs });
                                    }
                                    // Update local state
                                    setFranchises((prev) => prev.map((fr) => {
                                      if (fr.hubUid !== f.hubUid) return fr;
                                      return {
                                        ...fr,
                                        locationUids: (fr.locationUids || []).filter((u) => u !== loc.uid),
                                        locations: (fr.locations || []).filter((l) => l.uid !== loc.uid),
                                      };
                                    }));
                                    alertP.success(`"${loc.name}" deleted`);
                                  } catch (err: any) {
                                    alertP.error(err.message || "Delete failed");
                                  }
                                }}
                              >
                                <FiTrash2 size={14} color="#ef4444" />
                              </button>
                            </div>
                          ))
                        )}
                        <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                          <button
                            style={styles.addLocationBtn}
                            onClick={() => handleAddLocation(f.hubUid)}
                            disabled={creatingLocation}
                          >
                            <FiPlus size={14} color="#6366f1" />
                            <span style={styles.addLocationTxt}>
                              {creatingLocation ? "Creating..." : "Add Location"}
                            </span>
                          </button>
                          <button
                            style={{ ...styles.addLocationBtn, borderColor: "#fbbf24", backgroundColor: "#fffbeb" }}
                            onClick={async () => {
                              try {
                                const syncFn = firebase.functions().httpsCallable("rebuildFranchiseLocations");
                                const result = await syncFn({ hubUid: f.hubUid });
                                alertP.success(`Synced ${result.data?.count ?? 0} locations to online store`);
                                // Reload locations
                                loadLocations(f.hubUid);
                                setExpandedUid(null);
                                setTimeout(() => loadLocations(f.hubUid), 100);
                              } catch (err: any) {
                                alertP.error(err.message || "Sync failed");
                              }
                            }}
                          >
                            <span style={{ ...styles.addLocationTxt, color: "#b45309" }}>Sync to Online Store</span>
                          </button>
                          <button
                            style={{ ...styles.addLocationBtn, borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}
                            onClick={async () => {
                              const { value: confirmed } = await Swal.fire({
                                title: `Delete "${f.name}"?`,
                                html: `<div style="text-align:left;">
                                  <p>This will remove the franchise and disconnect all locations.</p>
                                  <label style="display:flex;align-items:center;gap:8px;margin-top:12px;cursor:pointer;">
                                    <input type="checkbox" id="swal-delete-accounts" />
                                    <span style="font-size:13px;">Also delete all location accounts</span>
                                  </label>
                                </div>`,
                                showCancelButton: true,
                                confirmButtonText: "Delete Franchise",
                                confirmButtonColor: "#ef4444",
                                preConfirm: () => {
                                  const deleteAccounts = (document.getElementById("swal-delete-accounts") as HTMLInputElement)?.checked;
                                  return { deleteAccounts };
                                },
                              });
                              if (!confirmed) return;
                              try {
                                const deleteFn = firebase.functions().httpsCallable("deleteFranchise");
                                await deleteFn({ hubUid: f.hubUid, deleteLocationAccounts: confirmed.deleteAccounts });
                                alertP.success(`Franchise "${f.name}" deleted`);
                                setFranchises((prev) => prev.filter((fr) => fr.hubUid !== f.hubUid));
                                setExpandedUid(null);
                              } catch (err: any) {
                                alertP.error(err.message || "Delete failed");
                              }
                            }}
                          >
                            <FiTrash2 size={14} color="#ef4444" />
                            <span style={{ ...styles.addLocationTxt, color: "#ef4444" }}>Delete Franchise</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c294e",
  },
  createBtn: {
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
  createBtnTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  loadingText: {
    fontSize: 14,
    color: "#94a3b8",
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardWrapper: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  card: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: "18px 20px",
    width: "100%",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  cardDetail: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  cardBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  expandedSection: {
    padding: "0 20px 16px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingTop: 12,
  },
  locationRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  locationName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
  },
  locationUid: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "monospace",
    display: "block",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  addLocationBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "10px 16px",
    backgroundColor: "#eef2ff",
    border: "1px dashed #c7d2fe",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 4,
  },
  addLocationTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },
};

export default FranchisesList;
