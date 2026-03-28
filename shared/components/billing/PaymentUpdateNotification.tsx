import React from "react";
import { auth } from "services/firebase/config";
import firebase from "firebase/compat/app";
import Logo from "assets/dpos-logo-black.png";
import { SlLogout } from "react-icons/sl";
import { logout, createCheckoutSession } from "services/firebase/functions";
import { useAlert } from "react-alert";
import { FiPhone, FiMail } from "react-icons/fi";

interface PaymentUpdateNotificationProps {
  isCanceled: boolean;
}

const PaymentUpdateNotification = ({
  isCanceled,
}: PaymentUpdateNotificationProps) => {
  const alertP = useAlert();

  const sendToCheckout = async () => {
    if (!auth.currentUser) return;
    await createCheckoutSession(
      "price_1T8TIlCIw3L7DOwIDUpngIcI",
      window.location.origin,
      window.location.origin,
      (msg) => alertP.error(msg || "An error occurred")
    );
  };

  const Manage = () => {
    firebase
      .functions()
      .httpsCallable("ext-firestore-stripe-payments-createPortalLink")({
        returnUrl: `${window.location.origin}`,
        locale: "auto",
      })
      .then((response) => {
        window.location = response.data.url;
      })
      .catch(() => {
        alertP.error("Unknown error has occured");
      });
  };

  if (isCanceled) {
    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <img src={Logo} alt="Divine POS" style={styles.logo} />
          <button style={styles.logoutBtn} onClick={logout}>
            <SlLogout size={18} color="#64748b" />
            <span style={styles.logoutText}>Log Out</span>
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.badge}>
            <span style={styles.badgeText}>Subscription Canceled</span>
          </div>

          <span style={styles.heading}>We hate to see you go</span>
          <span style={styles.subheading}>
            If there's a feature that's missing or something you'd like improved,
            let us know — we'd love to make it right.
          </span>

          <div style={styles.card}>
            <span style={styles.cardTitle}>Resubscribe to Divine POS</span>
            <span style={styles.cardDesc}>
              Get full access to your store again with plans starting at just
              $29/month.
            </span>
            <button style={styles.resubscribeBtn} onClick={sendToCheckout}>
              Resubscribe for $29/month
            </button>
          </div>

          <div style={styles.contactSection}>
            <span style={styles.contactTitle}>Need help? We're here for you.</span>
            <div style={styles.contactRow}>
              <div style={styles.contactItem}>
                <FiPhone size={16} color="#64748b" />
                <span style={styles.contactText}>(226) 600-5925</span>
              </div>
              <div style={styles.contactItem}>
                <FiMail size={16} color="#64748b" />
                <span style={styles.contactText}>Support@DivinePos.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <img src={Logo} alt="Divine POS" style={styles.logo} />
        </div>

        <div style={styles.content}>
          <div style={{ ...styles.badge, backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
            <span style={{ ...styles.badgeText, color: "#dc2626" }}>Payment Issue</span>
          </div>

          <span style={styles.heading}>There was an issue with your payment</span>
          <span style={styles.subheading}>
            This can happen if your billing details don't match the card on file.
            Please check with your bank or update your payment method below.
          </span>

          <div style={styles.card}>
            <span style={styles.cardTitle}>Update your billing details</span>
            <span style={styles.cardDesc}>
              We don't want your store to have any downtime — please update your
              payment details so we can keep things running smoothly.
            </span>
            <button style={styles.resubscribeBtn} onClick={Manage}>
              Update Billing
            </button>
          </div>

          <div style={styles.contactSection}>
            <span style={styles.contactTitle}>Need help? We're here for you.</span>
            <div style={styles.contactRow}>
              <div style={styles.contactItem}>
                <FiPhone size={16} color="#64748b" />
                <span style={styles.contactText}>(226) 600-5925</span>
              </div>
              <div style={styles.contactItem}>
                <FiMail size={16} color="#64748b" />
                <span style={styles.contactText}>Support@DivinePos.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PaymentUpdateNotification;

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#f8fafc",
    overflow: "auto",
  },
  topBar: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 0 20px",
    borderBottom: "1px solid #e2e8f0",
  },
  logo: {
    height: 44,
    objectFit: "contain",
  },
  logoutBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 640,
    padding: "48px 0 60px",
    gap: 20,
  },
  badge: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 20,
    padding: "6px 18px",
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b45309",
    letterSpacing: 0.3,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.6",
    maxWidth: 500,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.5",
    maxWidth: 440,
  },
  resubscribeBtn: {
    marginTop: 8,
    padding: "14px 36px",
    backgroundColor: "#1D294E",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
  },
  contactSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  contactRow: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
  },
  contactItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
};
