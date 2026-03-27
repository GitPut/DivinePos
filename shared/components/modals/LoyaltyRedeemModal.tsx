import React, { useState } from "react";
import { FiGift, FiX, FiCheck, FiAward } from "react-icons/fi";
import Modal from "shared/components/ui/Modal";
import { loyaltyConfigState, customersState, setCustomersState, cartState, setCartState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { auth, db } from "services/firebase/config";
import firebase from "firebase/compat/app";
import { useAlert } from "react-alert";
import { getAffordableRewards, formatPoints, getTierColor, getTierBadgeBg } from "utils/loyaltyHelpers";
import { LoyaltyReward } from "types";

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
        const discountAmount = reward.discountType === "percent"
          ? `${reward.discountAmount}%`
          : reward.discountAmount || "0";
        // Add discount as a negative cart item
        const cart = cartState.get();
        if (reward.discountType === "percent") {
          updatePosState({ discountAmount: discountAmount });
        } else {
          updatePosState({ discountAmount: reward.discountAmount || "0" });
        }
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FiGift size={20} color="#6366f1" />
              <span style={styles.title}>Redeem Rewards</span>
            </div>
            <button style={styles.closeBtn} onClick={close}>
              <FiX size={16} color="#64748b" />
            </button>
          </div>

          {/* Customer info */}
          <div style={styles.customerBar}>
            <div style={{ ...styles.tierBadge, backgroundColor: getTierBadgeBg(tier), borderColor: getTierColor(tier) }}>
              <FiAward size={12} color={getTierColor(tier)} />
              <span style={{ fontSize: 11, fontWeight: "700", color: getTierColor(tier) }}>{tier}</span>
            </div>
            <span style={styles.customerName}>{customer.name}</span>
            <span style={styles.customerPoints}>{formatPoints(points)} pts</span>
          </div>

          {/* Rewards list */}
          <div style={styles.rewardsList}>
            {allRewards.length === 0 ? (
              <div style={styles.emptyState}>
                <FiGift size={24} color="#cbd5e1" />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>No rewards available</span>
              </div>
            ) : (
              allRewards.map((reward) => {
                const canAfford = points >= reward.pointsCost;
                return (
                  <div key={reward.id} style={{ ...styles.rewardCard, opacity: canAfford ? 1 : 0.5 }}>
                    <div style={styles.rewardInfo}>
                      <span style={styles.rewardName}>{reward.name}</span>
                      <span style={styles.rewardCost}>{formatPoints(reward.pointsCost)} pts</span>
                      <span style={styles.rewardDesc}>
                        {reward.type === "discount"
                          ? `${reward.discountType === "percent" ? `${reward.discountAmount}%` : `$${reward.discountAmount}`} off your order`
                          : `Free: ${reward.freeItemName || "item"}`}
                      </span>
                    </div>
                    <button
                      style={{ ...styles.redeemBtn, opacity: canAfford && !redeeming ? 1 : 0.4 }}
                      disabled={!canAfford || redeeming}
                      onClick={() => handleRedeem(reward)}
                    >
                      <FiCheck size={14} color="#fff" />
                      <span style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>
                        {redeeming ? "..." : "Redeem"}
                      </span>
                    </button>
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
  container: { width: 420, backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  closeBtn: { width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 },
  customerBar: { display: "flex", flexDirection: "row", alignItems: "center", gap: 8, padding: "12px 20px", backgroundColor: "#faf5ff", borderBottom: "1px solid #e9d5ff" },
  tierBadge: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, border: "1px solid" },
  customerName: { fontSize: 14, fontWeight: "600", color: "#0f172a", flex: 1 },
  customerPoints: { fontSize: 15, fontWeight: "700", color: "#6366f1" },
  rewardsList: { padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 350, overflowY: "auto" as const },
  rewardCard: { display: "flex", flexDirection: "row", alignItems: "center", padding: "14px 16px", backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9", gap: 12 },
  rewardInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  rewardName: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  rewardCost: { fontSize: 12, fontWeight: "700", color: "#6366f1" },
  rewardDesc: { fontSize: 11, color: "#94a3b8" },
  redeemBtn: { height: 34, paddingLeft: 12, paddingRight: 12, backgroundColor: "#6366f1", borderRadius: 8, border: "none", display: "flex", flexDirection: "row", alignItems: "center", gap: 4, cursor: "pointer" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
};

export default LoyaltyRedeemModal;
