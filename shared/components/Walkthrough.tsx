import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import {
  FiArrowRight,
  FiX,
  FiMonitor,
  FiTag,
  FiShoppingBag,
  FiGrid,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { storeProductsState, deviceState, cartState } from "store/appState";

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  navigateTo?: string;
  completionCheck?: () => boolean;
  actionLabel?: string;
  tip?: string;
}

const STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to Divine POS!",
    description: "Let's set up your store together. This guide will walk you through each step — just follow along and we'll have you ready to take orders in minutes.",
    icon: <FiCheckCircle size={24} color="#1D294E" />,
    actionLabel: "Let's Go",
  },
  {
    id: "device",
    title: "Name Your Device",
    description: "Every register needs a name so you can identify it. Type a name like \"Front Counter\" or \"Main Register\" in the device name field, then click Save.",
    icon: <FiMonitor size={24} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    completionCheck: () => {
      const device = deviceState.get();
      return !!device.id && device.id.length > 0;
    },
    tip: "You can also connect a receipt printer here. Download the Divine POS Helper app from this page to enable printing.",
  },
  {
    id: "category",
    title: "Create a Category",
    description: "Categories organize your menu. Click the \"Add Category\" button and create one like \"Pizza\", \"Drinks\", or \"Appetizers\".",
    icon: <FiTag size={24} color="#ec4899" />,
    navigateTo: "/authed/product/categorylist-product",
    completionCheck: () => {
      const catalog = storeProductsState.get();
      return catalog.categories.length > 0;
    },
    actionLabel: "I Created One",
    tip: "You can drag categories to reorder them anytime.",
  },
  {
    id: "product",
    title: "Add Your First Product",
    description: "Now add something to sell! Click \"Add Product\" to build one from scratch, or click \"Templates\" to start with a pre-built product you can customize.",
    icon: <FiShoppingBag size={24} color="#f97316" />,
    navigateTo: "/authed/product/productlist-product",
    completionCheck: () => {
      const catalog = storeProductsState.get();
      return catalog.products.length > 0;
    },
    actionLabel: "I Added One",
    tip: "Use Option Templates (Menu → Option Templates) to create reusable options like sizes and toppings that you can add to any product.",
  },
  {
    id: "pos",
    title: "Take Your First Order!",
    description: "You're all set! Try tapping a product to add it to the cart. Then choose Cash or Card to complete the order.",
    icon: <FiGrid size={24} color="#10b981" />,
    navigateTo: "/pos",
    completionCheck: () => {
      const cart = cartState.get();
      return cart.length > 0;
    },
    actionLabel: "Done",
    tip: "Use the sidebar to access Orders, Tables, Clock-In, Delivery, and more.",
  },
  {
    id: "complete",
    title: "You're All Set! 🎉",
    description: "Your store is ready to go. Here are some things to explore next:\n\n• Settings — Set your tax rate, delivery options, and manager password\n• Employees — Add staff with PINs and permissions\n• Tables — Set up table management (Pro plan)\n• Online Store — Accept orders online (Pro plan)\n\nYou can restart this guide anytime from the admin sidebar.",
    icon: <FiCheckCircle size={24} color="#10b981" />,
    actionLabel: "Finish",
  },
];

interface WalkthroughProps {
  isVisible: boolean;
  onClose: () => void;
}

function Walkthrough({ isVisible, onClose }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const history = useHistory();

  // Watch for completion of current step
  const catalog = storeProductsState.use();
  const device = deviceState.use();
  const cart = cartState.use();

  useEffect(() => {
    if (!isVisible) return;
    const step = STEPS[currentStep];
    if (step.completionCheck && step.completionCheck()) {
      // Auto-advance after a brief delay so user sees the completion
      const timer = setTimeout(() => {
        if (currentStep < STEPS.length - 1) {
          const nextStep = STEPS[currentStep + 1];
          if (nextStep.navigateTo) {
            history.push(nextStep.navigateTo);
          }
          setCurrentStep((prev) => prev + 1);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentStep, catalog, device, cart]);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const isCompleted = step.completionCheck ? step.completionCheck() : false;

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
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Progress dots */}
        <div style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(i === currentStep ? styles.dotActive : {}),
                ...(i < currentStep ? styles.dotCompleted : {}),
              }}
            />
          ))}
        </div>

        {/* Step number */}
        <span style={styles.stepNum}>
          {currentStep + 1} / {STEPS.length}
        </span>

        {/* Icon */}
        <div style={styles.iconWrap}>{step.icon}</div>

        {/* Content */}
        <span style={styles.title}>{step.title}</span>
        <span style={styles.description}>{step.description}</span>

        {/* Tip */}
        {step.tip && (
          <div style={styles.tipBox}>
            <span style={styles.tipLabel}>💡 Tip</span>
            <span style={styles.tipText}>{step.tip}</span>
          </div>
        )}

        {/* Completion indicator */}
        {step.completionCheck && isCompleted && (
          <div style={styles.completedBadge}>
            <FiCheckCircle size={16} color="#10b981" />
            <span style={styles.completedText}>Done! Moving to next step...</span>
          </div>
        )}

        {/* Buttons */}
        <div style={styles.buttonsRow}>
          <div style={styles.buttonsLeft}>
            {!isFirst && !isLast && (
              <button style={styles.backBtn} onClick={goBack}>
                <FiArrowLeft size={14} color="#64748b" />
                <span style={styles.backTxt}>Back</span>
              </button>
            )}
            {!isLast && (
              <button style={styles.skipBtn} onClick={skip}>
                <span style={styles.skipTxt}>Skip Guide</span>
              </button>
            )}
          </div>
          {(!step.completionCheck || !isCompleted) && (
            <button style={styles.nextBtn} onClick={goNext}>
              <span style={styles.nextTxt}>
                {step.actionLabel || "Next"}
              </span>
              {!isLast && <FiArrowRight size={14} color="#fff" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 99999,
    maxWidth: 380,
    width: "calc(100vw - 48px)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "20px 22px 18px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  dotsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    transition: "all 0.2s",
  },
  dotActive: {
    backgroundColor: "#1D294E",
    width: 20,
  },
  dotCompleted: {
    backgroundColor: "#10b981",
  },
  stepNum: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontWeight: "400",
    color: "#64748b",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
    marginBottom: 12,
  },
  tipBox: {
    padding: "10px 12px",
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    border: "1px solid #fef3c7",
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },
  tipText: {
    fontSize: 12,
    color: "#a16207",
    lineHeight: "1.5",
  },
  completedBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    border: "1px solid #bbf7d0",
    marginBottom: 12,
  },
  completedText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#16a34a",
  },
  buttonsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  buttonsLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    height: 36,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 6px",
  },
  backTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  skipBtn: {
    height: 36,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 6px",
  },
  skipTxt: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  nextBtn: {
    height: 38,
    paddingLeft: 18,
    paddingRight: 16,
    backgroundColor: "#1D294E",
    borderRadius: 10,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },
  nextTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
};

export default Walkthrough;
