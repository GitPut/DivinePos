import React, { useRef, useEffect } from "react";
import { FiShoppingBag, FiTruck, FiPhone, FiMapPin, FiArrowLeft } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
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
  const secondaryColor = onlineStore.secondaryColor || "#f59e0b";
  const accentColor = onlineStore.accentColor || "#10b981";
  const c = getContrastStyles(bgColor);
  const fontClass = `font-${onlineStore.fontStyle || "modern"}`;
  const heroImage = onlineStore.heroImageUrl || heroPizza;
  const hasCustomHero = !!onlineStore.heroImageUrl;
  const displayHeadline = onlineStore.headline || storeDetails.name;
  const displaySubheadline = onlineStore.subheadline || onlineStore.tagline || "Fresh, hot, and made to order.\nChoose how you'd like to get your food.";
  const socialLinks = onlineStore.socialLinks || {};
  const hasSocials = !!(socialLinks.facebook || socialLinks.instagram || socialLinks.twitter);
  const pizzaRef = useRef<HTMLImageElement>(null);

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

  // Interactive parallax on non-custom hero
  useEffect(() => {
    if (isMobile || hasCustomHero) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!pizzaRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      pizzaRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };
    const handleMouseLeave = () => {
      if (pizzaRef.current) pizzaRef.current.style.transform = "translate(0, 0) scale(1)";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile, hasCustomHero]);

  const addressText = storeDetails.address?.value?.structured_formatting?.main_text;
  const addressFull = storeDetails.address?.value?.description || storeDetails.address?.label;
  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;

  // Full-width hero layout when custom hero image is set
  if (hasCustomHero) {
    return (
      <div className={fontClass} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
        {/* Hero background image */}
        <img src={heroImage} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        {/* Gradient overlay */}
        <div className={isMobile ? "online-store-hero-overlay-mobile" : "online-store-hero-overlay"} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: isMobile ? "flex-end" : "center", padding: isMobile ? "0 24px 40px" : "0 64px" }}>
          <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Logo */}
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, alignSelf: "flex-start", marginBottom: 8 }} onClick={handleLogoClick}>
              {hasLogo ? (
                <img src={storeDetails.logoUrl!} style={{ height: 56, maxWidth: 200, objectFit: "contain" }} alt="" />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <span style={{ fontSize: 26, fontWeight: "800", color: "#fff" }}>{(storeDetails.name || "S").charAt(0)}</span>
                </div>
              )}
            </button>

            {/* Headline */}
            <h1 style={{ fontWeight: "900", color: "#fff", fontSize: isMobile ? 36 : 52, letterSpacing: -1, lineHeight: "1.05", margin: 0, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              {displayHeadline}
            </h1>

            {/* Subheadline */}
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: "1.6", margin: 0, maxWidth: 420, whiteSpace: "pre-line" as const }}>
              {displaySubheadline}
            </p>

            {/* Info chips */}
            <div style={{ display: "flex", flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {storeDetails.phoneNumber && (
                <a href={`tel:${storeDetails.phoneNumber}`} className="frosted-glass" style={{ fontSize: 12, color: "#fff", padding: "6px 14px", borderRadius: 20, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <FiPhone size={12} /> {formatPhone(storeDetails.phoneNumber)}
                </a>
              )}
              {addressText && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull || addressText)}`} target="_blank" rel="noopener noreferrer" className="frosted-glass" style={{ fontSize: 12, color: "#fff", padding: "6px 14px", borderRadius: 20, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <FiMapPin size={12} /> {addressText}
                </a>
              )}
              {isFranchiseStore && (
                <button onClick={handleLogoClick} className="frosted-glass" style={{ fontSize: 12, color: "#fff", padding: "6px 14px", borderRadius: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <FiArrowLeft size={12} /> Change Location
                </button>
              )}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginTop: 20 }}>
              <button
                onClick={() => setOrderDetailsState({ page: 2 })}
                style={{ flex: 1, height: 56, backgroundColor: accentColor, border: "none", borderRadius: 14, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}66`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <FiShoppingBag size={18} color="#fff" />
                <span style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>Order Pickup</span>
              </button>

              {storeDetails.acceptDelivery && (
                <button
                  onClick={() => setOrderDetailsState({ ...orderDetails, delivery: true, page: 3 })}
                  style={{ flex: 1, height: 56, backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transition: "background-color 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; }}
                >
                  <FiTruck size={18} color="#fff" />
                  <span style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                    Order Delivery
                    {storeDetails.deliveryPrice && parseFloat(storeDetails.deliveryPrice) > 0 ? ` · $${parseFloat(storeDetails.deliveryPrice).toFixed(2)}` : ""}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Footer with socials */}
          <div style={{ position: "absolute", bottom: 24, left: isMobile ? 24 : 64, right: isMobile ? 24 : 64, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Powered by Divine POS</span>
            {hasSocials && (
              <div style={{ display: "flex", gap: 12 }}>
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="online-store-social-icon"><FaFacebookF size={16} color="#fff" /></a>}
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="online-store-social-icon"><FaInstagram size={16} color="#fff" /></a>}
                {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="online-store-social-icon"><FaXTwitter size={16} color="#fff" /></a>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default layout (no custom hero — split layout with parallax pizza)
  return (
    <div className={fontClass} style={{ ...styles.page, backgroundColor: bgColor }}>
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
            {displayHeadline}
          </h1>

          <p style={{ ...styles.subtitle, color: c.textFaint }}>{displaySubheadline}</p>

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

        {/* CTA Buttons */}
        <div style={styles.ctaGroup}>
          <button
            onClick={() => setOrderDetailsState({ page: 2 })}
            style={{ ...styles.ctaBtn, backgroundColor: accentColor, borderColor: accentColor }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}66`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <div style={{ ...styles.ctaIconCircle, backgroundColor: "rgba(255,255,255,0.2)" }}>
              <FiShoppingBag size={20} color="#fff" />
            </div>
            <div style={styles.btnTextGroup}>
              <span style={{ ...styles.ctaBtnTitle, color: "#fff" }}>Pickup</span>
              <span style={{ ...styles.ctaBtnDesc, color: "rgba(255,255,255,0.7)" }}>Ready when you arrive</span>
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
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...styles.poweredBy, color: c.textFaint }}>Powered by Divine POS</span>
          {hasSocials && (
            <div style={{ display: "flex", gap: 12 }}>
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="online-store-social-icon"><FaFacebookF size={14} color={c.textFaint} /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="online-store-social-icon"><FaInstagram size={14} color={c.textFaint} /></a>}
              {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="online-store-social-icon"><FaXTwitter size={14} color={c.textFaint} /></a>}
            </div>
          )}
        </div>
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
    transition: "transform 0.15s, box-shadow 0.15s, background-color 0.2s, border-color 0.2s",
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
