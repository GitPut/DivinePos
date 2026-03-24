import React, { useRef, useEffect } from "react";
import { FiShoppingBag, FiTruck, FiPhone, FiMapPin, FiArrowLeft } from "react-icons/fi";
import {
  orderDetailsState,
  setOrderDetailsState,
  storeDetailsState,
  onlineStoreState,
} from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import heroPizza from "assets/images/hero-pizza.png";
import { getContrastStyles } from "utils/colorContrast";
import { formatPhone } from "utils/phoneValidation";

function StoreFront() {
  const storeDetails = storeDetailsState.use();
  const orderDetails = orderDetailsState.use();
  const onlineStore = onlineStoreState.use();
  const page = orderDetails.page;
  const { width: screenWidth } = useWindowSize();
  const isMobile = screenWidth < 700;
  const bgColor = onlineStore.brandColor || "#0d0d0d";
  const c = getContrastStyles(bgColor);
  const storeTagline = onlineStore.tagline || "Fresh, hot, and made to order.\nChoose how you'd like to get your food.";
  const pizzaRef = useRef<HTMLImageElement>(null);

  // Interactive pizza — follows mouse with parallax
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!pizzaRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      pizzaRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };
    const handleMouseLeave = () => {
      if (pizzaRef.current) {
        pizzaRef.current.style.transform = "translate(0, 0) scale(1)";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile]);

  const addressText = storeDetails.address?.value?.structured_formatting?.main_text;
  const addressFull = storeDetails.address?.value?.description || storeDetails.address?.label;

  const isFranchiseStore = !!orderDetails.selectedLocationUid;

  const handleLogoClick = () => {
    if (page === 5) {
      setOrderDetailsState({ page: 4 });
    } else if (isFranchiseStore) {
      setOrderDetailsState({ ...orderDetails, delivery: false, address: null, page: 0, selectedLocationUid: null });
    } else {
      setOrderDetailsState({ ...orderDetails, delivery: false, address: null, page: 1 });
    }
  };

  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;

  return (
    <div style={{ ...styles.page, backgroundColor: bgColor }}>
      {/* Left side — content */}
      <div style={{
        ...styles.leftPanel,
        ...(isMobile ? { width: "100%", padding: "48px 24px 32px" } : {}),
      }}>
        {/* Logo */}
        <button style={styles.logoBtn} onClick={handleLogoClick}>
          {hasLogo ? (
            <img src={storeDetails.logoUrl!} style={styles.logoImg} alt="" />
          ) : (
            <div style={{ ...styles.logoFallback, backgroundColor: c.overlay, borderColor: c.overlayBorder }}>
              <span style={{ ...styles.logoLetter, color: c.text }}>
                {(storeDetails.name || "S").charAt(0)}
              </span>
            </div>
          )}
        </button>

        {/* Main content */}
        <div style={styles.textContent}>
          <h1 style={{
            ...styles.storeName,
            color: c.text,
            fontSize: isMobile ? 34 : 46,
          }}>
            {storeDetails.name}
          </h1>

          <p style={{ ...styles.subtitle, color: c.textFaint }}>{storeTagline}</p>

          {/* Info chips */}
          <div style={styles.infoRow}>
            {storeDetails.phoneNumber && (
              <a href={`tel:${storeDetails.phoneNumber}`} style={{ ...styles.infoChip, color: c.textFaint, borderColor: c.divider, textDecoration: "none" }}>
                <FiPhone size={12} color={c.textFaint} />
                {formatPhone(storeDetails.phoneNumber)}
              </a>
            )}
            {addressText && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull || addressText)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.infoChip, color: c.textFaint, borderColor: c.divider, textDecoration: "none" }}
              >
                <FiMapPin size={12} color={c.textFaint} />
                {addressText}
              </a>
            )}
            {isFranchiseStore && (
              <button
                onClick={handleLogoClick}
                style={{ ...styles.infoChip, color: c.textMuted, borderColor: c.divider, background: "none", cursor: "pointer", fontWeight: "500" }}
              >
                <FiArrowLeft size={12} color={c.textMuted} />
                Change Location
              </button>
            )}
          </div>
        </div>

        {/* CTA Buttons — stacked */}
        <div style={styles.ctaGroup}>
          <button
            className={c.isLight ? "online-store-cta-btn-light" : "online-store-cta-btn"}
            style={{ ...styles.ctaBtn, backgroundColor: c.overlay, borderColor: c.overlayBorder }}
            onClick={() => setOrderDetailsState({ page: 2 })}
          >
            <div style={{ ...styles.ctaIconCircle, backgroundColor: c.iconCircleBg }}>
              <FiShoppingBag size={20} color={c.text} />
            </div>
            <div style={styles.btnTextGroup}>
              <span style={{ ...styles.ctaBtnTitle, color: c.text }}>Pickup</span>
              <span style={{ ...styles.ctaBtnDesc, color: c.textMuted }}>Ready when you arrive</span>
            </div>
          </button>

          {storeDetails.acceptDelivery && (
            <button
              className={c.isLight ? "online-store-cta-btn-light" : "online-store-cta-btn"}
              style={{ ...styles.ctaBtn, backgroundColor: c.overlay, borderColor: c.overlayBorder }}
              onClick={() => setOrderDetailsState({ ...orderDetails, delivery: true, page: 3 })}
            >
              <div style={{ ...styles.ctaIconCircle, backgroundColor: c.iconCircleBg }}>
                <FiTruck size={20} color={c.text} />
              </div>
              <div style={styles.btnTextGroup}>
                <span style={{ ...styles.ctaBtnTitle, color: c.text }}>Delivery</span>
                <span style={{ ...styles.ctaBtnDesc, color: c.textMuted }}>
                  Straight to your door
                  {storeDetails.deliveryPrice && parseFloat(storeDetails.deliveryPrice) > 0
                    ? ` · $${parseFloat(storeDetails.deliveryPrice).toFixed(2)}`
                    : ""}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <span style={{ ...styles.poweredBy, color: c.textFaint }}> Powered by Divine POS</span>
      </div>

      {/* Right side — hero pizza image (desktop only) */}
      {!isMobile && (
        <div style={styles.rightPanel}>
          <img ref={pizzaRef} src={heroPizza} style={styles.heroImg} alt="" />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0d0d0d",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  leftPanel: {
    width: "50%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "48px 56px 32px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
  },
  logoBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginBottom: 40,
    alignSelf: "flex-start",
  },
  logoImg: {
    height: 50,
    maxWidth: 180,
    objectFit: "contain" as const,
  },
  logoFallback: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  textContent: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 36,
  },
  storeName: {
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
    lineHeight: "1.05",
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: 360,
    whiteSpace: "pre-line" as const,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 8,
    flexWrap: "wrap" as const,
    marginTop: 4,
  },
  infoChip: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    padding: "5px 12px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  ctaGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    width: "100%",
    maxWidth: 400,
  },
  ctaBtn: {
    width: "100%",
    height: 70,
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 14,
    padding: "0 20px",
    cursor: "pointer",
    transition: "background-color 0.2s, border-color 0.2s",
  },
  ctaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  btnTextGroup: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    gap: 1,
  },
  ctaBtnTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  ctaBtnDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "400",
  },
  poweredBy: {
    fontSize: 11,
    color: "rgba(255,255,255,0.1)",
    marginTop: "auto",
  },
  rightPanel: {
    width: "50%",
    height: "100%",
    position: "relative" as const,
    overflow: "hidden",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    objectPosition: "left center",
    transition: "transform 0.3s ease-out",
  },
};

export default StoreFront;
