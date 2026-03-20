import React, { useState } from "react";
import { FiChevronLeft, FiX, FiSearch } from "react-icons/fi";
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
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => updatePosState({ saveCustomerModal: false, deliveryModal: true })}>
            <FiChevronLeft size={18} color="#64748b" />
          </button>
          <span style={styles.title}>Saved Customers</span>
          <button style={styles.closeBtn} onClick={closeAll}>
            <FiX size={16} color="#64748b" />
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <FiSearch size={15} color="#94a3b8" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search by name, phone, or address..."
            value={search}
            onChange={(e) => setsearch(e.target.value)}
          />
        </div>

        {/* Customer List */}
        <div style={styles.listScroll}>
          {customers.map((customer) => {
            const newAddress = customer.address?.label ? customer.address.label.toLowerCase() : "";
            const newName = customer.name ? customer.name.toLowerCase() : "";
            const lowerCaseSearch = search ? search.toLowerCase() : "";
            if (
              search?.length > 0 &&
              !newName.includes(lowerCaseSearch) &&
              !customer.phone?.toLowerCase().includes(lowerCaseSearch) &&
              !newAddress.includes(lowerCaseSearch)
            )
              return null;
            return (
              <button
                key={customer.id}
                onClick={() => setcustomerSelected(customer)}
                style={styles.customerBtn}
              >
                <SavedCustomerItem
                  customerName={customer.name ? customer.name : "No Name"}
                />
              </button>
            );
          })}
          {customers.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyTitle}>No saved customers</span>
              <span style={styles.emptySubtitle}>Customers saved from phone orders will appear here</span>
            </div>
          )}
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
    width: 460,
    maxHeight: 600,
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
  backBtn: {
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
    fontSize: 17,
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
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    flexShrink: 0,
  },
  searchIcon: {
    position: "absolute",
    left: 32,
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    height: 40,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    paddingLeft: 36,
    paddingRight: 12,
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  listScroll: {
    flex: 1,
    overflow: "auto",
    padding: "4px 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  customerBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textAlign: "left" as const,
    width: "100%",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center" as const,
  },
};
