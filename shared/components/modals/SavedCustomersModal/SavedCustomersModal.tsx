import React, { useState } from "react";
import { FiChevronLeft, FiX, FiSearch, FiUsers } from "react-icons/fi";
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

  const filteredCustomers = customers.filter((customer) => {
    if (!search || search.length === 0) return true;
    const lowerSearch = search.toLowerCase();
    const name = customer.name?.toLowerCase() || "";
    const phone = customer.phone?.toLowerCase() || "";
    const address = customer.address?.label?.toLowerCase() || "";
    return name.includes(lowerSearch) || phone.includes(lowerSearch) || address.includes(lowerSearch);
  });

  return (
    <div style={{ cursor: "default" }}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => updatePosState({ saveCustomerModal: false, deliveryModal: true })}>
            <FiChevronLeft size={18} color="#64748b" />
          </button>
          <div style={styles.headerCenter}>
            <span style={styles.title}>Saved Customers</span>
            <span style={styles.count}>{customers.length} customer{customers.length !== 1 ? "s" : ""}</span>
          </div>
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
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setcustomerSelected(customer)}
                style={styles.customerBtn}
              >
                <SavedCustomerItem customer={customer} />
              </button>
            ))
          ) : search.length > 0 ? (
            <div style={styles.emptyState}>
              <FiSearch size={24} color="#cbd5e1" />
              <span style={styles.emptyTitle}>No results</span>
              <span style={styles.emptySubtitle}>No customers match "{search}"</span>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FiUsers size={24} color="#94a3b8" />
              </div>
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
    maxHeight: 620,
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
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  headerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  backBtn: {
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
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  closeBtn: {
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
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    flexShrink: 0,
  },
  searchIcon: {
    position: "absolute",
    left: 34,
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    height: 42,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    paddingLeft: 38,
    paddingRight: 12,
    fontSize: 14,
    color: "#0f172a",
    boxSizing: "border-box" as const,
    outline: "none",
    backgroundColor: "#f8fafc",
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
    gap: 6,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
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
