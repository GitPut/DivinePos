import React, { useEffect, useState } from "react";
import { db } from "services/firebase/config";
import { FiSearch, FiGlobe, FiTrash2, FiExternalLink, FiChevronRight } from "react-icons/fi";
import { useAlert } from "react-alert";
import Swal from "sweetalert2";

interface OnlineStoreItem {
  uid: string;
  storeName: string;
  urlEnding: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  active: boolean;
  productCount: number;
  brandColor: string;
  tagline: string;
  hasLogo: boolean;
  logoUrl: string;
  stripeConfigured: boolean;
}

const OnlineStores: React.FC = () => {
  const [stores, setStores] = useState<OnlineStoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const alertP = useAlert();

  useEffect(() => {
    const unsub = db.collection("public").onSnapshot(
      async (snap) => {
        const items: OnlineStoreItem[] = [];
        for (const doc of snap.docs) {
          const data = doc.data();
          if (!data.urlEnding) continue;

          // Get product count
          const productSnap = await db
            .collection("public")
            .doc(doc.id)
            .collection("products")
            .get();

          // Get owner details from user doc
          let ownerName = "";
          let ownerEmail = "";
          let phone = "";
          let active = false;
          try {
            const userDoc = await db.collection("users").doc(doc.id).get();
            const userData = userDoc.data();
            ownerName = userData?.ownerDetails?.name ?? "";
            ownerEmail = userData?.ownerDetails?.email ?? "";
            phone = userData?.ownerDetails?.phoneNumber ?? "";
            active = userData?.onlineStoreActive ?? false;
          } catch {}

          items.push({
            uid: doc.id,
            storeName: data.storeDetails?.name ?? "Unnamed",
            urlEnding: data.urlEnding,
            ownerName,
            ownerEmail,
            phone,
            active,
            productCount: productSnap.size,
            brandColor: data.brandColor ?? "#0d0d0d",
            tagline: data.tagline ?? "",
            hasLogo: data.storeDetails?.hasLogo ?? false,
            logoUrl: data.storeDetails?.logoUrl ?? "",
            stripeConfigured: !!(data.stripePublicKey && data.stripePublicKey.length > 0),
          });
        }
        setStores(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const filtered = stores.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      s.storeName.toLowerCase().includes(q) ||
      s.urlEnding.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q) ||
      s.ownerEmail.toLowerCase().includes(q)
    );
  });

  const deleteOnlineStore = async (store: OnlineStoreItem) => {
    const result = await Swal.fire({
      title: `Delete online store?`,
      html: `This will remove the public store for <b>${store.storeName}</b> (/order/${store.urlEnding}). The user account will NOT be deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete Store",
    });
    if (!result.isConfirmed) return;

    try {
      // Delete all public products
      const productSnap = await db
        .collection("public")
        .doc(store.uid)
        .collection("products")
        .get();
      const batch = db.batch();
      productSnap.docs.forEach((doc) => batch.delete(doc.ref));
      // Delete the public doc
      batch.delete(db.collection("public").doc(store.uid));
      // Reset online store flags on user doc
      batch.update(db.collection("users").doc(store.uid), {
        onlineStoreActive: false,
        onlineStoreSetUp: false,
      });
      await batch.commit();
      alertP.success(`Deleted online store for ${store.storeName}`);
    } catch (err) {
      console.error("Delete online store error:", err);
      alertP.error("Failed to delete online store");
    }
  };

  const toggleActive = async (store: OnlineStoreItem) => {
    try {
      const newActive = !store.active;
      await db.collection("users").doc(store.uid).update({
        onlineStoreActive: newActive,
      });
      await db.collection("public").doc(store.uid).update({
        onlineStoreActive: newActive,
      });
      setStores((prev) =>
        prev.map((s) => (s.uid === store.uid ? { ...s, active: newActive } : s))
      );
      alertP.success(`Store ${newActive ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error("Toggle active error:", err);
      alertP.error("Failed to update store status");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <span style={styles.pageTitle}>Online Stores</span>
          <span style={styles.subtitle}>
            {stores.length} store{stores.length !== 1 ? "s" : ""} configured
          </span>
        </div>
      </div>

      <div style={styles.searchRow}>
        <FiSearch size={16} color="#94a3b8" />
        <input
          style={styles.searchInput}
          placeholder="Search by store name, URL, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={styles.loadingState}>
          <span style={styles.loadingText}>Loading stores...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <FiGlobe size={32} color="#cbd5e1" />
          <span style={styles.emptyTitle}>
            {search ? "No stores match your search" : "No online stores set up yet"}
          </span>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <div style={styles.tableHeader}>
            <span style={{ ...styles.headerCell, flex: 2 }}>Store</span>
            <span style={{ ...styles.headerCell, flex: 1.5 }}>URL</span>
            <span style={{ ...styles.headerCell, flex: 1.5 }}>Owner</span>
            <span style={{ ...styles.headerCell, width: 80, textAlign: "center" }}>Products</span>
            <span style={{ ...styles.headerCell, width: 80, textAlign: "center" }}>Stripe</span>
            <span style={{ ...styles.headerCell, width: 80, textAlign: "center" }}>Status</span>
            <span style={{ ...styles.headerCell, width: 100, textAlign: "center" }}>Actions</span>
          </div>
          <div style={styles.tableBody}>
            {filtered.map((store) => (
              <div key={store.uid} style={styles.row}>
                <div style={{ ...styles.cell, flex: 2, gap: 8, flexDirection: "row", alignItems: "center" }}>
                  {store.hasLogo && store.logoUrl ? (
                    <img src={store.logoUrl} alt="" style={styles.logoThumb} />
                  ) : (
                    <div style={{ ...styles.logoThumb, backgroundColor: store.brandColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                        {store.storeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={styles.storeName}>{store.storeName}</span>
                    {store.tagline && (
                      <span style={styles.tagline}>{store.tagline}</span>
                    )}
                  </div>
                </div>
                <div style={{ ...styles.cell, flex: 1.5 }}>
                  <span style={styles.urlText}>/order/{store.urlEnding}</span>
                </div>
                <div style={{ ...styles.cell, flex: 1.5 }}>
                  <span style={styles.ownerName}>{store.ownerName || store.ownerEmail}</span>
                  {store.ownerName && store.ownerEmail && (
                    <span style={styles.ownerEmail}>{store.ownerEmail}</span>
                  )}
                </div>
                <div style={{ ...styles.cell, width: 80, justifyContent: "center" }}>
                  <span style={styles.countBadge}>{store.productCount}</span>
                </div>
                <div style={{ ...styles.cell, width: 80, justifyContent: "center" }}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(store.stripeConfigured
                        ? { backgroundColor: "#dcfce7", color: "#15803d" }
                        : { backgroundColor: "#fef3c7", color: "#b45309" }),
                    }}
                  >
                    {store.stripeConfigured ? "Yes" : "No"}
                  </span>
                </div>
                <div style={{ ...styles.cell, width: 80, justifyContent: "center" }}>
                  <button
                    style={{
                      ...styles.statusToggle,
                      ...(store.active
                        ? { backgroundColor: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0" }
                        : { backgroundColor: "#fee2e2", color: "#dc2626", borderColor: "#fecaca" }),
                    }}
                    onClick={() => toggleActive(store)}
                  >
                    {store.active ? "Active" : "Off"}
                  </button>
                </div>
                <div style={{ ...styles.cell, width: 100, justifyContent: "center", flexDirection: "row", gap: 6 }}>
                  <a
                    href={`/order/${store.urlEnding}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.iconBtn}
                    title="View store"
                  >
                    <FiExternalLink size={14} color="#64748b" />
                  </a>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteOnlineStore(store)}
                    title="Delete store"
                  >
                    <FiTrash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c294e",
    display: "block",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 4,
    display: "block",
  },
  searchRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "transparent",
  },
  loadingState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
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
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  tableWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  headerCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableBody: {
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  cell: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflow: "hidden",
  },
  logoThumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
    objectFit: "contain",
    flexShrink: 0,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tagline: {
    fontSize: 11,
    color: "#94a3b8",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  urlText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ownerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ownerEmail: {
    fontSize: 11,
    color: "#94a3b8",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  countBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: 6,
  },
  statusToggle: {
    fontSize: 11,
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: 6,
    border: "1px solid",
    cursor: "pointer",
    background: "none",
  },
  iconBtn: {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
  },
  deleteBtn: {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 6,
    cursor: "pointer",
    padding: 0,
  },
};

export default OnlineStores;
