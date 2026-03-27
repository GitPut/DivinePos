import React, { useState } from "react";
import { FiGift, FiPlus, FiTrash2, FiEdit3, FiStar, FiAward } from "react-icons/fi";
import { activePlanState, franchiseState, loyaltyConfigState, setLoyaltyConfigState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import Switch from "shared/components/ui/Switch";
import Modal from "shared/components/ui/Modal";
import { LoyaltyReward, LoyaltyConfig } from "types";
import generateId from "utils/generateId";
import { useHistory } from "react-router-dom";

function LoyaltySettings() {
  const activePlan = activePlanState.use();
  const config = loyaltyConfigState.use();
  const alertP = useAlert();
  const history = useHistory();
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(config.enabled);
  const [pointsPerDollar, setPointsPerDollar] = useState(String(config.pointsPerDollar));
  const [tiers, setTiers] = useState(config.tiers);
  const [rewards, setRewards] = useState(config.rewards);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);

  // Reward form state
  const [rwName, setRwName] = useState("");
  const [rwPoints, setRwPoints] = useState("");
  const [rwType, setRwType] = useState<"freeItem" | "discount">("discount");
  const [rwDiscountAmount, setRwDiscountAmount] = useState("");
  const [rwDiscountType, setRwDiscountType] = useState<"flat" | "percent">("flat");
  const [rwFreeItemName, setRwFreeItemName] = useState("");

  const franchise = franchiseState.use();
  const hasPro = activePlan === "professional" || !!franchise.franchiseRole;

  if (!hasPro) {
    return (
      <div style={styles.container}>
        <div style={styles.upgradeCard}>
          <FiGift size={32} color="#1D294E" />
          <span style={styles.upgradeTitle}>Loyalty Program is a Pro Feature</span>
          <span style={styles.upgradeText}>Upgrade to Professional to reward your customers with points, tiers, and redeemable rewards.</span>
          <button style={styles.upgradeBtn} onClick={() => history.push("/authed/settings/billingsettings")}>Upgrade to Professional</button>
        </div>
      </div>
    );
  }

  const resetRewardForm = () => {
    setRwName(""); setRwPoints(""); setRwType("discount");
    setRwDiscountAmount(""); setRwDiscountType("flat"); setRwFreeItemName("");
    setEditingReward(null);
  };

  const openAddReward = () => {
    resetRewardForm();
    setShowRewardModal(true);
  };

  const openEditReward = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setRwName(reward.name);
    setRwPoints(String(reward.pointsCost));
    setRwType(reward.type);
    setRwDiscountAmount(reward.discountAmount || "");
    setRwDiscountType(reward.discountType || "flat");
    setRwFreeItemName(reward.freeItemName || "");
    setShowRewardModal(true);
  };

  const saveReward = () => {
    if (!rwName || !rwPoints) return alertP.error("Name and points cost are required");
    const reward: LoyaltyReward = {
      id: editingReward?.id || generateId(10),
      name: rwName,
      pointsCost: parseInt(rwPoints),
      type: rwType,
      discountAmount: rwType === "discount" ? rwDiscountAmount : undefined,
      discountType: rwType === "discount" ? rwDiscountType : undefined,
      freeItemName: rwType === "freeItem" ? rwFreeItemName : undefined,
      active: true,
    };
    if (editingReward) {
      setRewards((prev) => prev.map((r) => (r.id === editingReward.id ? reward : r)));
    } else {
      setRewards((prev) => [...prev, reward]);
    }
    setShowRewardModal(false);
    resetRewardForm();
  };

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      const newConfig: LoyaltyConfig = {
        enabled,
        pointsPerDollar: parseFloat(pointsPerDollar) || 1,
        tiers,
        rewards,
      };
      await db.collection("users").doc(uid).collection("loyaltyConfig").doc("settings").set(newConfig);
      setLoyaltyConfigState(newConfig);
      alertP.success("Loyalty settings saved");
    } catch {
      alertP.error("Failed to save");
    }
    setSaving(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <span style={styles.title}>Loyalty Program</span>
          <span style={styles.subtitle}>Reward your customers for every order</span>
        </div>
        <button style={{ ...styles.saveBtn, opacity: saving ? 0.5 : 1 }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={styles.scrollArea}>
        {/* Enable toggle */}
        <div style={styles.card}>
          <div style={styles.switchRow}>
            <div>
              <span style={styles.switchLabel}>Enable Loyalty Program</span>
              <span style={styles.switchDesc}>Customers earn points on every order and can redeem rewards</span>
            </div>
            <Switch isActive={enabled} toggleSwitch={() => setEnabled(!enabled)} />
          </div>
        </div>

        {/* Points Configuration */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FiStar size={18} color="#1D294E" />
            <span style={styles.cardTitle}>Points Settings</span>
          </div>
          <div style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Points Per Dollar Spent</span>
            <input style={styles.input} type="number" min="1" value={pointsPerDollar} onChange={(e) => setPointsPerDollar(e.target.value)} />
            <span style={styles.fieldHint}>Customers earn this many points for every $1 spent (multiplied by their tier)</span>
          </div>
        </div>

        {/* Tiers */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FiAward size={18} color="#1D294E" />
            <span style={styles.cardTitle}>Loyalty Tiers</span>
          </div>
          <span style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, display: "block" }}>Higher tiers earn points faster with multipliers</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tiers.map((tier, i) => (
              <div key={tier.name} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: tier.color || "#CD7F32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiAward size={16} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <input style={{ ...styles.input, fontWeight: "600", height: 32 }} value={tier.name} onChange={(e) => { const t = [...tiers]; t[i] = { ...t[i], name: e.target.value }; setTiers(t); }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>From</span>
                  <input style={{ ...styles.input, width: 70, height: 32, textAlign: "center" }} type="number" value={tier.minPoints} onChange={(e) => { const t = [...tiers]; t[i] = { ...t[i], minPoints: parseInt(e.target.value) || 0 }; setTiers(t); }} />
                  <span style={{ fontSize: 12, color: "#64748b" }}>pts</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>×</span>
                  <input style={{ ...styles.input, width: 50, height: 32, textAlign: "center" }} type="number" step="0.1" value={tier.multiplier} onChange={(e) => { const t = [...tiers]; t[i] = { ...t[i], multiplier: parseFloat(e.target.value) || 1 }; setTiers(t); }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Catalog */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={styles.cardHeader}>
              <FiGift size={18} color="#1D294E" />
              <span style={styles.cardTitle}>Rewards Catalog</span>
            </div>
            <button style={styles.addBtn} onClick={openAddReward}>
              <FiPlus size={14} color="#fff" />
              <span style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Add Reward</span>
            </button>
          </div>
          {rewards.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <FiGift size={28} color="#cbd5e1" />
              <span style={{ display: "block", fontSize: 14, color: "#94a3b8", marginTop: 8 }}>No rewards yet. Add one above.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rewards.map((reward) => (
                <div key={reward.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                  <FiGift size={16} color="#6366f1" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: "600", color: "#0f172a", display: "block" }}>{reward.name}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {reward.pointsCost} pts · {reward.type === "discount" ? `$${reward.discountAmount} off` : `Free: ${reward.freeItemName || "item"}`}
                    </span>
                  </div>
                  <button style={styles.iconBtn} onClick={() => openEditReward(reward)}><FiEdit3 size={14} color="#64748b" /></button>
                  <button style={{ ...styles.iconBtn, backgroundColor: "#fef2f2", borderColor: "#fee2e2" }} onClick={() => deleteReward(reward.id)}><FiTrash2 size={14} color="#ef4444" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reward Editor Modal */}
      <Modal isVisible={showRewardModal} onBackdropPress={() => { setShowRewardModal(false); resetRewardForm(); }}>
        <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modal}>
            <span style={styles.modalTitle}>{editingReward ? "Edit Reward" : "Add Reward"}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Reward Name</span>
                <input style={styles.input} placeholder='e.g. "Free Coffee" or "$5 Off"' value={rwName} onChange={(e) => setRwName(e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Points Cost</span>
                <input style={styles.input} type="number" placeholder="100" value={rwPoints} onChange={(e) => setRwPoints(e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Reward Type</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...styles.typeBtn, ...(rwType === "discount" ? styles.typeBtnActive : {}) }} onClick={() => setRwType("discount")}>Discount</button>
                  <button style={{ ...styles.typeBtn, ...(rwType === "freeItem" ? styles.typeBtnActive : {}) }} onClick={() => setRwType("freeItem")}>Free Item</button>
                </div>
              </div>
              {rwType === "discount" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <span style={styles.fieldLabel}>Amount</span>
                    <input style={styles.input} type="number" placeholder="5" value={rwDiscountAmount} onChange={(e) => setRwDiscountAmount(e.target.value)} />
                  </div>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <span style={styles.fieldLabel}>Type</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ ...styles.typeBtn, ...(rwDiscountType === "flat" ? styles.typeBtnActive : {}) }} onClick={() => setRwDiscountType("flat")}>$ Off</button>
                      <button style={{ ...styles.typeBtn, ...(rwDiscountType === "percent" ? styles.typeBtnActive : {}) }} onClick={() => setRwDiscountType("percent")}>% Off</button>
                    </div>
                  </div>
                </div>
              )}
              {rwType === "freeItem" && (
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Item Name</span>
                  <input style={styles.input} placeholder="e.g. Medium Coffee" value={rwFreeItemName} onChange={(e) => setRwFreeItemName(e.target.value)} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button style={styles.cancelBtn} onClick={() => { setShowRewardModal(false); resetRewardForm(); }}>Cancel</button>
              <button style={styles.confirmBtn} onClick={saveReward}>{editingReward ? "Save" : "Add Reward"}</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 28, overflow: "auto", flex: 1 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", display: "block" },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4, display: "block" },
  saveBtn: { height: 40, paddingLeft: 20, paddingRight: 20, backgroundColor: "#1D294E", borderRadius: 10, border: "none", fontSize: 14, fontWeight: "600", color: "#fff", cursor: "pointer" },
  scrollArea: { display: "flex", flexDirection: "column", gap: 16 },
  card: { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20 },
  cardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  switchRow: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a", display: "block" },
  switchDesc: { fontSize: 13, color: "#94a3b8", display: "block", marginTop: 2 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#344054" },
  fieldHint: { fontSize: 12, color: "#94a3b8" },
  input: { height: 42, border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 12px", fontSize: 14, color: "#0f172a", boxSizing: "border-box" as const, outline: "none", width: "100%" },
  addBtn: { height: 36, paddingLeft: 14, paddingRight: 14, backgroundColor: "#1D294E", borderRadius: 8, border: "none", display: "flex", flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer" },
  iconBtn: { width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },
  upgradeCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12, backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" },
  upgradeTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  upgradeText: { fontSize: 14, color: "#94a3b8", textAlign: "center" as const, maxWidth: 400 },
  upgradeBtn: { height: 44, paddingLeft: 28, paddingRight: 28, backgroundColor: "#1D294E", borderRadius: 10, border: "none", color: "#fff", fontSize: 15, fontWeight: "600", cursor: "pointer", marginTop: 8 },
  modal: { width: 420, backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: 24, display: "flex", flexDirection: "column" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  typeBtn: { flex: 1, height: 36, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", fontSize: 13, fontWeight: "500", color: "#64748b", cursor: "pointer" },
  typeBtnActive: { backgroundColor: "#1D294E", borderColor: "#1D294E", color: "#fff" },
  cancelBtn: { height: 40, paddingLeft: 20, paddingRight: 20, backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: "500", color: "#344054", cursor: "pointer" },
  confirmBtn: { height: 40, paddingLeft: 20, paddingRight: 20, backgroundColor: "#1D294E", border: "none", borderRadius: 10, fontSize: 14, fontWeight: "600", color: "#fff", cursor: "pointer" },
};

export default LoyaltySettings;
