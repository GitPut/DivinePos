import React, { useState } from "react";
import { signUp } from "services/firebase/functions";
import { useHistory } from "react-router-dom";
import { FiEyeOff, FiEye, FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from "react-icons/fi";
import { useAlert } from "react-alert";
import logoImg from "assets/dpos-logo-black.png";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setname] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const history = useHistory();
  const [secureEntry, setsecureEntry] = useState(true);
  const alertP = useAlert();

  const attemptSignUp = () => {
    if (email && password) {
      signUp(email, password, name, phoneNumber).catch(() => {
        alertP.error("There was a issue signing up. Please try again.");
      });
    } else {
      alertP.error("Please enter your email and password");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      attemptSignUp();
    }
  };

  return (
    <div style={styles.page}>
      {/* Decorative circles */}
      <div style={{ ...styles.circle, width: 500, height: 500, top: -150, right: -150, opacity: 0.12 }} />
      <div style={{ ...styles.circle, width: 350, height: 350, bottom: -100, left: -100, opacity: 0.09 }} />
      <div style={{ ...styles.circle, width: 250, height: 250, top: "30%", right: "5%", opacity: 0.09 }} />
      <div style={{ ...styles.circle, width: 180, height: 180, bottom: "20%", left: "8%", opacity: 0.07 }} />

      {/* Logo */}
      <a href="https://divinepos.com" style={{ textDecoration: "none", marginBottom: 24, zIndex: 1 }}>
        <img src={logoImg} style={styles.logo} alt="Divine POS" />
      </a>

      {/* Step indicator */}
      <span style={styles.stepLabel}>STEP 1 OF 3 — ACCOUNT</span>

      {/* Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.title}>Create your account</span>
          <span style={styles.subtitle}>Set up your Divine POS account to get started</span>
        </div>
        <div style={styles.divider} />

        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <span style={styles.label}>Full Name</span>
            <div style={styles.inputRow}>
              <FiUser size={18} color="#94a3b8" />
              <input
                style={styles.input}
                placeholder="John Smith"
                value={name}
                onChange={(e) => setname(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Phone Number</span>
            <div style={styles.inputRow}>
              <FiPhone size={18} color="#94a3b8" />
              <input
                style={styles.input}
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setphoneNumber(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Email Address</span>
            <div style={styles.inputRow}>
              <FiMail size={18} color="#94a3b8" />
              <input
                style={styles.input}
                placeholder="john@pizzashop.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Password</span>
            <div style={styles.inputRow}>
              <FiLock size={18} color="#94a3b8" />
              <input
                style={styles.input}
                placeholder="At least 6 characters"
                type={secureEntry ? "password" : "text"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => setsecureEntry(!secureEntry)}
                style={styles.eyeButton}
              >
                {secureEntry ? (
                  <FiEyeOff size={18} color="#94a3b8" />
                ) : (
                  <FiEye size={18} color="#94a3b8" />
                )}
              </button>
            </div>
          </div>

          <span style={styles.terms}>
            By creating an account you agree to the{" "}
            <a href="https://divinepos.com/terms" style={styles.termsLink}>Terms of Service</a>
            {" "}and{" "}
            <a href="https://divinepos.com/privacy" style={styles.termsLink}>Privacy Policy</a>
          </span>
        </div>

        <div style={styles.cardFooter}>
          <button style={styles.continueBtn} onClick={attemptSignUp}>
            <span style={styles.continueTxt}>Continue</span>
            <FiArrowRight size={16} color="#fff" />
          </button>
        </div>
      </div>

      {/* Bottom link */}
      <div style={styles.bottomRow}>
        <span style={styles.bottomText}>Already have an account?</span>
        <button onClick={() => history.push("/log-in")} style={styles.linkBtn}>
          <span style={styles.link}>Log in</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f6f8",
    padding: 20,
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
  },
  circle: {
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "#c0c9d4",
  },
  logo: {
    height: 48,
    width: 160,
    objectFit: "contain",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 1.5,
    marginBottom: 20,
    zIndex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
    width: "100%",
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
    overflow: "hidden",
  },
  cardHeader: {
    padding: "32px 36px 0",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    margin: "20px 36px",
  },
  form: {
    padding: "0 36px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  inputRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 52,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 16px",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 50,
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "transparent",
  },
  eyeButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  terms: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: "1.5",
  },
  termsLink: {
    color: "#1D294E",
    fontWeight: "600",
    textDecoration: "none",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "24px 36px 32px",
  },
  continueBtn: {
    height: 46,
    paddingLeft: 28,
    paddingRight: 24,
    backgroundColor: "#1D294E",
    borderRadius: 12,
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  continueTxt: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    zIndex: 1,
  },
  bottomText: {
    fontSize: 14,
    color: "#64748b",
  },
  linkBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  link: {
    color: "#1D294E",
    fontWeight: "600",
    fontSize: 14,
  },
};

export default Signup;
