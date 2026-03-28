import React, { useState } from "react";
import { FiGift, FiPlus, FiTrash2, FiEdit3, FiStar, FiAward, FiChevronRight, FiTag, FiPackage, FiInfo } from "react-icons/fi";
import { activePlanState, franchiseState, loyaltyConfigState, setLoyaltyConfigState, storeProductsState } from "store/appState";
import { auth, db } from "services/firebase/config";
import { useAlert } from "react-alert";
import Switch from "shared/components/ui/Switch";
import Modal from "shared/components/ui/Modal";
import { LoyaltyReward, LoyaltyConfig } from "types";
import generateId from "utils/generateId";
import { useHistory } from "react-router-dom";

const TIER_GRADIENTS: Record<string, string> = {
  Bronze: "linear-gradient(135deg, #CD7F32 0%, #a0622a 100%)",
  Silver: "linear-gradient(135deg, #b8c4d0 0%, #8a9bb0 100%)",
  Gold: "linear-gradient(135deg, #FFD700 0%, #d4a800 100%)",
};

const TIER_LIGHT_BG: Record<string, string> = {
  Bronze: "#fef7f0",
  Silver: "#f6f8fa",
  Gold: "#fffdf0",
};

const TIER_BORDER: Record<string, string> = {
  Bronze: "#e8c9a8",
  Silver: "#d1d9e0",
  Gold: "#f0e08a",
};

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
  const [rwFreeItemProductId, setRwFreeItemProductId] = useState("");

  const catalog = storeProductsState.use();
  const franchise = franchiseState.use();
  const hasPro = activePlan === "professional" || !!franchise.franchiseRole;

  if (!hasPro) {
    return (
      <div style={styles.container}>
        <div style={styles.upgradeCard}>
          <div style={styles.upgradeIconWrap}>
            <FiGift size={28} color="#fff" />
          </div>
          <span style={styles.upgradeTitle}>Loyalty Program is a Pro Feature</span>
          <span style={styles.upgradeText}>Upgrade to Professional to reward your customers with points, tiers, and redeemable rewards.</span>
          <button style={styles.upgradeBtn} onClick={() => history.push("/authed/settings/billingsettings")}>Upgrade to Professional</button>
        </div>
      </div>
    );
  }

  const resetRewardForm = () => {
    setRwName(""); setRwPoints(""); setRwType("discount");
    setRwDiscountAmount(""); setRwDiscountType("flat"); setRwFreeItemName(""); setRwFreeItemProductId("");
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
    setRwFreeItemProductId(reward.freeItemProductId || "");
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
      freeItemProductId: rwType === "freeItem" ? rwFreeItemProductId || undefined : undefined,
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
      {/* Header */}
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIconWrap}>
            <FiGift size={22} color="#fff" />
          </div>
          <div>
            <span style={styles.title}>Loyalty Program</span>
            <span style={styles.subtitle}>Reward your customers for every order with points, tiers, and exclusive rewards</span>
          </div>
        </div>
        <button style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={styles.scrollArea}>
        {/* Enable toggle */}
        <div style={styles.card}>
          <div style={styles.switchRow}>
            <div style={styles.switchContent}>
              <div style={styles.switchIconWrap}>
                <FiStar size={16} color="#1D294E" />
              </div>
              <div>
                <span style={styles.switchLabel}>Enable Loyalty Program</span>
                <span style={styles.switchDesc}>Customers earn points on every order and can redeem rewards at checkout</span>
              </div>
            </div>
            <Switch isActive={enabled} toggleSwitch={() => setEnabled(!enabled)} />
          </div>
        </div>

        {/* Points Configuration */}
        <div style={{ ...styles.card, borderLeft: "3px solid #1D294E" }}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrap}>
              <FiStar size={15} color="#1D294E" />
            </div>
            <div>
              <span style={styles.cardTitle}>Points Settings</span>
              <span style={styles.cardSubtitle}>Configure how customers earn points</span>
            </div>
          </div>
          <div style={styles.pointsInputArea}>
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Points Per Dollar Spent</span>
              <div style={styles.inputRow}>
                <input style={styles.pointsInput} type="number" min="1" value={pointsPerDollar} onChange={(e) => setPointsPerDollar(e.target.value)} />
                <div style={styles.inputSuffix}>
                  <span style={styles.inputSuffixText}>points / $1</span>
                </div>
              </div>
              <div style={styles.hintRow}>
                <FiInfo size={12} color="#94a3b8" />
                <span style={styles.fieldHint}>Customers earn this many points for every $1 spent, multiplied by their tier level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div style={{ ...styles.card, borderLeft: "3px solid #FFD700" }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.cardIconWrap, backgroundColor: "#fffbeb" }}>
              <FiAward size={15} color="#d97706" />
            </div>
            <div style={{ flex: 1 }}>
              <span style={styles.cardTitle}>Loyalty Tiers</span>
              <span style={styles.cardSubtitle}>Higher tiers earn points faster with multipliers</span>
            </div>
          </div>
          <div style={styles.tiersContainer}>
            {tiers.map((tier, i) => {
              const tierName = tier.name || (i === 0 ? "Bronze" : i === 1 ? "Silver" : "Gold");
              const gradient = TIER_GRADIENTS[tierName] || TIER_GRADIENTS.Bronze;
              const lightBg = TIER_LIGHT_BG[tierName] || TIER_LIGHT_BG.Bronze;
              const borderColor = TIER_BORDER[tierName] || TIER_BORDER.Bronze;
              return (
                <React.Fragment key={tier.name + i}>
                  <div style={{ ...styles.tierCard, backgroundColor: lightBg, borderColor }}>
                    <div style={{ ...styles.tierBadge, background: gradient }}>
                      <FiAward size={18} color="#fff" />
                    </div>
                    <div style={styles.tierFields}>
                      <div style={styles.tierNameRow}>
                        <input
                          style={styles.tierNameInput}
                          value={tier.name}
                          onChange={(e) => { const t = [...tiers]; t[i] = { ...t[i], name: e.target.value }; setTiers(t); }}
                          placeholder="Tier name"
                        />
                      </div>
                      <div style={styles.tierInputsRow}>
                        <div style={styles.tierInputGroup}>
                          <span style={styles.tierInputLabel}>Min Points</span>
                          <input
                            style={styles.tierSmallInput}
                            type="number"
                            value={tier.minPoints}
                            onChange={(e) => { const t = [...tiers]; t[i] = { ...t[i], minPoints: parseInt(e.target.value) || 0 }; setTiers(t); }}
                          />
                        </div>
                        <div style={styles.tierInputGroup}>
                          <span style={styles.tierInputLabel}>Multiplier</span>
                          <div style={styles.multiplierWrap}>
                            <span style={styles.multiplierX}>x</span>
                            <input
                              style={styles.tierSmallInput}
                              type="number"
                              step="0.1"
                              value={tier.multiplier}
                              onChange={(e) => { const t = [...tiers]; t[i] = { ...t[i], multiplier: parseFloat(e.target.value) || 1 }; setTiers(t); }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {i < tiers.length - 1 && (
                    <div style={styles.tierArrow}>
                      <FiChevronRight size={16} color="#cbd5e1" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Rewards Catalog */}
        <div style={{ ...styles.card, borderLeft: "3px solid #6366f1" }}>
          <div style={styles.rewardsHeader}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIconWrap, backgroundColor: "#eef2ff" }}>
                <FiGift size={15} color="#6366f1" />
              </div>
              <div>
                <span style={styles.cardTitle}>Rewards Catalog</span>
                <span style={styles.cardSubtitle}>Rewards your customers can redeem with their points</span>
              </div>
            </div>
            <button style={styles.addBtn} onClick={openAddReward}>
              <FiPlus size={14} color="#fff" />
              <span style={styles.addBtnText}>Add Reward</span>
            </button>
          </div>
          {rewards.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIconWrap}>
                <FiGift size={28} color="#cbd5e1" />
              </div>
              <span style={styles.emptyTitle}>No rewards yet</span>
              <span style={styles.emptyText}>Create your first reward to give customers something to redeem their points for</span>
              <button style={styles.emptyAddBtn} onClick={openAddReward}>
                <FiPlus size={14} color="#1D294E" />
                <span style={{ fontSize: 13, fontWeight: "600", color: "#1D294E" }}>Add Your First Reward</span>
              </button>
            </div>
          ) : (
            <div style={styles.rewardsGrid}>
              {rewards.map((reward) => (
                <div key={reward.id} style={styles.rewardCard}>
                  <div style={styles.rewardCardTop}>
                    <div style={styles.rewardIconWrap}>
                      {reward.type === "discount" ? <FiTag size={18} color="#6366f1" /> : <FiPackage size={18} color="#059669" />}
                    </div>
                    <div style={styles.rewardActions}>
                      <button style={styles.iconBtn} onClick={() => openEditReward(reward)}>
                        <FiEdit3 size={13} color="#64748b" />
                      </button>
                      <button style={styles.iconBtnDanger} onClick={() => deleteReward(reward.id)}>
                        <FiTrash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                  <span style={styles.rewardName}>{reward.name}</span>
                  <span style={styles.rewardDesc}>
                    {reward.type === "discount"
                      ? `${reward.discountType === "percent" ? `${reward.discountAmount}%` : `$${reward.discountAmount}`} off order`
                      : `Free: ${reward.freeItemName || "item"}`}
                  </span>
                  <div style={styles.rewardCardBottom}>
                    <div style={styles.rewardPointsBadge}>
                      <FiStar size={11} color="#6366f1" />
                      <span style={styles.rewardPointsText}>{reward.pointsCost} pts</span>
                    </div>
                    <div style={{ ...styles.rewardTypeBadge, backgroundColor: reward.type === "discount" ? "#eef2ff" : "#ecfdf5", borderColor: reward.type === "discount" ? "#c7d2fe" : "#a7f3d0" }}>
                      <span style={{ fontSize: 10, fontWeight: "600", color: reward.type === "discount" ? "#4f46e5" : "#047857", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                        {reward.type === "discount" ? "Discount" : "Free Item"}
                      </span>
                    </div>
                  </div>
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
            <div style={styles.modalHeader}>
              <div style={styles.modalIconWrap}>
                {editingReward ? <FiEdit3 size={18} color="#6366f1" /> : <FiPlus size={18} color="#6366f1" />}
              </div>
              <div>
                <span style={styles.modalTitle}>{editingReward ? "Edit Reward" : "Add New Reward"}</span>
                <span style={styles.modalSubtitle}>{editingReward ? "Update the reward details below" : "Create a new reward for your customers"}</span>
              </div>
            </div>
            <div style={styles.modalDivider} />
            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Reward Name</span>
                <input style={styles.input} placeholder='e.g. "Free Coffee" or "$5 Off"' value={rwName} onChange={(e) => setRwName(e.target.value)} />
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Points Cost</span>
                <div style={styles.inputRow}>
                  <input style={styles.pointsInput} type="number" placeholder="100" value={rwPoints} onChange={(e) => setRwPoints(e.target.value)} />
                  <div style={styles.inputSuffix}>
                    <span style={styles.inputSuffixText}>points</span>
                  </div>
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <span style={styles.fieldLabel}>Reward Type</span>
                <div style={styles.typeBtnRow}>
                  <button style={{ ...styles.typeBtn, ...(rwType === "discount" ? styles.typeBtnActive : {}) }} onClick={() => setRwType("discount")}>
                    <FiTag size={14} color={rwType === "discount" ? "#fff" : "#64748b"} />
                    <span>Discount</span>
                  </button>
                  <button style={{ ...styles.typeBtn, ...(rwType === "freeItem" ? styles.typeBtnActive : {}) }} onClick={() => setRwType("freeItem")}>
                    <FiPackage size={14} color={rwType === "freeItem" ? "#fff" : "#64748b"} />
                    <span>Free Item</span>
                  </button>
                </div>
              </div>
              {rwType === "discount" && (
                <div style={styles.discountRow}>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <span style={styles.fieldLabel}>Amount</span>
                    <input style={styles.input} type="number" placeholder="5" value={rwDiscountAmount} onChange={(e) => setRwDiscountAmount(e.target.value)} />
                  </div>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <span style={styles.fieldLabel}>Type</span>
                    <div style={styles.typeBtnRow}>
                      <button style={{ ...styles.typeBtn, ...(rwDiscountType === "flat" ? styles.typeBtnActive : {}) }} onClick={() => setRwDiscountType("flat")}>$ Off</button>
                      <button style={{ ...styles.typeBtn, ...(rwDiscountType === "percent" ? styles.typeBtnActive : {}) }} onClick={() => setRwDiscountType("percent")}>% Off</button>
                    </div>
                  </div>
                </div>
              )}
              {rwType === "freeItem" && (
                <div style={styles.fieldGroup}>
                  <span style={styles.fieldLabel}>Select Product</span>
                  <select
                    style={styles.productSelect}
                    value={rwFreeItemProductId}
                    onChange={(e) => {
                      const productId = e.target.value;
                      setRwFreeItemProductId(productId);
                      const product = catalog.products.find((p) => p.id === productId);
                      if (product) {
                        setRwFreeItemName(product.name);
                        if (!rwName) setRwName(`Free ${product.name}`);
                      }
                    }}
                  >
                    <option value="">Choose a product...</option>
                    {catalog.products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — ${parseFloat(p.price).toFixed(2)}</option>
                    ))}
                  </select>
                  <span style={styles.fieldHint}>Or enter a custom name below</span>
                  <input style={styles.input} placeholder="e.g. Medium Coffee" value={rwFreeItemName} onChange={(e) => setRwFreeItemName(e.target.value)} />
                </div>
              )}
            </div>
            <div style={styles.modalDivider} />
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setShowRewardModal(false); resetRewardForm(); }}>Cancel</button>
              <button style={styles.confirmBtn} onClick={saveReward}>
                {editingReward ? "Save Changes" : "Add Reward"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 28, overflow: "auto", flex: 1, backgroundColor: "#f8fafc" },
  headerRow: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  headerLeft: { display: "flex", flexDirection: "row", alignItems: "center", gap: 14 },
  headerIconWrap: { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #1D294E 0%, #2d3f6e 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a", display: "block", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 3, display: "block", maxWidth: 400 },
  saveBtn: { height: 44, paddingLeft: 24, paddingRight: 24, background: "linear-gradient(135deg, #1D294E 0%, #2d3f6e 100%)", borderRadius: 10, border: "none", fontSize: 14, fontWeight: "600", color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(29,41,78,0.25)", transition: "opacity 0.2s" },
  scrollArea: { display: "flex", flexDirection: "column", gap: 20 },

  // Cards
  card: { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" },
  cardHeader: { display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  cardIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", display: "block" },
  cardSubtitle: { fontSize: 12, color: "#94a3b8", display: "block", marginTop: 1 },

  // Switch
  switchRow: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchContent: { display: "flex", flexDirection: "row", alignItems: "center", gap: 12 },
  switchIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  switchLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a", display: "block" },
  switchDesc: { fontSize: 13, color: "#94a3b8", display: "block", marginTop: 2, maxWidth: 400 },

  // Points
  pointsInputArea: { marginTop: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#344054" },
  fieldHint: { fontSize: 12, color: "#94a3b8" },
  inputRow: { display: "flex", flexDirection: "row", alignItems: "stretch" },
  pointsInput: { height: 44, border: "1px solid #e2e8f0", borderRadius: "8px 0 0 8px", borderRight: "none", padding: "0 14px", fontSize: 15, fontWeight: "600", color: "#0f172a", boxSizing: "border-box" as const, outline: "none", width: 100 },
  inputSuffix: { height: 44, padding: "0 14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "center" },
  inputSuffixText: { fontSize: 12, fontWeight: "500", color: "#94a3b8", whiteSpace: "nowrap" as const },
  hintRow: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  input: { height: 44, border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 14px", fontSize: 14, color: "#0f172a", boxSizing: "border-box" as const, outline: "none", width: "100%", backgroundColor: "#fff" },
  productSelect: { height: 44, border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 10px", fontSize: 14, color: "#0f172a", boxSizing: "border-box" as const, outline: "none", width: "100%", backgroundColor: "#fff", cursor: "pointer" },

  // Tiers
  tiersContainer: { display: "flex", flexDirection: "row", gap: 0, alignItems: "center", marginTop: 16, flexWrap: "wrap" as const },
  tierCard: { display: "flex", flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, border: "1px solid", flex: 1, minWidth: 200 },
  tierBadge: { width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  tierFields: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  tierNameRow: { display: "flex", flexDirection: "row", alignItems: "center" },
  tierNameInput: { height: 30, border: "none", borderBottom: "1px solid #e2e8f0", borderRadius: 0, padding: "0 4px", fontSize: 15, fontWeight: "700", color: "#0f172a", boxSizing: "border-box" as const, outline: "none", width: "100%", backgroundColor: "transparent" },
  tierInputsRow: { display: "flex", flexDirection: "row", gap: 12 },
  tierInputGroup: { display: "flex", flexDirection: "column", gap: 3 },
  tierInputLabel: { fontSize: 10, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  tierSmallInput: { height: 30, width: 70, border: "1px solid #e2e8f0", borderRadius: 6, padding: "0 8px", fontSize: 13, fontWeight: "600", color: "#0f172a", boxSizing: "border-box" as const, outline: "none", textAlign: "center" as const, backgroundColor: "#fff" },
  multiplierWrap: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4 },
  multiplierX: { fontSize: 12, fontWeight: "700", color: "#94a3b8" },
  tierArrow: { display: "flex", alignItems: "center", justifyContent: "center", width: 28, flexShrink: 0 },

  // Rewards
  rewardsHeader: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  addBtn: { height: 38, paddingLeft: 16, paddingRight: 16, background: "linear-gradient(135deg, #1D294E 0%, #2d3f6e 100%)", borderRadius: 8, border: "none", display: "flex", flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: "0 2px 6px rgba(29,41,78,0.2)", flexShrink: 0 },
  addBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  rewardsGrid: { display: "flex", flexDirection: "row", flexWrap: "wrap" as const, gap: 12 },
  rewardCard: { display: "flex", flexDirection: "column", gap: 8, padding: 16, backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", width: "calc(50% - 6px)", boxSizing: "border-box" as const, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" },
  rewardCardTop: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rewardIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" },
  rewardActions: { display: "flex", flexDirection: "row", gap: 4 },
  rewardName: { fontSize: 15, fontWeight: "700", color: "#0f172a", display: "block" },
  rewardDesc: { fontSize: 12, color: "#64748b", display: "block" },
  rewardCardBottom: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" },
  rewardPointsBadge: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4, padding: "3px 10px", backgroundColor: "#f5f3ff", borderRadius: 20 },
  rewardPointsText: { fontSize: 12, fontWeight: "700", color: "#6366f1" },
  rewardTypeBadge: { padding: "3px 8px", borderRadius: 20, border: "1px solid" },
  iconBtn: { width: 30, height: 30, borderRadius: 6, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },
  iconBtnDanger: { width: 30, height: 30, borderRadius: 6, border: "1px solid #fecaca", backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },

  // Empty state
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 8 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#f8fafc", border: "2px dashed #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#475569", display: "block" },
  emptyText: { fontSize: 13, color: "#94a3b8", textAlign: "center" as const, maxWidth: 300, display: "block" },
  emptyAddBtn: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "1px dashed #1D294E", backgroundColor: "#f0f4ff", cursor: "pointer", marginTop: 8 },

  // Upgrade
  upgradeCard: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16, backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  upgradeIconWrap: { width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #1D294E 0%, #2d3f6e 100%)", display: "flex", alignItems: "center", justifyContent: "center" },
  upgradeTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  upgradeText: { fontSize: 14, color: "#64748b", textAlign: "center" as const, maxWidth: 420, lineHeight: "1.6" },
  upgradeBtn: { height: 46, paddingLeft: 32, paddingRight: 32, background: "linear-gradient(135deg, #1D294E 0%, #2d3f6e 100%)", borderRadius: 10, border: "none", color: "#fff", fontSize: 15, fontWeight: "600", cursor: "pointer", marginTop: 4, boxShadow: "0 2px 8px rgba(29,41,78,0.25)" },

  // Modal
  modal: { width: 460, backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" },
  modalHeader: { display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "20px 24px 0 24px" },
  modalIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", display: "block" },
  modalSubtitle: { fontSize: 12, color: "#94a3b8", display: "block", marginTop: 2 },
  modalDivider: { height: 1, backgroundColor: "#f1f5f9", margin: "16px 0 0 0" },
  modalBody: { display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px" },
  modalFooter: { display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: 10, padding: "16px 24px", backgroundColor: "#fafbfc", borderTop: "1px solid #f1f5f9" },
  typeBtnRow: { display: "flex", flexDirection: "row", gap: 8 },
  typeBtn: { flex: 1, height: 40, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", fontSize: 13, fontWeight: "500", color: "#64748b", cursor: "pointer", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" },
  typeBtnActive: { backgroundColor: "#1D294E", borderColor: "#1D294E", color: "#fff" },
  discountRow: { display: "flex", flexDirection: "row", gap: 12 },
  cancelBtn: { height: 42, paddingLeft: 20, paddingRight: 20, backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: "500", color: "#344054", cursor: "pointer" },
  confirmBtn: { height: 42, paddingLeft: 24, paddingRight: 24, background: "linear-gradient(135deg, #1D294E 0%, #2d3f6e 100%)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: "600", color: "#fff", cursor: "pointer", boxShadow: "0 2px 6px rgba(29,41,78,0.2)" },
};

export default LoyaltySettings;
