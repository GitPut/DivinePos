import React, { useState } from "react";
import { posState } from "store/posState";
import { storeDetailsState } from "store/appState";
import { parseDate } from "utils/dateFormatting";
import { calculateCartTotals } from "utils/cartCalculations";
import { TransListStateItem } from "types";
import moment from "moment-timezone";

const KitchenViewOrders = () => {
  const { ongoingListState } = posState.use();
  const storeDetails = storeDetailsState.use();
  const taxRate = storeDetails?.taxRate ?? "13";
  const [now, setNow] = useState(Date.now());

  // Update elapsed time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (date: any): string => {
    if (!date) return "";
    const parsed = parseDate(date);
    if (!parsed) return "";
    const mins = Math.floor((now - parsed.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  const getMethodColor = (order: TransListStateItem): string => {
    if (order.method === "tableOrder") return "#8b5cf6";
    if (order.method === "deliveryOrder" || order.method === "delivery") return "#f59e0b";
    if (order.method === "pickupOrder" || order.method === "pickup") return "#1D294E";
    if (order.online) return "#06b6d4";
    return "#10b981";
  };

  const getMethodLabel = (order: TransListStateItem): string => {
    if (order.method === "tableOrder")
      return `Table ${order.tableName || order.tableNumber || ""}`.trim();
    if (order.method === "deliveryOrder" || order.method === "delivery") return "Delivery";
    if (order.method === "pickupOrder" || order.method === "pickup") return "Pickup";
    if (order.online) return "Online";
    return "In-Store";
  };

  return (
    <div style={styles.container}>
      {/* Header bar */}
      <div style={styles.headerBar}>
        <span style={styles.headerTitle}>Kitchen Display</span>
        <div style={styles.headerRight}>
          <span style={styles.clock}>{moment().format("h:mm A")}</span>
          <div style={styles.orderCountBadge}>
            <span style={styles.orderCountNum}>{ongoingListState?.length ?? 0}</span>
            <span style={styles.orderCountLabel}>orders</span>
          </div>
        </div>
      </div>

      {/* Orders grid */}
      <div style={styles.scrollArea}>
        {ongoingListState?.length > 0 ? (
          <div style={styles.grid}>
            {ongoingListState.map((order, index) => {
              const methodColor = getMethodColor(order);
              const methodLabel = getMethodLabel(order);
              const elapsed = getElapsedTime(order.date);
              const totals = calculateCartTotals(
                order.cart ?? [],
                taxRate,
                storeDetails?.deliveryPrice ?? "0",
                order.method === "deliveryOrder" || order.method === "delivery"
              );
              const itemCount = (order.cart ?? []).reduce(
                (sum, item) => sum + parseFloat(item.quantity ?? "1"),
                0
              );

              return (
                <div key={order.id ?? index} style={styles.orderCard}>
                  {/* Color bar */}
                  <div style={{ ...styles.accentBar, backgroundColor: methodColor }} />

                  {/* Header */}
                  <div style={styles.orderHeader}>
                    <div style={styles.orderHeaderTop}>
                      <div style={{
                        ...styles.methodBadge,
                        backgroundColor: methodColor + "18",
                        borderColor: methodColor + "30",
                      }}>
                        <span style={{ ...styles.methodText, color: methodColor }}>
                          {methodLabel}
                        </span>
                      </div>
                      {order.transNum && (
                        <span style={styles.orderNum}>#{order.transNum}</span>
                      )}
                    </div>
                    <div style={styles.orderMeta}>
                      {order.customer?.name && (
                        <span style={styles.customerName}>{order.customer.name}</span>
                      )}
                      {elapsed && <span style={styles.elapsed}>{elapsed}</span>}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={styles.itemsList}>
                    {(order.cart ?? []).map((item, idx) => {
                      const qty = parseFloat(item.quantity ?? "1");
                      const price = parseFloat(item.price ?? "0");
                      return (
                        <div
                          key={idx}
                          style={{
                            ...styles.cartItem,
                            ...(idx < (order.cart?.length ?? 0) - 1
                              ? { borderBottom: "1px solid #f1f5f9" }
                              : {}),
                          }}
                        >
                          <div style={styles.cartItemLeft}>
                            <div style={styles.qtyBadge}>
                              <span style={styles.qtyText}>{qty}</span>
                            </div>
                            <div style={styles.itemInfo}>
                              <span style={styles.cartItemName}>{item.name}</span>
                              {item.options && item.options.length > 0 && (
                                <span style={styles.itemOptions}>
                                  {item.options.slice(0, 3).join(" · ")}
                                  {item.options.length > 3 ? ` +${item.options.length - 3}` : ""}
                                </span>
                              )}
                              {item.extraDetails && (
                                <span style={styles.itemNote}>Note: {item.extraDetails}</span>
                              )}
                            </div>
                          </div>
                          <span style={styles.cartItemPrice}>
                            ${(price * qty).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order note */}
                  {order.cartNote && (
                    <div style={styles.noteRow}>
                      <span style={styles.noteText}>Note: {order.cartNote}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={styles.orderFooter}>
                    <span style={styles.itemCountText}>
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </span>
                    <div style={styles.totalGroup}>
                      <span style={styles.totalLabel}>Total</span>
                      <span style={styles.totalValue}>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyTitle}>No active orders</span>
            <span style={styles.emptySubtitle}>Orders will appear here in real time</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenViewOrders;

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  headerBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  clock: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
  },
  orderCountBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    padding: "5px 12px",
    borderRadius: 20,
  },
  orderCountNum: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  orderCountLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
    padding: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 14,
    alignContent: "start",
  },
  // Order Card
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e2e8f0",
  },
  accentBar: {
    height: 4,
    width: "100%",
    flexShrink: 0,
  },
  orderHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "14px 18px 10px",
  },
  orderHeaderTop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodBadge: {
    display: "flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 6,
    border: "1px solid",
  },
  methodText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  orderNum: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  orderMeta: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  elapsed: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  // Items
  itemsList: {
    flex: 1,
    padding: "4px 18px",
    maxHeight: 220,
    overflowY: "auto" as const,
  },
  cartItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  cartItemLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  qtyBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
    minWidth: 0,
  },
  cartItemName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  itemOptions: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  itemNote: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "500",
    fontStyle: "italic" as const,
  },
  cartItemPrice: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 13,
    flexShrink: 0,
    marginLeft: 8,
  },
  // Note
  noteRow: {
    padding: "6px 18px",
    backgroundColor: "#fffbeb",
    borderTop: "1px solid #fef3c7",
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#92400e",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  // Footer
  orderFooter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 18px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  totalGroup: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  totalLabel: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 12,
  },
  totalValue: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 18,
  },
  // Empty
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    minHeight: 300,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
  },
};
