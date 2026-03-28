import React, { useState } from "react";
import { FiChevronLeft, FiX, FiPhone, FiMapPin, FiEdit3, FiCheck, FiTrash2, FiPlus, FiAward, FiStar, FiGift, FiShoppingBag } from "react-icons/fi";
import OrderItem from "./OrderItem";
import { auth, db } from "services/firebase/config";
import {
  customersState,
  loyaltyConfigState,
  setCartState,
  setCustomersState,
  storeDetailsState,
} from "store/appState";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import { updatePosState } from "store/posState";
import { CustomerProp } from "types";
import useWindowSize from "shared/hooks/useWindowSize";
import { sanitizePhone } from "utils/phoneValidation";
import { getTierColor, getTierBadgeBg, formatPoints, getAffordableRewards } from "utils/loyaltyHelpers";

const GOOGLE_API_KEY = "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk";

interface CustomerDetailsModalProps {
  setcustomerSelected: (val: CustomerProp | null) => void;
  customerSelected: CustomerProp;
  closeAll: () => void;
}

function CustomerDetailsModal({
  setcustomerSelected,
  customerSelected,
  closeAll,
}: CustomerDetailsModalProps) {
  const { height, width } = useWindowSize();
  const customers = customersState.use();
  const storeDetails = storeDetailsState.use();
  const loyaltyConfig = loyaltyConfigState.use();
  const [edit, setEdit] = useState(false);
  const [newName, setnewName] = useState(customerSelected.name);
  const [newPhoneNumber, setnewPhoneNumber] = useState(customerSelected.phone);
  const [newAddress, setnewAddress] = useState(customerSelected.address);
  const [newUnitNumber, setnewUnitNumber] = useState(customerSelected.unitNumber);
  const [newBuzzCode, setnewBuzzCode] = useState(customerSelected.buzzCode);

  const customer = customerSelected as any;
  const loyaltyEnabled = loyaltyConfig.enabled;
  const points = customer.loyaltyPoints || 0;
  const lifetimePoints = customer.lifetimePoints || 0;
  const tier = customer.tier || "Bronze";
  const tierColor = getTierColor(tier);
  const tierBg = getTierBadgeBg(tier);
  const orderCount = customer.orderCount || customerSelected.orders?.length || 0;
  const totalSpent = customer.totalSpent || 0;
  const affordableRewards = loyaltyEnabled ? getAffordableRewards(loyaltyConfig, points) : [];

  // Find next tier
  const sortedTiers = [...loyaltyConfig.tiers].sort((a, b) => a.minPoints - b.minPoints);
  const currentTierIndex = sortedTiers.findIndex((t) => t.name === tier);
  const nextTier = currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1
    ? sortedTiers[currentTierIndex + 1]
    : null;
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.minPoints - lifetimePoints) : 0;

  const removeCustomerOrder = (removeIndex: number) => {
    const updatedOrderHistory = structuredClone(customerSelected.orders);
    updatedOrderHistory.splice(removeIndex, 1);
    db.collection("users").doc(auth.currentUser?.uid).collection("customers").doc(customerSelected.id).update({ orders: updatedOrderHistory });
    setcustomerSelected({ orders: updatedOrderHistory, name: customerSelected.name, phone: customerSelected.phone, address: customerSelected.address, buzzCode: customerSelected.buzzCode, unitNumber: customerSelected.unitNumber, id: customerSelected.id });
  };

  const saveEdits = () => {
    db.collection("users").doc(auth.currentUser?.uid).collection("customers").doc(customerSelected.id).update({
      name: newName, phone: newPhoneNumber, address: newAddress, buzzCode: newBuzzCode, unitNumber: newUnitNumber,
    });
    const clone = [...customers];
    const index = clone.findIndex((e) => e.id === customerSelected.id);
    clone[index] = { ...clone[index], name: newName, phone: newPhoneNumber, address: newAddress, buzzCode: newBuzzCode, unitNumber: newUnitNumber };
    setCustomersState(clone);
    setcustomerSelected({ name: newName, phone: newPhoneNumber, address: newAddress, buzzCode: newBuzzCode, unitNumber: newUnitNumber, orders: customerSelected.orders, id: customerSelected.id });
    setEdit(false);
  };

  const deleteCustomer = () => {
    db.collection("users").doc(auth.currentUser?.uid).collection("customers").doc(customerSelected.id).delete();
    setCustomersState(customers.filter((e) => e.id !== customerSelected.id));
    setcustomerSelected(null);
  };

  return (
    <div style={{ cursor: "default" }}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.navBtn} onClick={() => setcustomerSelected(null)}>
            <FiChevronLeft size={18} color="#64748b" />
          </button>
          <span style={styles.title}>
            {edit ? "Edit Customer" : customerSelected.name}
          </span>
          <button style={styles.navBtn} onClick={() => { setcustomerSelected(null); closeAll(); }}>
            <FiX size={16} color="#64748b" />
          </button>
        </div>

        {/* Customer Profile Card */}
        <div style={styles.profileSection}>
          <div style={styles.profileTop}>
            <div style={styles.profileAvatar}>
              <span style={styles.profileAvatarText}>
                {customerSelected.name ? customerSelected.name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
            <div style={styles.profileInfo}>
              {edit ? (
                <input style={styles.editNameInput} value={newName} onChange={(e) => setnewName(e.target.value)} placeholder="Name" />
              ) : (
                <span style={styles.profileName}>{customerSelected.name}</span>
              )}
              <div style={styles.profileMeta}>
                {orderCount > 0 && (
                  <span style={styles.metaItem}>{orderCount} order{orderCount !== 1 ? "s" : ""}</span>
                )}
                {totalSpent > 0 && (
                  <>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.metaItem}>${totalSpent.toFixed(2)} spent</span>
                  </>
                )}
              </div>
            </div>
            <div style={styles.profileActions}>
              {edit ? (
                <button style={styles.saveBtn} onClick={saveEdits}>
                  <FiCheck size={14} color="#fff" />
                </button>
              ) : (
                <button style={styles.editBtn} onClick={() => setEdit(true)}>
                  <FiEdit3 size={14} color="#64748b" />
                </button>
              )}
              <button style={styles.deleteCustomerBtn} onClick={deleteCustomer}>
                <FiTrash2 size={14} color="#ef4444" />
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div style={styles.contactRow}>
            {edit ? (
              <div style={styles.editFields}>
                <div style={styles.editRow}>
                  <FiPhone size={14} color="#94a3b8" />
                  <input style={styles.editInput} value={newPhoneNumber} onChange={(e) => setnewPhoneNumber(sanitizePhone(e.target.value))} maxLength={10} placeholder="Phone" />
                </div>
                <div style={styles.editRow}>
                  <FiMapPin size={14} color="#94a3b8" />
                  <div style={{ flex: 1 }}>
                    <GooglePlacesAutocomplete
                      apiOptions={{ region: "CA" }}
                      debounce={800}
                      apiKey={GOOGLE_API_KEY}
                      selectProps={{
                        value: newAddress,
                        onChange: setnewAddress,
                        placeholder: "Enter address",
                        defaultValue: newAddress,
                        menuPortalTarget: document.body,
                        styles: GooglePlacesStyles,
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: 8, paddingLeft: 28 }}>
                  <input style={{ ...styles.editInput, width: 90, textAlign: "center" as const }} placeholder="Unit #" value={newUnitNumber ?? ""} onChange={(e) => setnewUnitNumber(e.target.value)} />
                  <input style={{ ...styles.editInput, width: 90, textAlign: "center" as const }} placeholder="Buzz #" value={newBuzzCode ?? ""} onChange={(e) => setnewBuzzCode(e.target.value)} />
                </div>
              </div>
            ) : (
              <div style={styles.contactDetails}>
                <div style={styles.contactItem}>
                  <FiPhone size={13} color="#94a3b8" />
                  <span style={styles.contactText}>{customerSelected.phone || "No phone"}</span>
                </div>
                <div style={styles.contactItem}>
                  <FiMapPin size={13} color="#94a3b8" />
                  <span style={styles.contactText}>
                    {customerSelected.address?.label || "No address"}
                    {customerSelected.unitNumber && ` · Unit ${customerSelected.unitNumber}`}
                    {customerSelected.buzzCode && ` · Buzz ${customerSelected.buzzCode}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Card (only when enabled and not editing) */}
        {loyaltyEnabled && !edit && (
          <div style={styles.loyaltyCard}>
            <div style={styles.loyaltyTop}>
              <div style={{ ...styles.tierBadge, backgroundColor: tierColor, boxShadow: `0 2px 8px ${tierColor}40` }}>
                <FiAward size={14} color="#fff" />
                <span style={styles.tierText}>{tier}</span>
              </div>
              <div style={styles.pointsDisplay}>
                <FiStar size={14} color="#6366f1" />
                <span style={styles.pointsValue}>{formatPoints(points)}</span>
                <span style={styles.pointsLabel}>pts</span>
              </div>
            </div>
            {nextTier && pointsToNextTier > 0 && (
              <div style={styles.progressSection}>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${Math.min(100, ((lifetimePoints - (sortedTiers[currentTierIndex]?.minPoints || 0)) / (nextTier.minPoints - (sortedTiers[currentTierIndex]?.minPoints || 0))) * 100)}%`,
                  }} />
                </div>
                <span style={styles.progressText}>
                  {formatPoints(pointsToNextTier)} pts to {nextTier.name}
                </span>
              </div>
            )}
            {affordableRewards.length > 0 && (
              <div style={styles.rewardsAvailable}>
                <FiGift size={12} color="#6366f1" />
                <span style={styles.rewardsText}>
                  {affordableRewards.length} reward{affordableRewards.length !== 1 ? "s" : ""} available to redeem
                </span>
              </div>
            )}
          </div>
        )}

        {/* Order History */}
        <div style={styles.ordersHeader}>
          <FiShoppingBag size={14} color="#64748b" />
          <span style={styles.ordersTitle}>Order History</span>
          <span style={styles.ordersCount}>{customerSelected.orders?.length || 0}</span>
        </div>
        <div style={styles.ordersScroll}>
          {customerSelected.orders?.length > 0 ? (
            customerSelected.orders.map((prevOrder, prevOrderIndex) => (
              <OrderItem
                key={prevOrderIndex}
                prevOrder={prevOrder}
                prevOrderIndex={prevOrderIndex}
                setOrderPickUp={() => {
                  setCartState(prevOrder.cart);
                  updatePosState({ deliveryChecked: false, ongoingDelivery: true, name: customerSelected.name, phone: customerSelected.phone, address: customerSelected.address, buzzCode: customerSelected.buzzCode, unitNumber: customerSelected.unitNumber });
                  setcustomerSelected(null);
                  closeAll();
                }}
                setOrderDelivery={() => {
                  setCartState(prevOrder.cart);
                  updatePosState({ deliveryChecked: true, ongoingDelivery: true, name: customerSelected.name, phone: customerSelected.phone, address: customerSelected.address, buzzCode: customerSelected.buzzCode, unitNumber: customerSelected.unitNumber });
                  setcustomerSelected(null);
                  closeAll();
                }}
                isDeliverable={storeDetails?.acceptDelivery && customerSelected.address ? true : false}
                removeCustomerOrder={() => removeCustomerOrder(prevOrderIndex)}
              />
            ))
          ) : (
            <div style={styles.emptyOrders}>
              <FiShoppingBag size={20} color="#cbd5e1" />
              <span style={styles.emptyOrdersTxt}>No order history yet</span>
            </div>
          )}
        </div>

        {/* Add New Order */}
        <div style={styles.footer}>
          <button
            style={styles.newOrderBtn}
            onClick={() => {
              updatePosState({
                deliveryChecked: false,
                ongoingDelivery: true,
                name: customerSelected.name,
                phone: customerSelected.phone,
                address: customerSelected.address,
                buzzCode: customerSelected.buzzCode,
                unitNumber: customerSelected.unitNumber,
                savedCustomerDetails: customerSelected,
              } as any);
              setcustomerSelected(null);
              closeAll();
            }}
          >
            <FiPlus size={16} color="#fff" />
            <span style={styles.newOrderTxt}>New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 500,
    maxHeight: 650,
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  // Profile Section
  profileSection: {
    padding: "16px 20px 0",
    flexShrink: 0,
  },
  profileTop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1D294E, #334155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  profileMeta: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaItem: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  metaDot: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  profileActions: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
  },
  editBtn: {
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
  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  deleteCustomerBtn: {
    width: 34,
    height: 34,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  editNameInput: {
    height: 32,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    backgroundColor: "#fff",
    width: "100%",
  },
  // Contact
  contactRow: {
    marginTop: 12,
    paddingBottom: 16,
    borderBottom: "1px solid #f1f5f9",
  },
  contactDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  contactItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  editFields: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  editRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  editInput: {
    flex: 1,
    height: 36,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 13,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    backgroundColor: "#fff",
  },
  // Loyalty Card
  loyaltyCard: {
    margin: "12px 20px 0",
    padding: "14px 16px",
    background: "linear-gradient(135deg, #faf5ff, #eef2ff)",
    borderRadius: 12,
    border: "1px solid #e9d5ff",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flexShrink: 0,
  },
  loyaltyTop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 8,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  pointsDisplay: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: "4px 12px",
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    borderRadius: 3,
    transition: "width 0.3s",
  },
  progressText: {
    fontSize: 11,
    color: "#6366f1",
    fontWeight: "600",
  },
  rewardsAvailable: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #c7d2fe",
  },
  rewardsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
  },
  // Orders
  ordersHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "14px 20px 8px",
    flexShrink: 0,
  },
  ordersTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  ordersCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 6,
  },
  ordersScroll: {
    flex: 1,
    overflow: "auto",
    padding: "4px 20px 8px",
  },
  emptyOrders: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    gap: 8,
  },
  emptyOrdersTxt: {
    fontSize: 13,
    color: "#94a3b8",
  },
  // Footer
  footer: {
    padding: "12px 20px 16px",
    borderTop: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  newOrderBtn: {
    width: "100%",
    height: 44,
    background: "linear-gradient(135deg, #1D294E, #2d3a5c)",
    borderRadius: 12,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(29,41,78,0.25)",
  },
  newOrderTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
};

export default CustomerDetailsModal;
