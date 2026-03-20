import React, { useState } from "react";
import { FiChevronLeft, FiX, FiPhone, FiMapPin, FiEdit3, FiCheck, FiTrash2, FiPlus } from "react-icons/fi";
import OrderItem from "./OrderItem";
import { auth, db } from "services/firebase/config";
import {
  customersState,
  setCartState,
  setCustomersState,
  storeDetailsState,
} from "store/appState";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GooglePlacesStyles } from "utils/googlePlacesStyles";
import { updatePosState } from "store/posState";
import { CustomerProp } from "types";
import useWindowSize from "shared/hooks/useWindowSize";

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
  const [edit, setEdit] = useState(false);
  const [newName, setnewName] = useState(customerSelected.name);
  const [newPhoneNumber, setnewPhoneNumber] = useState(customerSelected.phone);
  const [newAddress, setnewAddress] = useState(customerSelected.address);
  const [newUnitNumber, setnewUnitNumber] = useState(customerSelected.unitNumber);
  const [newBuzzCode, setnewBuzzCode] = useState(customerSelected.buzzCode);

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
            {edit ? "Edit Customer" : `${customerSelected.name}'s Orders`}
          </span>
          <button style={styles.navBtn} onClick={() => { setcustomerSelected(null); closeAll(); }}>
            <FiX size={16} color="#64748b" />
          </button>
        </div>

        {/* Customer Info Card */}
        <div style={styles.infoCard}>
          {edit ? (
            <div style={styles.editForm}>
              <div style={styles.editRow}>
                <span style={styles.editLabel}>Name</span>
                <input style={styles.editInput} value={newName} onChange={(e) => setnewName(e.target.value)} placeholder="Name" />
              </div>
              <div style={styles.editRow}>
                <span style={styles.editLabel}>Phone</span>
                <input style={styles.editInput} value={newPhoneNumber} onChange={(e) => setnewPhoneNumber(e.target.value)} placeholder="Phone" />
              </div>
              <div style={styles.editRow}>
                <span style={styles.editLabel}>Address</span>
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
              <div style={styles.editRowSmall}>
                <input style={styles.smallInput} placeholder="Unit #" value={newUnitNumber ?? ""} onChange={(e) => setnewUnitNumber(e.target.value)} />
                <input style={styles.smallInput} placeholder="Buzz #" value={newBuzzCode ?? ""} onChange={(e) => setnewBuzzCode(e.target.value)} />
              </div>
            </div>
          ) : (
            <div style={styles.infoRows}>
              <div style={styles.infoRow}>
                <FiPhone size={15} color="#64748b" />
                <span style={styles.infoValue}>{customerSelected.phone || "No phone"}</span>
              </div>
              <div style={styles.infoRow}>
                <FiMapPin size={15} color="#64748b" />
                <span style={styles.infoValue}>
                  {customerSelected.address?.label || "No address"}
                  {customerSelected.unitNumber && ` · Unit ${customerSelected.unitNumber}`}
                  {customerSelected.buzzCode && ` · Buzz ${customerSelected.buzzCode}`}
                </span>
              </div>
            </div>
          )}
          <div style={styles.infoActions}>
            {edit ? (
              <button style={styles.saveBtn} onClick={saveEdits}>
                <FiCheck size={14} color="#fff" />
                <span style={styles.saveBtnTxt}>Save</span>
              </button>
            ) : (
              <button style={styles.editBtn} onClick={() => setEdit(true)}>
                <FiEdit3 size={14} color="#64748b" />
                <span style={styles.editBtnTxt}>Edit</span>
              </button>
            )}
            <button style={styles.deleteCustomerBtn} onClick={deleteCustomer}>
              <FiTrash2 size={14} color="#ef4444" />
            </button>
          </div>
        </div>

        {/* Order History */}
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
              <span style={styles.emptyOrdersTxt}>No order history</span>
            </div>
          )}
        </div>

        {/* Add New Order */}
        <div style={styles.footer}>
          <button
            style={styles.newOrderBtn}
            onClick={() => {
              updatePosState({ deliveryChecked: false, ongoingDelivery: true, name: customerSelected.name, phone: customerSelected.phone, address: customerSelected.address, buzzCode: customerSelected.buzzCode, unitNumber: customerSelected.unitNumber });
              setcustomerSelected(null);
              closeAll();
            }}
          >
            <FiPlus size={15} color="#fff" />
            <span style={styles.newOrderTxt}>New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 480,
    maxHeight: 620,
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
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  navBtn: {
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
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  // Info Card
  infoCard: {
    margin: "16px 20px 0",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flexShrink: 0,
  },
  infoRows: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "500",
  },
  infoActions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  editBtn: {
    height: 32,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    cursor: "pointer",
  },
  editBtnTxt: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  saveBtn: {
    height: 32,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#10b981",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  saveBtnTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  deleteCustomerBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  // Edit Form
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  editRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    width: 60,
    flexShrink: 0,
  },
  editInput: {
    flex: 1,
    height: 38,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    backgroundColor: "#fff",
  },
  editRowSmall: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginLeft: 70,
  },
  smallInput: {
    width: 90,
    height: 38,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 10px",
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    textAlign: "center" as const,
    backgroundColor: "#fff",
  },
  // Orders
  ordersScroll: {
    flex: 1,
    overflow: "auto",
    padding: "16px 20px",
  },
  emptyOrders: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 0",
  },
  emptyOrdersTxt: {
    fontSize: 14,
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
    height: 42,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
  },
  newOrderTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
};

export default CustomerDetailsModal;
