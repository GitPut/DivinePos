import { LoyaltyConfig, LoyaltyTier, CustomerProp } from "types";

/**
 * Get the tier for a given lifetime points value.
 */
export function getTierForPoints(lifetimePoints: number, tiers: LoyaltyTier[]): LoyaltyTier {
  const sorted = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
  for (const tier of sorted) {
    if (lifetimePoints >= tier.minPoints) return tier;
  }
  return tiers[0] || { name: "Bronze", minPoints: 0, maxPoints: 499, multiplier: 1, color: "#CD7F32" };
}

/**
 * Calculate points earned from an order total.
 */
export function calculatePointsEarned(
  orderTotal: number,
  config: LoyaltyConfig,
  customer?: CustomerProp | null
): number {
  if (!config.enabled || orderTotal <= 0) return 0;
  const lifetimePoints = customer?.lifetimePoints || 0;
  const tier = getTierForPoints(lifetimePoints, config.tiers);
  return Math.floor(orderTotal * config.pointsPerDollar * tier.multiplier);
}

/**
 * Get tier color for display.
 */
export function getTierColor(tierName?: string): string {
  switch (tierName?.toLowerCase()) {
    case "gold": return "#FFD700";
    case "silver": return "#C0C0C0";
    case "bronze": return "#CD7F32";
    default: return "#CD7F32";
  }
}

/**
 * Get tier badge background color (lighter for badges).
 */
export function getTierBadgeBg(tierName?: string): string {
  switch (tierName?.toLowerCase()) {
    case "gold": return "#FFF8E1";
    case "silver": return "#F5F5F5";
    case "bronze": return "#FFF3E0";
    default: return "#FFF3E0";
  }
}

/**
 * Format points with commas.
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Get rewards a customer can afford.
 */
export function getAffordableRewards(config: LoyaltyConfig, customerPoints: number) {
  return config.rewards
    .filter((r) => r.active && r.pointsCost <= customerPoints)
    .sort((a, b) => a.pointsCost - b.pointsCost);
}
