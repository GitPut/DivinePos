import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FiChevronLeft } from "react-icons/fi";
import { customersState } from "store/appState";
import SavedCustomerItem from "./SavedCustomerItem";
import Modal from "shared/components/ui/Modal";
import CustomerDetailsModal from "./CustomerDetailsModal";
import { updatePosState } from "store/posState";
import { CustomerProp } from "types";

const SavedCustomersModal = () => {
  const [customerSelected, setcustomerSelected] = useState<CustomerProp | null>(
    null
  );
  const [search, setsearch] = useState("");
  const customers = customersState.use();

  const closeAll = () => {
    updatePosState({
      saveCustomerModal: false,
      deliveryModal: false,
    });
  };

  return (
    <div style={{ cursor: "default" }}>
      <div style={styles.container}>
        <div style={styles.topGroup}>
          <div style={styles.topRow}>
            <button
              onClick={() => {
                updatePosState({
                  saveCustomerModal: false,
                  deliveryModal: true,
                });
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <FiChevronLeft style={styles.goBackIcon} />
            </button>
            <button
              onClick={closeAll}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <IoClose style={styles.closeIcon} />
            </button>
          </div>
          <span style={styles.savedCustomersTxt}>Saved Customers</span>
        </div>
        <div style={styles.bottomGroup}>
          <input
            style={styles.searchSavedCustomersBox}
            placeholder="Enter Any Customer Details"
            value={search}
            onChange={(e) => setsearch(e.target.value)}
          />
          <div style={styles.scrollArea}>
            <div
              style={{
                overflow: "auto",
                height: 325,
                width: 439,
                paddingRight: 10,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {customers.map((customer) => {
                const newAddress = customer.address?.label
                  ? customer.address?.label.toLowerCase()
                  : "";
                const newName = customer.name
                  ? customer.name?.toLowerCase()
                  : "";
                const lowerCaseSearch = search ? search?.toLowerCase() : "";
                if (
                  search?.length > 0 &&
                  !newName.includes(lowerCaseSearch) &&
                  !customer.phone
                    ?.toLowerCase()
                    .includes(lowerCaseSearch) &&
                  !newAddress.includes(lowerCaseSearch)
                )
                  return null;
                return (
                  <button
                    key={customer.id}
                    onClick={() => setcustomerSelected(customer)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                  >
                    <SavedCustomerItem
                      style={styles.savedCustomerItem}
                      customerName={
                        customer.name ? customer.name : "No Name"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {customerSelected && (
        <Modal
          isVisible={customerSelected !== null}
          onBackdropPress={() => {
            setcustomerSelected(null);
            closeAll();
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CustomerDetailsModal
              setcustomerSelected={setcustomerSelected}
              customerSelected={customerSelected}
              closeAll={closeAll}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SavedCustomersModal;

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "space-around",
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
    display: "flex",
    flexDirection: "column",
  },
  topRow: {
    width: 493,
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
  savedCustomersTxt: {
    fontWeight: "700",
    color: "#121212",
    fontSize: 20,
    display: "block",
  },
  bottomGroup: {
    height: 454,
    justifyContent: "space-around",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  searchSavedCustomersBox: {
    width: 439,
    height: 54,
    backgroundColor: "rgba(255,255,255,1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid" as const,
    padding: 10,
    boxSizing: "border-box" as const,
  },
  scrollArea: {
    height: 325,
    width: 450,
  },
  savedCustomerItem: {
    height: 50,
    width: 439,
    marginBottom: 15,
  },
};
