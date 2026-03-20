import React, { useState } from "react";
import { activePlanState, trialDetailsState } from "store/appState";
import { createCheckoutSession, openStripePortal } from "services/firebase/functions";
import { useAlert } from "react-alert";
import { IoCheckmark } from "react-icons/io5";
import { parseDate } from "utils/dateFormatting";

const STARTER_PRICE_ID = "price_1T8TIlCIw3L7DOwIDUpngIcI";
const PROFESSIONAL_PRICE_ID = "price_1T8s0hCIw3L7DOwIuHk36Ly3";

function BillingSettings() {
  const activePlan = activePlanState.use();
  const trialDetails = trialDetailsState.use();
  const alertP = useAlert();
  const [loading, setLoading] = useState(false);

  const handleOpenPortal = () => {
    setLoading(true);
    openStripePortal((msg) => {
      alertP.error("Error opening billing portal: " + msg);
      setLoading(false);
    });
  };

  const handleChangePlan = async (targetPlan: "starter" | "professional") => {
    setLoading(true);
    const priceId = targetPlan === "professional" ? PROFESSIONAL_PRICE_ID : STARTER_PRICE_ID;
    await createCheckoutSession(
      priceId,
      window.location.origin + "/authed/settings/billingsettings",
      window.location.origin + "/authed/settings/billingsettings",
      (msg) => {
        alertP.error("Error: " + msg);
        setLoading(false);
      }
    );
  };

  const planLabel =
    activePlan === "professional"
      ? "Professional"
      : activePlan === "starter"
        ? "Starter"
        : activePlan === "trial"
          ? "Free Trial"
          : "No Plan";

  const parsedTrialEnd = trialDetails.endDate ? parseDate(trialDetails.endDate as any) : null;
  const trialEndDate = parsedTrialEnd ? parsedTrialEnd.toLocaleDateString() : null;

  return (
    <div style={styles.container}>
      <span style={styles.pageLbl}>Billing</span>

      {/* Current plan badge */}
      <div style={styles.currentPlanRow}>
        <span style={styles.currentPlanLabel}>Current Plan:</span>
        <span style={styles.currentPlanBadge}>{planLabel}</span>
        {activePlan === "trial" && trialEndDate && (
          <span style={styles.trialDate}>Trial ends {trialEndDate}</span>
        )}
      </div>

      {/* Plan cards */}
      <div style={styles.cardsRow}>
        {/* Starter card */}
        <div
          style={{
            ...styles.planCard,
            ...(activePlan === "starter" ? styles.planCardActive : {}),
          }}
        >
          {activePlan === "starter" && (
            <div style={styles.activeBadge}>
              <IoCheckmark size={14} color="#fff" />
              <span style={styles.activeBadgeText}>Current</span>
            </div>
          )}
          <span style={{ ...styles.planName, color: activePlan === "starter" ? "#fff" : "#1a1a1a" }}>Starter</span>
          <div style={styles.priceRow}>
            <span style={{ ...styles.planPrice, color: activePlan === "starter" ? "#fff" : "#1a1a1a" }}>$29</span>
            <span style={{ ...styles.planPeriod, color: activePlan === "starter" ? "rgba(255,255,255,0.6)" : "#64748b" }}>/month</span>
          </div>
          <div style={styles.featuresContainer}>
            {["Point of Sale", "1 Device", "Cloud-Based", "24/7 Support", "Data Analytics"].map((feature) => (
              <div key={feature} style={styles.featureRow}>
                <IoCheckmark size={16} color={activePlan === "starter" ? "#a5f3fc" : "#64748b"} />
                <span style={{ ...styles.featureText, color: activePlan === "starter" ? "#e2e8f0" : "#334155" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
          {activePlan === "professional" && (
            <button
              style={{ ...styles.switchPlanBtn, opacity: loading ? 0.5 : 1 }}
              onClick={() => handleChangePlan("starter")}
              disabled={loading}
            >
              Switch to Starter
            </button>
          )}
          {activePlan === "trial" && (
            <button
              style={{ ...styles.upgradePlanBtn, opacity: loading ? 0.5 : 1 }}
              onClick={() => handleChangePlan("starter")}
              disabled={loading}
            >
              Upgrade to Starter
            </button>
          )}
        </div>

        {/* Professional card */}
        <div
          style={{
            ...styles.planCard,
            ...(activePlan === "professional" ? styles.planCardActive : {}),
          }}
        >
          {activePlan === "professional" && (
            <div style={styles.activeBadge}>
              <IoCheckmark size={14} color="#fff" />
              <span style={styles.activeBadgeText}>Current</span>
            </div>
          )}
          <span style={{ ...styles.planName, color: activePlan === "professional" ? "#fff" : "#1a1a1a" }}>Professional</span>
          <div style={styles.priceRow}>
            <span style={{ ...styles.planPrice, color: activePlan === "professional" ? "#fff" : "#1a1a1a" }}>$69</span>
            <span style={{ ...styles.planPeriod, color: activePlan === "professional" ? "rgba(255,255,255,0.6)" : "#64748b" }}>/month</span>
          </div>
          <div style={styles.featuresContainer}>
            {["Point of Sale", "Unlimited Devices", "Online Store", "Table Management", "WooCommerce", "Cloud-Based", "24/7 Support"].map((feature) => (
              <div key={feature} style={styles.featureRow}>
                <IoCheckmark size={16} color={activePlan === "professional" ? "#a5f3fc" : "#64748b"} />
                <span style={{ ...styles.featureText, color: activePlan === "professional" ? "#e2e8f0" : "#334155" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
          {(activePlan === "starter" || activePlan === "trial") && (
            <button
              style={{ ...styles.upgradePlanBtn, opacity: loading ? 0.5 : 1 }}
              onClick={() => handleChangePlan("professional")}
              disabled={loading}
            >
              Upgrade to Professional
            </button>
          )}
        </div>
      </div>

      {/* Manage billing link */}
      <div style={styles.buttonsRow}>
        <button style={{ ...styles.manageBillingBtn, opacity: loading ? 0.5 : 1 }} onClick={handleOpenPortal} disabled={loading}>
          Manage Billing
        </button>
      </div>

      {/* Info note about plan changes */}
      {(activePlan === "starter" || activePlan === "professional") && (
        <div style={styles.infoNote}>
          <span style={styles.infoNoteText}>
            After switching plans, please cancel your previous plan by clicking "Manage Billing" above.
          </span>
        </div>
      )}

      {activePlan === "trial" && (
        <div style={styles.trialNote}>
          <span style={styles.trialNoteText}>
            You are currently on a free trial. Your trial will end on {trialEndDate ?? "the scheduled date"}.
            After the trial ends, you will be prompted to choose a plan.
          </span>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    width: "100%",
    overflow: "auto",
    padding: 30,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  pageLbl: {
    fontWeight: "700",
    fontSize: 24,
    color: "#1a1a1a",
    display: "block",
    marginBottom: 8,
  },
  currentPlanRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  currentPlanLabel: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  currentPlanBadge: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    backgroundColor: "#e2e8f0",
    padding: "5px 16px",
    borderRadius: 20,
  },
  trialDate: {
    fontSize: 13,
    color: "#94a3b8",
  },
  cardsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    marginBottom: 32,
  },
  planCard: {
    flex: 1,
    maxWidth: 320,
    padding: 28,
    borderRadius: 16,
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    position: "relative" as const,
  },
  planCardActive: {
    backgroundColor: "#1e293b",
    borderColor: "#1e293b",
  },
  activeBadge: {
    position: "absolute" as const,
    top: 14,
    right: 14,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0891b2",
    padding: "4px 12px",
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  planName: {
    fontWeight: "700",
    fontSize: 20,
    marginBottom: 8,
  },
  priceRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 24,
  },
  planPrice: {
    fontWeight: "700",
    fontSize: 36,
  },
  planPeriod: {
    fontSize: 14,
  },
  featuresContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
  },
  featureRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
  },
  switchPlanBtn: {
    marginTop: 24,
    padding: "11px 20px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    cursor: "pointer",
  },
  upgradePlanBtn: {
    marginTop: 24,
    padding: "11px 20px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  buttonsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  manageBillingBtn: {
    padding: "12px 28px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontWeight: "600",
    fontSize: 15,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    cursor: "pointer",
  },
  infoNote: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: 16,
    maxWidth: 540,
    marginBottom: 16,
  },
  infoNoteText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: "1.5",
  },
  trialNote: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 10,
    padding: 16,
    maxWidth: 540,
  },
  trialNoteText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: "1.5",
  },
};

export default BillingSettings;
