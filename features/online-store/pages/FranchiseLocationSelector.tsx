import React, { useEffect, useState } from "react";
import { FiMapPin, FiPhone, FiNavigation } from "react-icons/fi";
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
  const c = getContrastStyles(bgColor);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Try to get user location for distance sorting
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // Permission denied — just show alphabetical
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

  const hasLogo = storeDetails.hasLogo && storeDetails.logoUrl;

  return (
    <div style={{ ...styles.page, backgroundColor: bgColor }}>
      <div style={{
        ...styles.content,
        ...(isMobile ? { padding: "40px 20px" } : {}),
      }}>
        {/* Logo */}
        {hasLogo ? (
          <img src={storeDetails.logoUrl!} style={styles.logo} alt="" />
        ) : (
          <div style={{ ...styles.logoFallback, backgroundColor: c.overlay, borderColor: c.overlayBorder }}>
            <span style={{ ...styles.logoLetter, color: c.text }}>
              {(storeDetails.name || "S").charAt(0)}
            </span>
          </div>
        )}

        <span style={{ ...styles.title, color: c.text }}>
          {storeDetails.name}
        </span>
        <span style={{ ...styles.subtitle, color: c.textFaint }}>
          Choose a location to order from
        </span>

        {/* Location cards */}
        <div style={styles.locationList}>
          {sortedLocations.map((location) => {
            const dist = getDistance(location);
            const addressLabel = location.address?.value?.structured_formatting?.main_text
              || location.address?.label
              || "";

            return (
              <button
                key={location.uid}
                className={c.isLight ? "online-store-cta-btn-light" : "online-store-cta-btn"}
                style={{ ...styles.locationCard, backgroundColor: c.overlay, borderColor: c.overlayBorder }}
                onClick={() => onSelect(location)}
              >
                <div style={{ ...styles.iconCircle, backgroundColor: c.iconCircleBg }}>
                  <FiMapPin size={20} color={c.text} />
                </div>
                <div style={styles.locationInfo}>
                  <span style={{ ...styles.locationName, color: c.text }}>{location.name}</span>
                  {addressLabel && (
                    <span style={{ ...styles.locationAddress, color: c.textMuted }}>{addressLabel}</span>
                  )}
                  <div style={styles.locationMeta}>
                    {location.phoneNumber && (
                      <span style={{ ...styles.metaChip, color: c.textFaint }}>
                        <FiPhone size={10} />
                        {formatPhone(location.phoneNumber)}
                      </span>
                    )}
                    {dist !== null && (
                      <span style={{ ...styles.metaChip, color: c.textFaint }}>
                        <FiNavigation size={10} />
                        {dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`}
                      </span>
                    )}
                    {location.acceptDelivery && (
                      <span style={{ ...styles.deliveryBadge, color: c.text, backgroundColor: c.iconCircleBg }}>
                        Delivery
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <span style={{ ...styles.poweredBy, color: c.textFaint }}>Powered by Divine POS</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "auto",
  },
  content: {
    width: "100%",
    maxWidth: 540,
    padding: "48px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    boxSizing: "border-box",
  },
  logo: {
    height: 56,
    maxWidth: 200,
    objectFit: "contain" as const,
    marginBottom: 16,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    border: "1px solid transparent",
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: "800",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center" as const,
    marginBottom: 24,
  },
  locationList: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  locationCard: {
    width: "100%",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    borderRadius: 16,
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "background-color 0.2s, border-color 0.2s",
    textAlign: "left" as const,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locationInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
    minWidth: 0,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "700",
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: "400",
  },
  locationMeta: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap" as const,
  },
  metaChip: {
    fontSize: 11,
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 4,
  },
  deliveryBadge: {
    fontSize: 10,
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: 10,
  },
  poweredBy: {
    fontSize: 11,
    marginTop: "auto",
    paddingTop: 32,
  },
};

export default FranchiseLocationSelector;
