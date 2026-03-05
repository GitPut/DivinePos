import React, { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { FaPhone, FaTrash } from "react-icons/fa";
import { MdCheck, MdEdit, MdHome } from "react-icons/md";
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
  const [newUnitNumber, setnewUnitNumber] = useState(
    customerSelected.unitNumber,
  );
  const [newBuzzCode, setnewBuzzCode] = useState(customerSelected.buzzCode);

  const removeCustomerOrder = (removeIndex: number) => {
    const updatedOrderHistory = structuredClone(customerSelected.orders);
    updatedOrderHistory.splice(removeIndex, 1);
    db.collection("users")
      .doc(auth.currentUser?.uid)
      .collection("customers")
      .doc(customerSelected.id)
      .update({
        orders: updatedOrderHistory,
      });
    setcustomerSelected({
      orders: updatedOrderHistory,
      name: customerSelected.name,
      phone: customerSelected.phone,
      address: customerSelected.address,
      buzzCode: customerSelected.buzzCode,
      unitNumber: customerSelected.unitNumber,
      id: customerSelected.id,
    });
  };

  return (
    <div style={{ cursor: "default" }}>
      <div style={styles.container}>
        <div style={styles.topGroup}>
          <div style={styles.topRow}>
            <button
              onClick={() => {
                setcustomerSelected(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <FiChevronLeft style={styles.goBackIcon} />
            </button>
            <button
              onClick={() => {
                setcustomerSelected(null);
                closeAll();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <IoClose style={styles.closeIcon} />
            </button>
          </div>
          {edit ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                placeholder="Name"
                style={{
                  borderRadius: 10,
                  fontSize: 20,
                  fontWeight: "bold",
                  padding: 10,
                  borderWidth: 1,
                  borderColor: "grey",
                  borderStyle: "solid" as const,
                  maxWidth: 200,
                  width: 5 * newName.length,
                  minWidth: 80,
                  boxSizing: "border-box" as const,
                }}
                value={newName}
                onChange={(e) => setnewName(e.target.value)}
              />
              <span style={styles.georgesOrders}>&apos;s Orders</span>
            </div>
          ) : (
            <span style={styles.georgesOrders}>
              {customerSelected.name}&apos;s Orders
            </span>
          )}
        </div>
        <div style={styles.bottomContainer}>
          <div
            style={{
              ...styles.customerDetailsContainer,
              ...(edit && { height: 200 }),
            }}
          >
            <div style={styles.customerPhoneNumberRow}>
              <FaPhone style={styles.phoneIcon} />
              {edit ? (
                <input
                  placeholder="Phone Number"
                  style={{
                    height: 40,
                    borderRadius: 10,
                    fontSize: 15,
                    backgroundColor: "white",
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderStyle: "solid" as const,
                    boxSizing: "border-box" as const,
                  }}
                  value={newPhoneNumber}
                  onChange={(e) => setnewPhoneNumber(e.target.value)}
                />
              ) : (
                <span style={styles.phoneNumber}>{customerSelected.phone}</span>
              )}
            </div>
            <div
              style={{
                ...styles.addressRow,
                ...(edit && { alignItems: "flex-start", height: 95 }),
              }}
            >
              <MdHome style={styles.addressIcon} />
              {edit ? (
                <div style={{ width: 400 }}>
                  <div
                    style={{
                      width: "60%",
                      height: 40,
                      marginBottom: 15,
                    }}
                  >
                    <GooglePlacesAutocomplete
                      apiOptions={{
                        region: "CA",
                      }}
                      debounce={800}
                      apiKey={GOOGLE_API_KEY}
                      selectProps={{
                        value: newAddress,
                        onChange: setnewAddress,
                        placeholder: "Enter customer's address",
                        defaultValue: newAddress,
                        menuPortalTarget: document.body,
                        styles: GooglePlacesStyles,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <input
                      placeholder="Unit #"
                      style={{
                        width: "18%",
                        height: 40,
                        backgroundColor: "rgba(255,255,255,1)",
                        borderWidth: 1,
                        borderColor: "grey",
                        borderRadius: 10,
                        padding: 10,
                        marginRight: 15,
                        borderStyle: "solid" as const,
                        boxSizing: "border-box" as const,
                      }}
                      value={newUnitNumber ? newUnitNumber : ""}
                      onChange={(e) => setnewUnitNumber(e.target.value)}
                    />
                    <input
                      placeholder="Buzz #"
                      style={{
                        width: "18%",
                        height: 40,
                        backgroundColor: "rgba(255,255,255,1)",
                        borderWidth: 1,
                        borderColor: "grey",
                        borderRadius: 10,
                        padding: 10,
                        borderStyle: "solid" as const,
                        boxSizing: "border-box" as const,
                      }}
                      value={newBuzzCode ? newBuzzCode : ""}
                      onChange={(e) => setnewBuzzCode(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {customerSelected.address ? (
                    <>
                      {!customerSelected.unitNumber &&
                      !customerSelected.buzzCode ? (
                        <span style={styles.address}>
                          {customerSelected.address?.label
                            ? customerSelected.address?.label
                            : "No Address"}
                        </span>
                      ) : (
                        <div style={styles.addressGroup}>
                          <span style={styles.address}>
                            {customerSelected.address?.label
                              ? customerSelected.address?.label
                              : "No Address"}
                          </span>
                          {!customerSelected.unitNumber &&
                            !customerSelected.buzzCode && (
                              <div style={styles.addressExtraDetailsRow}>
                                {customerSelected.unitNumber && (
                                  <span style={styles.unitNumber}>
                                    Unit #: {customerSelected.unitNumber}
                                  </span>
                                )}
                                {customerSelected.buzzCode && (
                                  <span style={styles.buzzCode}>
                                    Buzz Code: {customerSelected.buzzCode}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={styles.address}>No Address</span>
                  )}
                </>
              )}
            </div>
            <div style={styles.customerOptionsBtnRow}>
              {edit ? (
                <button
                  onClick={() => {
                    db.collection("users")
                      .doc(auth.currentUser?.uid)
                      .collection("customers")
                      .doc(customerSelected.id)
                      .update({
                        name: newName,
                        phone: newPhoneNumber,
                        address: newAddress,
                        buzzCode: newBuzzCode,
                        unitNumber: newUnitNumber,
                      });
                    const clone = [...customers];
                    const index = clone.findIndex(
                      (e) => e.id === customerSelected.id,
                    );
                    clone[index] = {
                      ...clone[index],
                      name: newName,
                      phone: newPhoneNumber,
                      address: newAddress,
                      buzzCode: newBuzzCode,
                      unitNumber: newUnitNumber,
                    };
                    setCustomersState(clone);
                    setcustomerSelected({
                      name: newName,
                      phone: newPhoneNumber,
                      address: newAddress,
                      buzzCode: newBuzzCode,
                      unitNumber: newUnitNumber,
                      orders: customerSelected.orders,
                      id: customerSelected.id,
                    });
                    setEdit(false);
                  }}
                  style={{
                    marginRight: 15,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <MdCheck style={styles.editCustomerIcon} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEdit(true);
                  }}
                  style={{
                    marginRight: 15,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <MdEdit style={styles.editCustomerIcon} />
                </button>
              )}
              <button
                onClick={() => {
                  db.collection("users")
                    .doc(auth.currentUser?.uid)
                    .collection("customers")
                    .doc(customerSelected.id)
                    .delete();
                  setCustomersState(
                    customers.filter((e) => e.id !== customerSelected.id),
                  );
                  setcustomerSelected(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <FaTrash style={styles.deleteIcon} />
              </button>
            </div>
          </div>
          <div style={styles.orderScrollView}>
            <div
              style={{
                overflow: "auto",
                paddingTop: 20,
                paddingRight: 15,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {customerSelected.orders?.map((prevOrder, prevOrderIndex) => (
                <OrderItem
                  key={prevOrderIndex}
                  prevOrder={prevOrder}
                  prevOrderIndex={prevOrderIndex}
                  setOrderPickUp={() => {
                    setCartState(prevOrder.cart);
                    updatePosState({
                      deliveryChecked: false,
                      ongoingDelivery: true,
                      name: customerSelected.name,
                      phone: customerSelected.phone,
                      address: customerSelected.address,
                      buzzCode: customerSelected.buzzCode,
                      unitNumber: customerSelected.unitNumber,
                    });
                    setcustomerSelected(null);
                    closeAll();
                  }}
                  setOrderDelivery={() => {
                    setCartState(prevOrder.cart);
                    updatePosState({
                      deliveryChecked: true,
                      ongoingDelivery: true,
                      name: customerSelected.name,
                      phone: customerSelected.phone,
                      address: customerSelected.address,
                      buzzCode: customerSelected.buzzCode,
                      unitNumber: customerSelected.unitNumber,
                    });
                    setcustomerSelected(null);
                    closeAll();
                  }}
                  isDeliverable={
                    storeDetails?.acceptDelivery && customerSelected.address
                      ? true
                      : false
                  }
                  removeCustomerOrder={() => {
                    removeCustomerOrder(prevOrderIndex);
                  }}
                />
              ))}
            </div>
          </div>
          <div style={styles.addNewOrderRow}>
            <button
              onClick={() => {
                updatePosState({
                  deliveryChecked: false,
                  ongoingDelivery: true,
                  name: customerSelected.name,
                  phone: customerSelected.phone,
                  address: customerSelected.address,
                  buzzCode: customerSelected.buzzCode,
                  unitNumber: customerSelected.unitNumber,
                });
                setcustomerSelected(null);
                closeAll();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={styles.addNewOrder}>+ Add New Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,1)",
    width: 540,
    height: 608,
    display: "flex",
    flexDirection: "column",
  },
  topGroup: {
    width: 493,
    height: 59,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
    display: "flex",
    flexDirection: "column",
  },
  topRow: {
    width: 493,
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
  },
  goBackIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
  },
  closeIcon: {
    color: "rgba(0,0,0,1)",
    fontSize: 40,
  },
  georgesOrders: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    display: "inline-block",
  },
  bottomContainer: {
    width: 454,
    height: 454,
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  customerDetailsContainer: {
    width: 439,
    height: 157,
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 10,
    backgroundColor: "#edf1fe",
    display: "flex",
    flexDirection: "column",
  },
  customerPhoneNumberRow: {
    width: 395,
    height: 35,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
    marginTop: 20,
    display: "flex",
  },
  phoneIcon: {
    color: "#1c294e",
    fontSize: 35,
    paddingRight: 15,
  },
  phoneNumber: {
    color: "#121212",
    fontSize: 15,
  },
  addressRow: {
    width: 395,
    height: 42,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
    display: "flex",
  },
  addressIcon: {
    color: "#1c294e",
    fontSize: 35,
    paddingRight: 10,
  },
  addressGroup: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  address: {
    color: "#121212",
    fontSize: 15,
  },
  addressExtraDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    display: "flex",
  },
  unitNumber: {
    color: "#121212",
    fontSize: 15,
    marginRight: 30,
  },
  buzzCode: {
    color: "#121212",
    fontSize: 15,
  },
  customerOptionsBtnRow: {
    width: 395,
    height: 35,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
    display: "flex",
  },
  editCustomerIcon: {
    color: "#1c294e",
    fontSize: 32,
  },
  deleteIcon: {
    color: "#1c294e",
    fontSize: 32,
  },
  orderScrollView: {
    height: 239,
    overflow: "auto",
  },
  addNewOrderRow: {
    width: 439,
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    display: "flex",
  },
  addNewOrder: {
    color: "#121212",
    fontSize: 15,
    textDecoration: "underline",
  },
};

export default CustomerDetailsModal;
