import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import {
  FiChevronRight,
  FiChevronLeft,
  FiX,
  FiMonitor,
  FiDownload,
  FiPrinter,
  FiTag,
  FiShoppingBag,
  FiLayers,
  FiGrid,
  FiCheckCircle,
} from "react-icons/fi";

interface WalkthroughStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  navigateTo?: string;
  action?: string;
}

const STEPS: WalkthroughStep[] = [
  {
    title: "Welcome to Divine POS!",
    description:
      "Let's walk through setting up your store. This will only take a few minutes. You can restart this walkthrough anytime from the sidebar.",
    icon: <FiCheckCircle size={28} color="#1D294E" />,
  },
  {
    title: "Step 1: Set Up Your Device",
    description:
      "Each device that runs your POS needs to be registered. Go to Device Settings to see your current device. Give it a name so you can identify it (e.g. \"Front Register\", \"Kitchen iPad\").",
    icon: <FiMonitor size={28} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
  },
  {
    title: "Step 2: Download the Helper Program",
    description:
      "To print receipts, you need to install the Divine POS Helper (QZ Tray) on this computer. You'll find the download link on the Device Settings page. Install it, then come back here.",
    icon: <FiDownload size={28} color="#8b5cf6" />,
    navigateTo: "/authed/settings/devicesettings",
  },
  {
    title: "Step 3: Connect Your Printer",
    description:
      "In Device Settings, enter your printer's name in the \"Printer Name\" field. This is the name your computer uses for the printer (e.g. \"EPSON TM-T20III\"). You can find it in your computer's printer settings.",
    icon: <FiPrinter size={28} color="#f59e0b" />,
    navigateTo: "/authed/settings/devicesettings",
  },
  {
    title: "Step 4: Create Categories",
    description:
      "Categories organize your menu (e.g. \"Pizza\", \"Drinks\", \"Sides\"). Click \"Add Category\" to create your first one. You can drag to reorder them later.",
    icon: <FiTag size={28} color="#ec4899" />,
    navigateTo: "/authed/product/categorylist-product",
  },
  {
    title: "Step 5: Add Your Products",
    description:
      "Now add the items you sell. Click \"Add Product\" to build from scratch, or click \"Templates\" to start with a pre-built product like a pizza or coffee that you can customize.",
    icon: <FiShoppingBag size={28} color="#f97316" />,
    navigateTo: "/authed/product/productlist-product",
  },
  {
    title: "Tip: Use Option Templates",
    description:
      "If many products share the same options (like sizes or toppings), go to Menu → Option Templates. Create them once, then add them to any product with one click. Edit a template and all linked products update automatically.",
    icon: <FiLayers size={28} color="#1D294E" />,
    navigateTo: "/authed/product/option-templates",
  },
  {
    title: "Step 6: Start Taking Orders!",
    description:
      "You're all set! Click \"POS\" in the top right to go to your Point of Sale. Tap products to add them to the cart, then choose a payment method to complete the order.",
    icon: <FiGrid size={28} color="#10b981" />,
    navigateTo: "/pos",
  },
  {
    title: "You're Ready!",
    description:
      "Your store is set up. Here are some other things you can explore:\n\n• Orders — View and manage pending orders\n• Tables — Set up table management (Pro plan)\n• Employees — Add staff with PINs and permissions\n• Settings — Configure delivery, online store, and more\n\nYou can restart this walkthrough anytime from the Settings menu in the sidebar.",
    icon: <FiCheckCircle size={28} color="#10b981" />,
    navigateTo: "/authed/dashboard",
  },
];

interface WalkthroughProps {
  isVisible: boolean;
  onClose: () => void;
}

function Walkthrough({ isVisible, onClose }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const history = useHistory();

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const goNext = () => {
    if (isLast) {
      localStorage.setItem("walkthroughCompleted", "true");
      onClose();
      return;
    }
    const nextStep = STEPS[currentStep + 1];
    if (nextStep.navigateTo) {
      history.push(nextStep.navigateTo);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    const prevStep = STEPS[currentStep - 1];
    if (prevStep.navigateTo) {
      history.push(prevStep.navigateTo);
    }
    setCurrentStep((prev) => prev - 1);
  };

  const skip = () => {
    localStorage.setItem("walkthroughCompleted", "true");
    onClose();
  };

  const content = (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Progress bar */}
        <div style={styles.progressBg}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* Close/Skip */}
        <button style={styles.skipBtn} onClick={skip}>
          <FiX size={16} color="#94a3b8" />
        </button>

        {/* Icon */}
        <div style={styles.iconWrap}>{step.icon}</div>

        {/* Content */}
        <span style={styles.stepIndicator}>
          {currentStep + 1} of {STEPS.length}
        </span>
        <span style={styles.title}>{step.title}</span>
        <span style={styles.description}>{step.description}</span>

        {/* Buttons */}
        <div style={styles.buttonsRow}>
          {!isFirst && (
            <button style={styles.backBtn} onClick={goBack}>
              <FiChevronLeft size={16} color="#64748b" />
              <span style={styles.backTxt}>Back</span>
            </button>
          )}
          <button style={styles.nextBtn} onClick={goNext}>
            <span style={styles.nextTxt}>{isLast ? "Finish" : "Next"}</span>
            {!isLast && <FiChevronRight size={16} color="#fff" />}
          </button>
        </div>

        {isFirst && (
          <button style={styles.skipLink} onClick={skip}>
            <span style={styles.skipLinkTxt}>Skip walkthrough</span>
          </button>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  },
  card: {
    width: "90vw",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: "32px 28px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  progressBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#f1f5f9",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#1D294E",
    transition: "width 0.3s ease",
  },
  skipBtn: {
    position: "absolute",
    top: 14,
    right: 14,
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
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
    marginBottom: 24,
    maxWidth: 380,
  },
  buttonsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  backBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    cursor: "pointer",
  },
  backTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  nextBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    cursor: "pointer",
  },
  nextTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  skipLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
    marginTop: 14,
    padding: 0,
  },
  skipLinkTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94a3b8",
  },
};

export default Walkthrough;
