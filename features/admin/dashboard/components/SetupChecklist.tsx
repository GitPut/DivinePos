import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  FiCheck,
  FiChevronRight,
  FiX,
  FiSettings,
  FiBook,
  FiMonitor,
  FiShoppingBag,
  FiTag,
  FiMapPin,
  FiLock,
  FiPercent,
} from "react-icons/fi";
import { storeDetailsState, storeProductsState, deviceState } from "store/appState";

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  isComplete: boolean;
}

function SetupChecklist() {
  const storeDetails = storeDetailsState.use();
  const catalog = storeProductsState.use();
  const device = deviceState.use();
  const history = useHistory();
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("setupChecklistDismissed") === "true"
  );

  const steps: ChecklistStep[] = [
    {
      id: "store_name",
      title: "Set your store name",
      description: "Add your store's name so it appears on receipts and your online store",
      icon: <FiShoppingBag size={16} color="#1470ef" />,
      link: "/authed/settings/generalsettings",
      isComplete: !!storeDetails.name && storeDetails.name.length > 0,
    },
    {
      id: "store_address",
      title: "Add your store address",
      description: "Required for delivery distance calculations and receipt printing",
      icon: <FiMapPin size={16} color="#f59e0b" />,
      link: "/authed/settings/generalsettings",
      isComplete: !!storeDetails.address,
    },
    {
      id: "tax_rate",
      title: "Set your tax rate",
      description: "Ensure accurate tax calculations on all orders",
      icon: <FiPercent size={16} color="#10b981" />,
      link: "/authed/settings/generalsettings",
      isComplete: !!storeDetails.taxRate && storeDetails.taxRate !== "13" && storeDetails.taxRate !== "",
    },
    {
      id: "settings_password",
      title: "Set a manager password",
      description: "Protect your settings and restrict employee access to the backend",
      icon: <FiLock size={16} color="#8b5cf6" />,
      link: "/authed/settings/generalsettings",
      isComplete: !!storeDetails.settingsPassword && storeDetails.settingsPassword.length > 0,
    },
    {
      id: "category",
      title: "Create your first category",
      description: "Organize your menu into categories like Pizza, Drinks, Sides, etc.",
      icon: <FiTag size={16} color="#ec4899" />,
      link: "/authed/product/categorylist-product",
      isComplete: catalog.categories.length > 0,
    },
    {
      id: "product",
      title: "Add your first product",
      description: "Add the items you sell — use templates or build from scratch",
      icon: <FiBook size={16} color="#f97316" />,
      link: "/authed/product/productlist-product",
      isComplete: catalog.products.length > 0,
    },
    {
      id: "device",
      title: "Set up your device",
      description: "Configure this device and connect a receipt printer",
      icon: <FiMonitor size={16} color="#06b6d4" />,
      link: "/authed/settings/devicesettings",
      isComplete: !!device.id && device.id.length > 0,
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const allComplete = completedCount === steps.length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (dismissed || allComplete) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FiSettings size={18} color="#1470ef" />
          </div>
          <div>
            <span style={styles.headerTitle}>Set up your store</span>
            <span style={styles.headerSubtitle}>
              {completedCount} of {steps.length} steps complete
            </span>
          </div>
        </div>
        <button
          style={styles.dismissBtn}
          onClick={() => {
            localStorage.setItem("setupChecklistDismissed", "true");
            setDismissed(true);
          }}
          title="Dismiss"
        >
          <FiX size={16} color="#94a3b8" />
        </button>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBarBg}>
        <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
      </div>

      {/* Steps */}
      <div style={styles.stepsList}>
        {steps.map((step) => (
          <button
            key={step.id}
            style={{
              ...styles.stepRow,
              ...(step.isComplete ? { opacity: 0.6 } : {}),
            }}
            onClick={() => {
              if (!step.isComplete) {
                history.push(step.link);
              }
            }}
          >
            <div style={styles.stepLeft}>
              <div
                style={{
                  ...styles.stepCheckCircle,
                  ...(step.isComplete
                    ? { backgroundColor: "#10b981", borderColor: "#10b981" }
                    : {}),
                }}
              >
                {step.isComplete ? (
                  <FiCheck size={12} color="#fff" />
                ) : (
                  step.icon
                )}
              </div>
              <div style={styles.stepText}>
                <span
                  style={{
                    ...styles.stepTitle,
                    ...(step.isComplete
                      ? { textDecoration: "line-through", color: "#94a3b8" }
                      : {}),
                  }}
                >
                  {step.title}
                </span>
                {!step.isComplete && (
                  <span style={styles.stepDesc}>{step.description}</span>
                )}
              </div>
            </div>
            {!step.isComplete && (
              <FiChevronRight size={16} color="#94a3b8" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginBottom: 20,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px 14px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    display: "block",
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
    marginTop: 1,
    display: "block",
  },
  dismissBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#f1f5f9",
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#1470ef",
    borderRadius: 2,
    transition: "width 0.3s ease",
  },
  stepsList: {
    padding: "10px 8px 8px",
  },
  stepRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    boxSizing: "border-box",
  },
  stepLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  stepCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  stepDesc: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
};

export default SetupChecklist;
