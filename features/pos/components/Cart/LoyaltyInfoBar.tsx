import React from "react";
import { FiGift, FiAward, FiStar, FiChevronRight } from "react-icons/fi";
import { loyaltyConfigState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import { getTierColor, getTierBadgeBg, formatPoints, calculatePointsEarned, getAffordableRewards } from "utils/loyaltyHelpers";

const TIER_GRADIENTS: Record<string, string> = {
  Bronze: "linear-gradient(135deg, #CD7F32 0%, #a0622a 100%)",
  Silver: "linear-gradient(135deg, #b8c4d0 0%, #8a9bb0 100%)",
  Gold: "linear-gradient(135deg, #FFD700 0%, #d4a800 100%)",
};

const LoyaltyInfoBar = () => {
  const config = loyaltyConfigState.use();
  const { savedCustomerDetails, cartSub } = posState.use(
    (s) => ({ savedCustomerDetails: s.savedCustomerDetails, cartSub: s.cartSub }),
    shallowEqual
  );

  if (!config.enabled || !savedCustomerDetails) return null;

  const customer = savedCustomerDetails as any;
  const points = customer.loyaltyPoints || 0;
  const tier = customer.tier || "Bronze";
  const tierColor = getTierColor(tier);
  const tierGradient = TIER_GRADIENTS[tier] || TIER_GRADIENTS.Bronze;
  const estimatedPoints = calculatePointsEarned(cartSub, config, customer);
  const affordableRewards = getAffordableRewards(config, points);

  // Find next reward threshold for progress bar
  const allActiveRewards = config.rewards.filter((r) => r.active).sort((a, b) => a.pointsCost - b.pointsCost);
  const nextReward = allActiveRewards.find((r) => r.pointsCost > points);
  const progressPercent = nextReward ? Math.min((points / nextReward.pointsCost) * 100, 100) : 100;

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <div style={{ ...styles.tierBadge, background: tierGradient }}>
          <FiAward size={11} color="#fff" />
          <span style={styles.tierText}>{tier}</span>
        </div>
        <span style={styles.nameText}>{customer.name}</span>
        <div style={styles.pointsWrap}>
          <FiStar size={11} color="#6366f1" />
          <span style={styles.pointsText}>{formatPoints(points)}</span>
        </div>
      </div>

      {/* Progress bar to next reward */}
      {nextReward && (
        <div style={styles.progressSection}>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>
          <span style={styles.progressText}>
            {formatPoints(nextReward.pointsCost - points)} pts to {nextReward.name}
          </span>
        </div>
      )}

      <div style={styles.bottomRow}>
        <div style={styles.earnBadge}>
          <span style={styles.earnText}>+{formatPoints(estimatedPoints)} pts this order</span>
        </div>
        {affordableRewards.length > 0 && (
          <button
            style={styles.redeemBtn}
            onClick={() => updatePosState({ loyaltyRedeemModal: true } as any)}
          >
            <FiGift size={12} color="#fff" />
            <span style={styles.redeemText}>Redeem ({affordableRewards.length})</span>
            <FiChevronRight size={12} color="#fff" />
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "88%",
    padding: "10px 14px",
    background: "linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)",
    borderRadius: 12,
    border: "1px solid #e0d4fc",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 8,
    boxShadow: "0 1px 3px rgba(99,102,241,0.08)",
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tierBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "3px 9px",
    borderRadius: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  },
  tierText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  pointsWrap: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    backgroundColor: "#fff",
    borderRadius: 20,
    border: "1px solid #e0e7ff",
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#e0e7ff",
    borderRadius: 4,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: 10,
    color: "#6366f1",
    fontWeight: "500",
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  earnBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
    border: "1px solid #a7f3d0",
  },
  earnText: {
    fontSize: 10,
    color: "#047857",
    fontWeight: "600",
  },
  redeemBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "5px 12px",
    borderRadius: 20,
    border: "none",
    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(99,102,241,0.3)",
  },
  redeemText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
};

export default LoyaltyInfoBar;
