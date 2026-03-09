import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { db } from "services/firebase/config";
import { AccountSummary } from "store/superAdminState";
import { FiSearch, FiChevronRight } from "react-icons/fi";

const AccountsList: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsub = db.collection("users").onSnapshot(
      (snap) => {
        const list: AccountSummary[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          list.push({
            uid: doc.id,
            email: data.ownerDetails?.email || "N/A",
            storeName: data.storeDetails?.name || "No store name",
            ownerName: data.ownerDetails?.name || "N/A",
            phoneNumber: data.ownerDetails?.phoneNumber || "N/A",
            hasFreeTrial: !!data.freeTrial,
          });
        });
        setAccounts(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const filtered = accounts.filter(
    (a) =>
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.storeName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Loading accounts...</span>
      </div>
    );
  }

  return (
    <div>
      <span style={styles.pageTitle}>
        Accounts ({accounts.length})
      </span>
      <div style={styles.searchContainer}>
        <FiSearch size={16} color="#8e8e93" />
        <input
          style={styles.searchInput}
          placeholder="Search by name, email, or store..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={{ ...styles.headerCell, flex: 2 }}>Owner</span>
          <span style={{ ...styles.headerCell, flex: 2 }}>Email</span>
          <span style={{ ...styles.headerCell, flex: 2 }}>Store Name</span>
          <span style={{ ...styles.headerCell, flex: 1 }}>Phone</span>
          <span style={{ ...styles.headerCell, width: 30 }} />
        </div>
        {filtered.map((account) => (
          <button
            key={account.uid}
            style={styles.tableRow}
            onClick={() =>
              history.push(`/superadmin/accounts/${account.uid}`)
            }
            className="admin-card"
          >
            <span style={{ ...styles.cell, flex: 2, fontWeight: "600" }}>
              {account.ownerName}
            </span>
            <span style={{ ...styles.cell, flex: 2, color: "#555" }}>
              {account.email}
            </span>
            <span style={{ ...styles.cell, flex: 2 }}>
              {account.storeName}
            </span>
            <span style={{ ...styles.cell, flex: 1, color: "#888" }}>
              {account.phoneNumber}
            </span>
            <span style={{ width: 30, alignItems: "center" }}>
              <FiChevronRight size={16} color="#ccc" />
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>No accounts found.</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c294e",
    marginBottom: 16,
  },
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    gap: 10,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    fontSize: 14,
    color: "#333",
    backgroundColor: "transparent",
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fafbfc",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8e8e93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "14px 16px",
    cursor: "pointer",
    transition: "background-color 0.15s",
    textAlign: "left",
    width: "100%",
    background: "none",
    border: "none",
    borderBottom: "1px solid #f0f0f0",
  },
  cell: {
    fontSize: 14,
    color: "#333",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#8e8e93",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  loadingText: {
    fontSize: 16,
    color: "#8e8e93",
  },
};

export default AccountsList;
