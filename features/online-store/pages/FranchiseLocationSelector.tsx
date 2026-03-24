import React, { useEffect, useState } from "react";
import { FiMapPin, FiPhone, FiNavigation, FiTruck, FiStar } from "react-icons/fi";
import { storeDetailsState, onlineStoreState } from "store/appState";
import useWindowSize from "shared/hooks/useWindowSize";
import { getContrastStyles } from "utils/colorContrast";
import { formatPhone } from "utils/phoneValidation";
import { FranchiseLocationInfo } from "types";

interface FranchiseLocationSelectorProps {
  locations: FranchiseLocationInfo[];
  onSelect: (location: FranchiseLocationInfo) => void;
}

function FranchiseLocationSelector({ locations, onSelect }: FranchiseLocationSelectorProps) {
  const storeDetails = storeDetailsState.use();
  const onlineStore = onlineStoreState.use();
  const { width: screenWidth } = useWindowSize();
  const isMobile = screenWidth < 700;
  const bgColor = onlineStore.brandColor || "#0d0d0d";
  const accentColor = onlineStore.accentColor || "#10b981";
  const c = getContrastStyles(bgColor);
  const fontClass = `font-${onlineStore.fontStyle || "modern"}`;
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getDistance = (loc: FranchiseLocationInfo): number | null => {
    if (!userCoords || !loc.coordinates) return null;
    return haversineDistance(userCoords.lat, userCoords.lng, loc.coordinates.lat, loc.coordinates.lng);
  };

  const sortedLocations = [...locations].sort((a, b) => {
    const distA = getDistance(a);
    const distB = getDistance(b);
    if (distA !== null && distB !== null) return distA - distB;
    if (distA !== null) return -1;
    if (distB !== null) return 1;
    return a.name.localeCompare(b.name);
  });

  const nearestUid = sortedLocations.length > 0 && getDistance(sortedLocations[0]) !== null ? sortedLocations[0].uid : null;
  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;
  const heroImage = onlineStore.heroImageUrl;

  return (
    <div className={fontClass} style={{ width: "100%", height: "100%", position: "relative", overflow: "auto" }}>
      {/* Background */}
      {heroImage ? (
        <>
          <img src={heroImage} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} alt="" />
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 1 }} />
        </>
      ) : (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: bgColor, zIndex: 0 }} />
      )}

      <div style={{ position: "relative", zIndex: 2, width: "100%", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "40px 20px" : "48px 32px", boxSizing: "border-box" }}>
        {/* Logo */}
        {hasLogo ? (
          <img src={storeDetails.logoUrl!} style={{ height: 56, maxWidth: 200, objectFit: "contain", marginBottom: 20 }} alt="" />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: heroImage ? "rgba(255,255,255,0.15)" : c.overlay, backdropFilter: heroImage ? "blur(8px)" : undefined, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: `1px solid ${heroImage ? "rgba(255,255,255,0.2)" : c.overlayBorder}` }}>
            <span style={{ fontSize: 28, fontWeight: "800", color: "#fff" }}>{(storeDetails.name || "S").charAt(0)}</span>
          </div>
        )}

        <span style={{ fontSize: isMobile ? 28 : 34, fontWeight: "900", color: "#fff", textAlign: "center", letterSpacing: -0.5 }}>
          {onlineStore.headline || storeDetails.name}
        </span>
        <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32, marginTop: 6 }}>
          Choose a location to order from
        </span>

        {/* Location cards */}
        <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedLocations.map((location) => {
            const dist = getDistance(location);
            const isNearest = location.uid === nearestUid;
            const addressLabel = location.address?.value?.structured_formatting?.main_text || location.address?.label || "";

            return (
              <button
                key={location.uid}
                className="online-store-product-card"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 22px",
                  borderRadius: 16,
                  border: isNearest ? `2px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: isNearest ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  textAlign: "left" as const,
                  backdropFilter: "blur(8px)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => onSelect(location)}
              >
                {/* Nearest badge */}
                {isNearest && (
                  <div style={{ position: "absolute", top: 0, right: 0, backgroundColor: accentColor, padding: "4px 12px 4px 14px", borderBottomLeftRadius: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    <FiStar size={10} color="#fff" />
                    <span style={{ fontSize: 10, fontWeight: "700", color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>Nearest</span>
                  </div>
                )}

                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FiMapPin size={22} color="#fff" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 17, fontWeight: "700", color: "#fff" }}>{location.name}</span>
                  {addressLabel && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{addressLabel}</span>}
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2, flexWrap: "wrap" }}>
                    {location.phoneNumber && (
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                        <FiPhone size={10} /> {formatPhone(location.phoneNumber)}
                      </span>
                    )}
                    {dist !== null && (
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                        <FiNavigation size={10} /> {dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`}
                      </span>
                    )}
                    {location.acceptDelivery && (
                      <span style={{ fontSize: 10, fontWeight: "600", color: "#fff", backgroundColor: accentColor, padding: "2px 8px", borderRadius: 10 }}>
                        <FiTruck size={10} style={{ marginRight: 3 }} />Delivery
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: "auto", paddingTop: 32 }}>Powered by Divine POS</span>
      </div>
    </div>
  );
}

export default FranchiseLocationSelector;
