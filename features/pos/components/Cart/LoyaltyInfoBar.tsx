import React from "react";
import { FiGift, FiAward } from "react-icons/fi";
import { loyaltyConfigState } from "store/appState";
import { posState, updatePosState } from "store/posState";
import { shallowEqual } from "simpler-state";
import { getTierColor, getTierBadgeBg, formatPoints, calculatePointsEarned, getAffordableRewards } from "utils/loyaltyHelpers";

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
  const tierBg = getTierBadgeBg(tier);
  const estimatedPoints = calculatePointsEarned(cartSub, config, customer);
  const affordableRewards = getAffordableRewards(config, points);

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <div style={{ ...styles.tierBadge, backgroundColor: tierBg, borderColor: tierColor }}>
          <FiAward size={12} color={tierColor} />
          <span style={{ ...styles.tierText, color: tierColor }}>{tier}</span>
        </div>
        <span style={styles.nameText}>{customer.name}</span>
        <span style={styles.pointsText}>{formatPoints(points)} pts</span>
      </div>
      <div style={styles.bottomRow}>
        <span style={styles.earnText}>
          +{formatPoints(estimatedPoints)} pts from this order
        </span>
        {affordableRewards.length > 0 && (
          <button
            style={styles.redeemBtn}
            onClick={() => updatePosState({ loyaltyRedeemModal: true } as any)}
          >
            <FiGift size={12} color="#6366f1" />
            <span style={styles.redeemText}>Redeem ({affordableRewards.length})</span>
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
    backgroundColor: "#faf5ff",
    borderRadius: 10,
    border: "1px solid #e9d5ff",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 8,
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
    padding: "2px 8px",
    borderRadius: 12,
    border: "1px solid",
  },
  tierText: {
    fontSize: 11,
    fontWeight: "700",
  },
  nameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6366f1",
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  earnText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "500",
  },
  redeemBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: 6,
    border: "1px solid #c7d2fe",
    backgroundColor: "#eef2ff",
    cursor: "pointer",
  },
  redeemText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6366f1",
  },
};

export default LoyaltyInfoBar;
