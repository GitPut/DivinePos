import React, { useState } from "react";
import { signIn } from "services/firebase/functions";
import { useHistory } from "react-router-dom";
import { FiEyeOff, FiEye, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useAlert } from "react-alert";
import logoImg from "assets/dpos-logo-black.png";

function Login() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const history = useHistory();
  const [secureEntry, setsecureEntry] = useState<boolean>(true);
  const alertP = useAlert();

  const attemptSignIn = () => {
    if (email && password) {
      signIn(email, password).catch(() => {
        alertP.error("Invalid email or password");
      });
    } else {
      alertP.error("Please enter your email and password");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      attemptSignIn();
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

      {/* Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.title}>Welcome back</span>
          <span style={styles.subtitle}>Sign in to your Divine POS account</span>
        </div>
        <div style={styles.divider} />

        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <span style={styles.label}>Email Address</span>
            <div style={styles.inputRow}>
              <FiMail size={18} color="#94a3b8" />
              <input
                style={styles.input}
                placeholder="john@pizzashop.com"
                autoComplete="email"
                value={email || ""}
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
                placeholder="Enter your password"
                type={secureEntry ? "password" : "text"}
                autoComplete="current-password"
                value={password || ""}
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

          <button onClick={() => history.push("/reset-password")} style={styles.forgotBtn}>
            <span style={styles.forgotText}>Forgot password?</span>
          </button>
        </div>

        <div style={styles.cardFooter}>
          <button style={styles.continueBtn} onClick={attemptSignIn}>
            <span style={styles.continueTxt}>Sign In</span>
            <FiArrowRight size={16} color="#fff" />
          </button>
        </div>
      </div>

      {/* Bottom link */}
      <div style={styles.bottomRow}>
        <span style={styles.bottomText}>Don't have an account?</span>
        <button onClick={() => history.push("/sign-up")} style={styles.linkBtn}>
          <span style={styles.link}>Sign up</span>
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
  forgotBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1D294E",
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

export default Login;
