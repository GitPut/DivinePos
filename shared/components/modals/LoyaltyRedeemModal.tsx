import React, { useState } from "react";
import { FiGift, FiX, FiCheck, FiAward, FiStar, FiTag, FiPackage, FiLock } from "react-icons/fi";
import Modal from "shared/components/ui/Modal";
import { loyaltyConfigState, customersState, setCustomersState, cartState, setCartState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { auth, db } from "services/firebase/config";
import firebase from "firebase/compat/app";
import { useAlert } from "react-alert";
import { getAffordableRewards, formatPoints, getTierColor, getTierBadgeBg } from "utils/loyaltyHelpers";
import { LoyaltyReward } from "types";

const TIER_GRADIENTS: Record<string, string> = {
  Bronze: "linear-gradient(135deg, #CD7F32 0%, #a0622a 100%)",
  Silver: "linear-gradient(135deg, #b8c4d0 0%, #8a9bb0 100%)",
  Gold: "linear-gradient(135deg, #FFD700 0%, #d4a800 100%)",
};

const LoyaltyRedeemModal = () => {
  const config = loyaltyConfigState.use();
  const { savedCustomerDetails } = posState.use();
  const isVisible = (posState.use() as any).loyaltyRedeemModal ?? false;
  const alertP = useAlert();
  const [redeeming, setRedeeming] = useState(false);

  const close = () => updatePosState({ loyaltyRedeemModal: false } as any);

  if (!config.enabled || !savedCustomerDetails) return null;

  const customer = savedCustomerDetails as any;
  const points = customer.loyaltyPoints || 0;
  const tier = customer.tier || "Bronze";
  const tierGradient = TIER_GRADIENTS[tier] || TIER_GRADIENTS.Bronze;
  const affordableRewards = getAffordableRewards(config, points);
  const allRewards = config.rewards.filter((r) => r.active);

  const handleRedeem = async (reward: LoyaltyReward) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !customer.id) return;
    setRedeeming(true);

    try {
      const newBalance = points - reward.pointsCost;
      const customerRef = db.collection("users").doc(uid).collection("customers").doc(customer.id);

      // Deduct points
      await customerRef.update({ loyaltyPoints: newBalance });

      // Record in points history
      await customerRef.collection("pointsHistory").add({
        type: "redeem",
        points: -reward.pointsCost,
        balance: newBalance,
        description: `Redeemed: ${reward.name}`,
        rewardId: reward.id,
        createdAt: firebase.firestore.Timestamp.now(),
      });

      // Record in loyalty events
      await db.collection("users").doc(uid).collection("loyaltyEvents").add({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        type: "redeem",
        points: -reward.pointsCost,
        balance: newBalance,
        description: `Redeemed: ${reward.name}`,
        rewardId: reward.id,
        rewardName: reward.name,
        createdAt: firebase.firestore.Timestamp.now(),
      });

      // Apply reward to cart
      if (reward.type === "discount") {
        if (reward.discountType === "percent") {
          updatePosState({ discountAmount: `${reward.discountAmount}%` });
        } else {
          updatePosState({ discountAmount: reward.discountAmount || "0" });
        }
      } else if (reward.type === "freeItem") {
        // Add the free item to cart with $0 price
        const cart = cartState.get();
        const freeItem = {
          name: reward.freeItemName || reward.name,
          price: "0",
          description: "Loyalty Reward — Free Item",
          options: [],
          extraDetails: `Redeemed with ${formatPoints(reward.pointsCost)} pts`,
          quantityNotChangable: true,
        };
        setCartState([...cart, freeItem]);
      }

      // Update local customer state
      const customers = customersState.get();
      setCustomersState(
        customers.map((c) =>
          c.id === customer.id ? { ...c, loyaltyPoints: newBalance } : c
        )
      );
      updatePosState({
        savedCustomerDetails: { ...customer, loyaltyPoints: newBalance },
      } as any);

      alertP.success(`Redeemed: ${reward.name} (${formatPoints(reward.pointsCost)} pts)`);
      close();
    } catch (err) {
      alertP.error("Failed to redeem reward");
    }
    setRedeeming(false);
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={close}>
      <div style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIconWrap}>
                <FiGift size={20} color="#fff" />
              </div>
              <div>
                <span style={styles.title}>Redeem Rewards</span>
                <span style={styles.titleSub}>Choose a reward to apply to this order</span>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={close}>
              <FiX size={16} color="#64748b" />
            </button>
          </div>

          {/* Customer info */}
          <div style={styles.customerBar}>
            <div style={styles.customerLeft}>
              <div style={{ ...styles.tierBadge, background: tierGradient }}>
                <FiAward size={12} color="#fff" />
                <span style={styles.tierBadgeText}>{tier}</span>
              </div>
              <span style={styles.customerName}>{customer.name}</span>
            </div>
            <div style={styles.pointsDisplay}>
              <FiStar size={14} color="#6366f1" />
              <span style={styles.pointsValue}>{formatPoints(points)}</span>
              <span style={styles.pointsLabel}>pts</span>
            </div>
          </div>

          {/* Rewards list */}
          <div style={styles.rewardsList}>
            {allRewards.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIconWrap}>
                  <FiGift size={28} color="#cbd5e1" />
                </div>
                <span style={styles.emptyTitle}>No rewards available</span>
                <span style={styles.emptyText}>Ask your store admin to set up rewards in the loyalty settings</span>
              </div>
            ) : (
              allRewards.map((reward) => {
                const canAfford = points >= reward.pointsCost;
                const pointsNeeded = reward.pointsCost - points;
                return (
                  <div key={reward.id} style={{ ...styles.rewardCard, ...(canAfford ? {} : styles.rewardCardDisabled) }}>
                    <div style={styles.rewardLeft}>
                      <div style={{ ...styles.rewardIconWrap, backgroundColor: reward.type === "discount" ? "#eef2ff" : "#ecfdf5" }}>
                        {reward.type === "discount"
                          ? <FiTag size={18} color="#6366f1" />
                          : <FiPackage size={18} color="#059669" />}
                      </div>
                      <div style={styles.rewardInfo}>
                        <span style={{ ...styles.rewardName, color: canAfford ? "#0f172a" : "#94a3b8" }}>{reward.name}</span>
                        <div style={styles.rewardMeta}>
                          <div style={{ ...styles.rewardTypeBadge, backgroundColor: reward.type === "discount" ? "#eef2ff" : "#ecfdf5", borderColor: reward.type === "discount" ? "#c7d2fe" : "#a7f3d0" }}>
                            <span style={{ fontSize: 9, fontWeight: "700", color: reward.type === "discount" ? "#4f46e5" : "#047857", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                              {reward.type === "discount" ? "Discount" : "Free Item"}
                            </span>
                          </div>
                          <span style={styles.rewardDesc}>
                            {reward.type === "discount"
                              ? `${reward.discountType === "percent" ? `${reward.discountAmount}%` : `$${reward.discountAmount}`} off`
                              : `${reward.freeItemName || "item"}`}
                          </span>
                        </div>
                        {!canAfford && (
                          <div style={styles.needMoreRow}>
                            <FiLock size={10} color="#f59e0b" />
                            <span style={styles.needMoreText}>Need {formatPoints(pointsNeeded)} more pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.rewardRight}>
                      <div style={styles.rewardCostBadge}>
                        <FiStar size={10} color="#6366f1" />
                        <span style={styles.rewardCostText}>{formatPoints(reward.pointsCost)}</span>
                      </div>
                      <button
                        style={{ ...styles.redeemBtn, ...(canAfford && !redeeming ? {} : styles.redeemBtnDisabled) }}
                        disabled={!canAfford || redeeming}
                        onClick={() => handleRedeem(reward)}
                      >
                        {canAfford ? <FiCheck size={14} color="#fff" /> : <FiLock size={14} color="#94a3b8" />}
                        <span style={{ fontSize: 12, fontWeight: "600", color: canAfford ? "#fff" : "#94a3b8" }}>
                          {redeeming ? "..." : "Redeem"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: 460, backgroundColor: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f1f5f9" },
  headerLeft: { display: "flex", flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconWrap: { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(99,102,241,0.3)" },
  title: { fontSize: 17, fontWeight: "700", color: "#0f172a", display: "block" },
  titleSub: { fontSize: 12, color: "#94a3b8", display: "block", marginTop: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },

  customerBar: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", background: "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)", borderBottom: "1px solid #e0d4fc" },
  customerLeft: { display: "flex", flexDirection: "row", alignItems: "center", gap: 10 },
  tierBadge: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" },
  tierBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff", letterSpacing: 0.3 },
  customerName: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  pointsDisplay: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6, padding: "6px 14px", backgroundColor: "#fff", borderRadius: 20, border: "1px solid #e0e7ff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  pointsValue: { fontSize: 16, fontWeight: "800", color: "#4f46e5" },
  pointsLabel: { fontSize: 11, fontWeight: "500", color: "#94a3b8" },

  rewardsList: { padding: "14px 22px 18px 22px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto" as const },
  rewardCard: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s" },
  rewardCardDisabled: { backgroundColor: "#fafbfc", borderColor: "#f1f5f9" },
  rewardLeft: { display: "flex", flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  rewardIconWrap: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rewardInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 3 },
  rewardName: { fontSize: 14, fontWeight: "600" },
  rewardMeta: { display: "flex", flexDirection: "row", alignItems: "center", gap: 6 },
  rewardTypeBadge: { padding: "1px 6px", borderRadius: 20, border: "1px solid" },
  rewardDesc: { fontSize: 11, color: "#64748b" },
  needMoreRow: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  needMoreText: { fontSize: 10, color: "#f59e0b", fontWeight: "600" },
  rewardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 },
  rewardCostBadge: { display: "flex", flexDirection: "row", alignItems: "center", gap: 3, padding: "2px 8px", backgroundColor: "#f5f3ff", borderRadius: 20 },
  rewardCostText: { fontSize: 11, fontWeight: "700", color: "#6366f1" },
  redeemBtn: { height: 34, paddingLeft: 14, paddingRight: 14, background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)", borderRadius: 8, border: "none", display: "flex", flexDirection: "row", alignItems: "center", gap: 5, cursor: "pointer", boxShadow: "0 2px 6px rgba(99,102,241,0.25)" },
  redeemBtnDisabled: { background: "#f1f5f9", boxShadow: "none", cursor: "default", border: "1px solid #e2e8f0" },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 8 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#f8fafc", border: "2px dashed #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: "#475569" },
  emptyText: { fontSize: 12, color: "#94a3b8", textAlign: "center" as const, maxWidth: 260 },
};

export default LoyaltyRedeemModal;
