import React, { useCallback, useEffect, useRef, useState } from "react";
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
  FiPrinter,
  FiDownload,
  FiLayout,
} from "react-icons/fi";
import { storeProductsState, deviceState, cartState, deviceTreeState, productBuilderState } from "store/appState";
import { auth } from "services/firebase/config";

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  navigateTo?: string;
  completionCheck?: () => boolean;
  actionLabel?: string;
  tip?: string;
  highlightTarget?: string; // data-walkthrough attribute value
  highlightLabel?: string; // label shown next to highlight
  position?: "bottom" | "top" | "left" | "right" | "center";
  advanceOnClick?: boolean; // auto-advance when highlighted element is clicked
}

const STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to Divine POS!",
    description: "We'll walk you through setting up your register, building your menu, and placing your first order.\n\nIt only takes a few minutes.",
    icon: <FiCheckCircle size={22} color="#1D294E" />,
    actionLabel: "Let's Get Started",
    position: "center",
  },
  {
    id: "device-add",
    title: "Add Your Device",
    description: "This registers your computer or tablet as a POS station. Click the highlighted button below.",
    icon: <FiMonitor size={22} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    highlightTarget: "add-device",
    highlightLabel: "Click here to add",
    completionCheck: () => deviceTreeState.get().devices.length > 0,
    position: "bottom",
  },
  {
    id: "device-name",
    title: "Name Your Device",
    description: "Give this register a name so you can tell it apart from other devices. For example: \"Front Counter\" or \"Kitchen iPad\".",
    icon: <FiMonitor size={22} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    highlightTarget: "device-name",
    highlightLabel: "Type a name here",
    actionLabel: "Done, Next",
    position: "bottom",
  },
  {
    id: "device-setid",
    title: "Link This Browser",
    description: "Click the button below to connect this browser to your device. This lets the system know which register you're using.",
    icon: <FiMonitor size={22} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    highlightTarget: "set-device-id",
    highlightLabel: "Click to connect",
    completionCheck: () => {
      const d = deviceTreeState.get();
      return d.devices.length > 0 && !!d.devices[d.devices.length - 1]?.id;
    },
    position: "bottom",
  },
  {
    id: "device-printer",
    title: "Connect Your Printer",
    description: "If you have a receipt printer, type its exact name here. You can find it in your computer's \"Printers & Scanners\" settings.\n\nNo printer? Just click Next to skip this for now.",
    icon: <FiPrinter size={22} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    highlightTarget: "printer-name",
    highlightLabel: "Type printer name",
    actionLabel: "Next",
    position: "bottom",
  },
  {
    id: "device-save",
    title: "Save Everything",
    description: "Click the Save button below to save your device settings.",
    icon: <FiMonitor size={22} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    highlightTarget: "save-device",
    highlightLabel: "Click to save",
    advanceOnClick: true,
    position: "top",
  },
  {
    id: "device-download",
    title: "Get the Printer Helper",
    description: "To print receipts, you need our free helper app running on this computer. Click the download button for your operating system (Windows or Mac).\n\nYou can always come back to this page later.",
    icon: <FiDownload size={22} color="#06b6d4" />,
    navigateTo: "/authed/settings/devicesettings",
    highlightTarget: "download-helper",
    highlightLabel: "Download for your OS",
    actionLabel: "Continue",
    position: "top",
    tip: "After downloading, install and open the app. It runs quietly in the background and connects your printer automatically.",
  },
  {
    id: "category-click",
    title: "Create Your Menu Categories",
    description: "Categories group your products on the menu. For example: \"Pizza\", \"Drinks\", \"Sides\".\n\nClick the highlighted button to create one.",
    icon: <FiTag size={22} color="#ec4899" />,
    navigateTo: "/authed/product/categorylist-product",
    highlightTarget: "add-category",
    highlightLabel: "Click to create category",
    advanceOnClick: true,
    position: "bottom",
  },
  {
    id: "category-name",
    title: "Name Your Category",
    description: "Type a name for your category (e.g. \"Pizza\", \"Drinks\").",
    icon: <FiTag size={22} color="#ec4899" />,
    highlightTarget: "category-name-input",
    highlightLabel: "Type category name",
    actionLabel: "Next",
    position: "bottom",
  },
  {
    id: "category-save",
    title: "Save Your Category",
    description: "Click the button below to save your new category.",
    icon: <FiTag size={22} color="#ec4899" />,
    highlightTarget: "save-category",
    highlightLabel: "Click to save",
    advanceOnClick: true,
    position: "top",
    tip: "You can create more categories later and drag them to reorder.",
  },
  {
    id: "product-click",
    title: "Add Your First Product",
    description: "Now let's add something to sell! Click the button below to open the product editor.",
    icon: <FiShoppingBag size={22} color="#f97316" />,
    navigateTo: "/authed/product/productlist-product",
    highlightTarget: "add-product",
    highlightLabel: "Click to add product",
    advanceOnClick: true,
    position: "bottom",
  },
  {
    id: "product-details",
    title: "Fill In Product Details",
    description: "Fill in the following fields:\n\n1. Product Name — what customers see\n2. Price — the base price\n3. Category — which menu section\n4. Description — optional, for customers\n5. Image — optional, upload a photo\n\nFill these in, then click Next.",
    icon: <FiShoppingBag size={22} color="#f97316" />,
    actionLabel: "Next",
    position: "center",
  },
  {
    id: "product-options",
    title: "Add Options (Optional)",
    description: "Options let customers customize their order:\n\n• \"Add from Template\" — pre-built options like Sizes, Toppings, Crust. One click!\n\n• \"Create Custom\" — build your own. Set a name, pick a display type, add choices with prices.\n\nScroll down to the Options section. Add some now or skip and edit later.",
    icon: <FiShoppingBag size={22} color="#f97316" />,
    actionLabel: "Next",
    position: "center",
    tip: "Each option has a Name (e.g. \"Size\"), a Type (buttons, dropdown, grid), and Choices (\"Small $0\", \"Large +$2\").",
  },
  {
    id: "product-save",
    title: "Save Your Product",
    description: "Click \"Add Product\" at the top right to save.\n\nYou can always come back to edit it later.",
    icon: <FiShoppingBag size={22} color="#f97316" />,
    actionLabel: "I Saved It",
    position: "center",
    completionCheck: () => storeProductsState.get().products.length > 0,
  },
  {
    id: "templates-info",
    title: "Reusable Option Templates",
    description: "We've pre-loaded option templates for common setups like pizza sizes, crust types, sauces, and toppings.\n\nWhen you edit a product, click \"Add from Template\" to attach any of these. You can also create your own custom templates here.",
    icon: <FiLayout size={22} color="#8b5cf6" />,
    navigateTo: "/authed/product/option-templates",
    actionLabel: "Got It",
    position: "center",
    tip: "If you update a template later, you can sync the changes to all products that use it.",
  },
  {
    id: "pos",
    title: "Place Your First Order!",
    description: "You're all set up! Let's try it out:\n\n1. Tap any product on the menu\n2. Customize it if it has options\n3. Review your cart on the right\n4. Press Cash or Card to complete the sale",
    icon: <FiGrid size={22} color="#10b981" />,
    navigateTo: "/pos",
    completionCheck: () => cartState.get().length > 0,
    actionLabel: "I'm Done",
    position: "center",
    tip: "The sidebar icons give you quick access to Orders, Tables, Clock-In, Delivery, Discounts, and more.",
  },
  {
    id: "complete",
    title: "You're Ready to Go!",
    description: "Your store is set up and ready for business! Here are some things to explore when you're ready:\n\n• General Settings — Tax rate, delivery range\n• Employees — Add staff with PINs\n• Tables — Dine-in table management\n• Online Store — Let customers order online\n• Dashboard — Track your sales\n\nYou can restart this guide anytime from the sidebar.",
    icon: <FiCheckCircle size={22} color="#10b981" />,
    actionLabel: "Finish",
    position: "center",
  },
];

interface WalkthroughProps {
  isVisible: boolean;
  onClose: () => void;
}

function Walkthrough({ isVisible, onClose }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<React.CSSProperties>({ position: "fixed", bottom: 24, right: 24 });
  const history = useHistory();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  const catalog = storeProductsState.use();
  const device = deviceState.use();
  const cart = cartState.use();
  const deviceTree = deviceTreeState.use();
  const productBuilder = productBuilderState.use();

  // Track highlighted element position in real-time
  const updateHighlight = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step?.highlightTarget) {
      setHighlightRect(null);
      return;
    }
    const el = document.querySelector(`[data-walkthrough="${step.highlightTarget}"]`);
    if (el) {
      setHighlightRect(el.getBoundingClientRect());
    } else {
      setHighlightRect(null);
    }
  }, [currentStep]);

  // Scroll highlighted element into view when step changes
  useEffect(() => {
    if (!isVisible) return;
    const step = STEPS[currentStep];
    if (!step?.highlightTarget) return;

    // Try multiple times — element might not exist yet after navigation
    let attempts = 0;
    const tryScroll = () => {
      const el = document.querySelector(`[data-walkthrough="${step.highlightTarget}"]`);
      if (el) {
        // Find the nearest scrollable parent
        let scrollParent: HTMLElement | null = el.parentElement;
        while (scrollParent) {
          const overflow = getComputedStyle(scrollParent).overflowY;
          if (overflow === "auto" || overflow === "scroll") break;
          scrollParent = scrollParent.parentElement;
        }

        if (scrollParent) {
          // Scroll within the scrollable container
          const elRect = el.getBoundingClientRect();
          const parentRect = scrollParent.getBoundingClientRect();
          const offsetTop = elRect.top - parentRect.top + scrollParent.scrollTop;
          const targetScroll = offsetTop - parentRect.height / 3;
          scrollParent.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Update highlight position after scroll completes
        setTimeout(updateHighlight, 400);
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryScroll, 200);
      }
    };

    const timer = setTimeout(tryScroll, 150);
    return () => clearTimeout(timer);
  }, [isVisible, currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    updateHighlight();

    // Use scroll + resize listeners on capture phase for instant tracking
    const onScroll = () => rafRef.current = requestAnimationFrame(updateHighlight);
    window.addEventListener("scroll", onScroll, true); // capture phase catches all scrollable containers
    window.addEventListener("resize", onScroll);

    // Also poll slowly as fallback for layout shifts
    pollRef.current = setInterval(updateHighlight, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      if (pollRef.current) clearInterval(pollRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, currentStep, updateHighlight]);

  // Auto-advance when highlighted element is clicked
  useEffect(() => {
    if (!isVisible) return;
    const step = STEPS[currentStep];
    if (!step?.advanceOnClick || !step.highlightTarget) return;

    const handler = () => {
      // Small delay to let the click action complete first
      setTimeout(() => {
        if (currentStep < STEPS.length - 1) {
          const nextStep = STEPS[currentStep + 1];
          if (nextStep.navigateTo) history.push(nextStep.navigateTo);
          setCurrentStep((prev) => prev + 1);
        }
      }, 500);
    };

    // Poll for element since it may not exist yet
    const interval = setInterval(() => {
      const el = document.querySelector(`[data-walkthrough="${step.highlightTarget}"]`);
      if (el) {
        el.addEventListener("click", handler, { once: true });
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      const el = document.querySelector(`[data-walkthrough="${step?.highlightTarget}"]`);
      if (el) el.removeEventListener("click", handler);
    };
  }, [isVisible, currentStep]);

  // Auto-advance on completion
  useEffect(() => {
    if (!isVisible) return;
    if (currentStep >= STEPS.length) return;
    const step = STEPS[currentStep];
    if (!step || !step.completionCheck) return;

    // Don't auto-advance on step 0 (welcome) — let user click
    if (currentStep === 0) return;

    try {
      if (step.completionCheck()) {
        const timer = setTimeout(() => {
          if (currentStep < STEPS.length - 1) {
            const nextStep = STEPS[currentStep + 1];
            if (nextStep?.navigateTo) history.push(nextStep.navigateTo);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // completionCheck may fail if state isn't ready
    }
  }, [isVisible, currentStep, catalog, device, cart, deviceTree]);

  // Position card near highlighted element on step change
  useEffect(() => {
    if (!isVisible) return;
    const step = STEPS[currentStep];
    if (!step?.highlightTarget || step.position === "center") {
      setCardPos({ position: "fixed", bottom: 24, right: 24 });
      return;
    }
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-walkthrough="${step.highlightTarget}"]`);
      if (!el) {
        setCardPos({ position: "fixed", bottom: 24, right: 24 });
        return;
      }
      const rect = el.getBoundingClientRect();
      const cardWidth = 360;
      const estimatedCardHeight = 260;
      const pad = 16;
      const spaceBelow = window.innerHeight - rect.bottom - pad;
      const left = Math.min(Math.max(16, rect.left), window.innerWidth - cardWidth - 16);
      if (spaceBelow >= estimatedCardHeight) {
        setCardPos({ position: "fixed", top: rect.bottom + pad, left });
      } else {
        setCardPos({ position: "fixed", bottom: window.innerHeight - rect.top + pad, left });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isVisible, currentStep]);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setHighlightRect(null);
      setCardPos({ position: "fixed", bottom: 24, right: 24 });
    }
  }, [isVisible]);

  if (!isVisible) return null;
  if (currentStep >= STEPS.length) return null;
  // Hide walkthrough when product builder modal is open so it doesn't block option clicks
  if (productBuilder.isOpen) return null;

  const step = STEPS[currentStep];
  if (!step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  let isCompleted = false;
  try { isCompleted = step.completionCheck ? step.completionCheck() : false; } catch {}
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const markDone = () => {
    const uid = auth.currentUser?.uid;
    localStorage.setItem(uid ? `walkthroughCompleted_${uid}` : "walkthroughCompleted", "true");
  };

  const goNext = () => {
    if (isLast) { markDone(); onClose(); return; }
    const nextIdx = currentStep + 1;
    if (nextIdx >= STEPS.length) { markDone(); onClose(); return; }
    const nextStep = STEPS[nextIdx];
    if (nextStep?.navigateTo) history.push(nextStep.navigateTo);
    setCurrentStep(nextIdx);
  };

  const goBack = () => {
    if (isFirst) return;
    const prevStep = STEPS[currentStep - 1];
    if (prevStep.navigateTo) history.push(prevStep.navigateTo);
    setCurrentStep((prev) => prev - 1);
  };

  const skip = () => { markDone(); onClose(); };

  const getCardStyle = (): React.CSSProperties => cardPos;

  const content = (
    <>
      {/* Spotlight overlay — uses box-shadow for smooth transitions */}
      {highlightRect && (
        <div style={styles.overlay}>
          {/* Cutout with massive box-shadow as overlay */}
          <div style={{
            position: "absolute",
            left: highlightRect.left - 6,
            top: highlightRect.top - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            borderRadius: 10,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
            border: "2px solid #1D294E",
            pointerEvents: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />
          {/* Highlight label */}
          {step.highlightLabel && (
            <div style={{
              position: "absolute",
              left: highlightRect.left,
              top: highlightRect.top - 30,
              backgroundColor: "#1D294E",
              color: "#fff",
              fontSize: 11,
              fontWeight: "600",
              padding: "4px 10px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              {step.highlightLabel}
            </div>
          )}
        </div>
      )}

      {/* Card */}
      <div style={{ ...styles.container, ...getCardStyle(), transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <div style={styles.card}>
          <button style={styles.closeBtn} onClick={skip} title="Close">
            <FiX size={14} color="#94a3b8" />
          </button>

          {/* Progress bar */}
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          <span style={styles.stepNum}>Step {currentStep + 1} of {STEPS.length}</span>

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={styles.iconWrap}>{step.icon}</div>
            <span style={styles.title}>{step.title}</span>
          </div>

          <span style={styles.description}>{step.description}</span>

          {step.tip && (
            <div style={styles.tipBox}>
              <span style={styles.tipText}>💡 {step.tip}</span>
            </div>
          )}

          {step.completionCheck && isCompleted && (
            <div style={styles.completedBadge}>
              <FiCheckCircle size={14} color="#10b981" />
              <span style={styles.completedText}>Done! Moving on...</span>
            </div>
          )}

          <div style={styles.buttonsRow}>
            <div style={styles.buttonsLeft}>
              {!isFirst && (
                <button style={styles.backBtn} onClick={goBack}>
                  <FiArrowLeft size={13} color="#64748b" />
                  <span style={styles.backTxt}>Back</span>
                </button>
              )}
              {!isLast && !isFirst && (
                <button style={styles.skipBtn} onClick={skip}>
                  <span style={styles.skipTxt}>Skip</span>
                </button>
              )}
            </div>
            {(!step.completionCheck || !isCompleted) && (
              <button style={styles.nextBtn} onClick={goNext}>
                <span style={styles.nextTxt}>{step.actionLabel || "Next"}</span>
                {!isLast && <FiArrowRight size={13} color="#fff" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(content, document.body);
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 99998,
    pointerEvents: "none",
  },
  container: {
    zIndex: 99999,
    width: 360,
    maxWidth: "calc(100vw - 48px)",
    pointerEvents: "auto" as const,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "16px 20px 14px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
    position: "relative",
    maxHeight: "70vh",
    overflowY: "auto",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#f8fafc",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    zIndex: 1,
  },
  progressBg: {
    height: 3,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1D294E",
    borderRadius: 2,
    transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  stepNum: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  description: {
    fontSize: 13,
    fontWeight: "400",
    color: "#64748b",
    lineHeight: "1.6",
    whiteSpace: "pre-line",
    marginBottom: 10,
  },
  tipBox: {
    padding: "8px 10px",
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    border: "1px solid #fef3c7",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: "#92400e",
    lineHeight: "1.5",
  },
  completedBadge: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    border: "1px solid #bbf7d0",
    marginBottom: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16a34a",
  },
  buttonsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  buttonsLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    height: 34,
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
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  skipBtn: {
    height: 34,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 6px",
  },
  skipTxt: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  nextBtn: {
    height: 36,
    paddingLeft: 16,
    paddingRight: 14,
    backgroundColor: "#1D294E",
    borderRadius: 9,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
  },
  nextTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
};

export default Walkthrough;
