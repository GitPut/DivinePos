import React from "react";
import { FiUser, FiChevronRight, FiAward, FiStar } from "react-icons/fi";
import { loyaltyConfigState } from "store/appState";
import { getTierColor, formatPoints } from "utils/loyaltyHelpers";
import { CustomerProp } from "types";

interface SavedCustomerItemProps {
  style?: React.CSSProperties;
  customer: CustomerProp;
}

function SavedCustomerItem({ style, customer }: SavedCustomerItemProps) {
  const config = loyaltyConfigState.use();
  const loyaltyEnabled = config.enabled;
  const points = (customer as any).loyaltyPoints || 0;
  const tier = (customer as any).tier || "Bronze";
  const tierColor = getTierColor(tier);
  const orderCount = (customer as any).orderCount || customer.orders?.length || 0;

  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.left}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>
            {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
        <div style={styles.info}>
          <span style={styles.name}>{customer.name || "No Name"}</span>
          <div style={styles.meta}>
            {customer.phone && (
              <span style={styles.phone}>{customer.phone}</span>
            )}
            {orderCount > 0 && (
              <span style={styles.orders}>{orderCount} order{orderCount !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>
      <div style={styles.right}>
        {loyaltyEnabled && points > 0 && (
          <div style={{ ...styles.pointsBadge, borderColor: tierColor + "40" }}>
            <FiStar size={10} color={tierColor} />
            <span style={{ ...styles.pointsText, color: tierColor }}>{formatPoints(points)}</span>
          </div>
        )}
        <FiChevronRight size={16} color="#cbd5e1" />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    display: "flex",
    transition: "all 0.15s",
  },
  left: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "linear-gradient(135deg, #1D294E, #334155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  meta: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phone: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  orders: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  right: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  pointsBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 8,
    border: "1px solid",
    backgroundColor: "#fafafa",
  },
  pointsText: {
    fontSize: 11,
    fontWeight: "700",
  },
};

export default SavedCustomerItem;
