import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { db } from "services/firebase/config";
import { deleteUserAccount, setUserAccountPlan } from "services/firebase/functions";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { TransListStateItem } from "types";
import { parseDate } from "utils/dateFormatting";
import Modal from "shared/components/ui/Modal";

interface AccountData {
  ownerName: string;
  email: string;
  phoneNumber: string;
  storeName: string;
  storeAddress: string;
  taxRate: string;
  hasFreeTrial: boolean;
  productCount: number;
  deviceCount: number;
  customerCount: number;
  subscriptionStatus: string;
  subscriptionRole: string;
  recentTransactions: TransListStateItem[];
  totalRevenue: number;
  totalOrders: number;
}

const AccountDetail: React.FC<RouteComponentProps<{ uid: string }>> = ({
  match,
}) => {
  const uid = match.params.uid;
  const history = useHistory();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userRef = db.collection("users").doc(uid);
      const [
        userDoc,
        productSnap,
        deviceSnap,
        customerSnap,
        subSnap,
        transSnap,
        statsDoc,
      ] = await Promise.all([
        userRef.get(),
        userRef.collection("products").get(),
        userRef.collection("devices").get(),
        userRef.collection("customers").get(),
        userRef.collection("subscriptions").get(),
        userRef
          .collection("transList")
          .orderBy("date", "desc")
          .limit(10)
          .get(),
        userRef.collection("stats").doc("monthly").get(),
      ]);

      if (!userDoc.exists) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data()!;
      const storeDetails = userData.storeDetails || {};
      const ownerDetails = userData.ownerDetails || {};

      // Find active subscription
      let subscriptionStatus = "None";
      let subscriptionRole = "Free";
      subSnap.forEach((subDoc) => {
        const sub = subDoc.data();
        if (sub.status === "active") {
          subscriptionStatus = "Active";
          subscriptionRole = sub.role || "Unknown";
        } else if (sub.status === "canceled" && subscriptionStatus !== "Active") {
          subscriptionStatus = "Canceled";
          subscriptionRole = sub.role || "Unknown";
        }
      });

      // Get stats
      const statsData = statsDoc.exists ? statsDoc.data() : null;
      let totalRevenue = 0;
      let totalOrders = 0;
      if (statsData?.days) {
        Object.values(statsData.days as Record<string, any>).forEach(
          (day: any) => {
            totalRevenue += day.revenue || 0;
            totalOrders += day.orders || 0;
          }
        );
      }

      // Recent transactions
      const recentTransactions: TransListStateItem[] = [];
      transSnap.forEach((doc) => {
        recentTransactions.push({
          id: doc.id,
          ...doc.data(),
        } as TransListStateItem);
      });

      setData({
        ownerName: ownerDetails.name || "N/A",
        email: ownerDetails.email || "N/A",
        phoneNumber: ownerDetails.phoneNumber || "N/A",
        storeName: storeDetails.name || "No store name",
        storeAddress: storeDetails.address?.label || "No address",
        taxRate: storeDetails.taxRate || "N/A",
        hasFreeTrial: !!userData.freeTrial,
        productCount: productSnap.size,
        deviceCount: deviceSnap.size,
        customerCount: customerSnap.size,
        subscriptionStatus,
        subscriptionRole,
        recentTransactions,
        totalRevenue,
        totalOrders,
      });
      setLoading(false);
    };

    fetchData();
  }, [uid]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Loading account details...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Account not found.</span>
      </div>
    );
  }

  const formatDate = (item: TransListStateItem) => {
    const d = parseDate(item.date as any);
    return d ? d.toLocaleDateString() + " " + d.toLocaleTimeString() : "N/A";
  };

  return (
    <div>
      <button
        style={styles.backBtn}
        onClick={() => history.push("/superadmin/accounts")}
      >
        <FiArrowLeft size={18} />
        <span style={{ marginLeft: 8, fontSize: 14, fontWeight: "600" }}>
          Back to Accounts
        </span>
      </button>

      <span style={styles.pageTitle}>{data.storeName}</span>

      <div style={styles.cardsGrid}>
        {/* Owner Info */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Owner Details</span>
          <InfoRow label="Name" value={data.ownerName} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Phone" value={data.phoneNumber} />
        </div>

        {/* Store Info */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Store Details</span>
          <InfoRow label="Store Name" value={data.storeName} />
          <InfoRow label="Address" value={data.storeAddress} />
          <InfoRow label="Tax Rate" value={data.taxRate + "%"} />
        </div>

        {/* Subscription */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Subscription</span>
          <InfoRow label="Plan" value={data.subscriptionRole} />
          <InfoRow label="Status" value={data.subscriptionStatus} />
          <InfoRow
            label="Free Trial"
            value={data.hasFreeTrial ? "Active" : "No"}
          />
          <div style={styles.planSwitchRow}>
            {(["trial", "starter", "professional"] as const).map((plan) => {
              const labels = { trial: "Trial", starter: "Starter", professional: "Professional" };
              const isCurrent =
                (plan === "trial" && data.hasFreeTrial && data.subscriptionStatus !== "Active") ||
                (plan === "starter" && data.subscriptionRole === "Starter Plan" && data.subscriptionStatus === "Active") ||
                (plan === "professional" && data.subscriptionRole === "Professional Plan" && data.subscriptionStatus === "Active");
              return (
                <button
                  key={plan}
                  style={{
                    ...styles.planBtn,
                    ...(isCurrent ? styles.planBtnActive : {}),
                  }}
                  disabled={isCurrent || switchingPlan !== null}
                  onClick={async () => {
                    setSwitchingPlan(plan);
                    try {
                      await setUserAccountPlan(uid, plan);
                      window.location.reload();
                    } catch (e: any) {
                      alert(e?.message || "Failed to switch plan");
                      setSwitchingPlan(null);
                    }
                  }}
                >
                  {switchingPlan === plan ? "..." : labels[plan]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.card}>
          <span style={styles.cardTitle}>Stats</span>
          <InfoRow label="Products" value={String(data.productCount)} />
          <InfoRow label="Devices" value={String(data.deviceCount)} />
          <InfoRow label="Customers" value={String(data.customerCount)} />
          <InfoRow
            label="Total Revenue"
            value={"$" + data.totalRevenue.toFixed(2)}
          />
          <InfoRow label="Total Orders" value={String(data.totalOrders)} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <span style={styles.cardTitle}>Recent Transactions</span>
        {data.recentTransactions.length === 0 ? (
          <span style={styles.emptyText}>No transactions yet.</span>
        ) : (
          <div style={styles.transTable}>
            <div style={styles.transHeader}>
              <span style={{ ...styles.transHeaderCell, flex: 1 }}>
                Trans #
              </span>
              <span style={{ ...styles.transHeaderCell, flex: 2 }}>Date</span>
              <span style={{ ...styles.transHeaderCell, flex: 1 }}>
                Method
              </span>
              <span
                style={{
                  ...styles.transHeaderCell,
                  flex: 1,
                  textAlign: "right",
                }}
              >
                Total
              </span>
            </div>
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} style={styles.transRow}>
                <span style={{ ...styles.transCell, flex: 1 }}>
                  {tx.transNum || "N/A"}
                </span>
                <span style={{ ...styles.transCell, flex: 2, color: "#888" }}>
                  {formatDate(tx)}
                </span>
                <span style={{ ...styles.transCell, flex: 1 }}>
                  {tx.method || tx.type || "N/A"}
                </span>
                <span
                  style={{
                    ...styles.transCell,
                    flex: 1,
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  ${tx.total || tx.amount || "0.00"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Account */}
      <div style={{ ...styles.card, marginTop: 20, borderTop: "2px solid #ff3b30" }}>
        <span style={{ ...styles.cardTitle, color: "#ff3b30" }}>Danger Zone</span>
        <span style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
          Permanently delete this account and all associated data. This action cannot be undone.
        </span>
        <button
          style={styles.deleteBtn}
          onClick={() => setShowDeleteModal(true)}
        >
          <FiTrash2 size={16} />
          <span style={{ marginLeft: 8 }}>Delete Account</span>
        </button>
      </div>

      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText("");
        }}
      >
        <div style={styles.modalContent}>
          <span style={styles.modalTitle}>Delete Account</span>
          <span style={styles.modalDesc}>
            This will permanently delete <strong>{data.storeName}</strong> and all
            their data including products, customers, transactions, and their
            Firebase Auth account.
          </span>
          <span style={styles.modalDesc}>
            Type <strong>{data.storeName}</strong> to confirm:
          </span>
          <input
            style={styles.modalInput}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={data.storeName}
          />
          <div style={styles.modalBtnRow}>
            <button
              style={styles.modalCancelBtn}
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </button>
            <button
              style={{
                ...styles.modalDeleteBtn,
                opacity: deleteConfirmText === data.storeName && !deleting ? 1 : 0.4,
              }}
              disabled={deleteConfirmText !== data.storeName || deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteUserAccount(uid);
                  history.push("/superadmin/accounts");
                } catch (e: any) {
                  alert(e?.message || "Failed to delete account");
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete Forever"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div style={infoRowStyles.row}>
    <span style={infoRowStyles.label}>{label}</span>
    <span style={infoRowStyles.value}>{value}</span>
  </div>
);

const infoRowStyles: Record<string, React.CSSProperties> = {
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  label: {
    fontSize: 13,
    color: "#8e8e93",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
    wordBreak: "break-word",
  },
};

const styles: Record<string, React.CSSProperties> = {
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    cursor: "pointer",
    color: "#4f8cff",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c294e",
    marginBottom: 20,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  } as any,
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1c294e",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "2px solid #eef2ff",
  },
  emptyText: {
    fontSize: 13,
    color: "#8e8e93",
    padding: "12px 0",
  },
  transTable: {
    marginTop: 8,
  },
  transHeader: {
    flexDirection: "row",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  transHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8e8e93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transRow: {
    flexDirection: "row",
    padding: "10px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  transCell: {
    fontSize: 13,
    color: "#333",
  },
  planSwitchRow: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  planBtn: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    cursor: "pointer",
  },
  planBtnActive: {
    backgroundColor: "#1c294e",
    color: "#fff",
    borderColor: "#1c294e",
    cursor: "default",
  },
  deleteBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 20px",
    backgroundColor: "#ff3b30",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    width: "fit-content",
  },
  modalContent: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ff3b30",
  },
  modalDesc: {
    fontSize: 14,
    color: "#555",
    lineHeight: "1.5",
  },
  modalInput: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
  },
  modalBtnRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    color: "#333",
  },
  modalDeleteBtn: {
    padding: "10px 20px",
    backgroundColor: "#ff3b30",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
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

export default AccountDetail;
