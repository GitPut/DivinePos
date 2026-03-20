import React, { useState } from "react";
import { signUp } from "services/firebase/functions";
import { useHistory } from "react-router-dom";
import { FiEyeOff, FiEye } from "react-icons/fi";
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
      <div style={{ ...styles.circle, width: 400, height: 400, top: -120, right: -100, opacity: 0.07 }} />
      <div style={{ ...styles.circle, width: 300, height: 300, bottom: -80, left: -80, opacity: 0.05 }} />
      <div style={{ ...styles.circle, width: 200, height: 200, top: "40%", left: "10%", opacity: 0.04 }} />
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <a href="https://divinepos.com" style={{ textDecoration: "none" }}>
            <img src={logoImg} style={styles.logo} alt="Divine POS" />
          </a>
        </div>

        <div style={styles.titleContainer}>
          <span style={styles.title}>Create your account</span>
          <span style={styles.subtitle}>Start your free trial today</span>
        </div>

        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <span style={styles.label}>Name</span>
            <input
              style={styles.input}
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setname(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Phone Number</span>
            <input
              style={styles.input}
              placeholder="Enter your phone number"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) =>
                setphoneNumber(e.target.value.replace(/\s/g, ""))
              }
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Email</span>
            <input
              style={styles.input}
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.fieldGroup}>
            <span style={styles.label}>Password</span>
            <div style={{ position: "relative" }}>
              <input
                style={styles.input}
                placeholder="Create a password"
                type={secureEntry ? "password" : "text"}
                autoComplete="new-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value.replace(/\s/g, ""))
                }
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => setsecureEntry(!secureEntry)}
                style={styles.eyeButton}
              >
                {secureEntry ? (
                  <FiEyeOff style={{ fontSize: 18, color: "#94a3b8" }} />
                ) : (
                  <FiEye style={{ fontSize: 18, color: "#94a3b8" }} />
                )}
              </button>
            </div>
          </div>

          <button style={styles.primaryButton} onClick={attemptSignUp}>
            <span style={styles.primaryButtonText}>Create Account</span>
          </button>
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>
            Already have an account?{" "}
            <button
              onClick={() => history.push("/log-in")}
              style={styles.linkButton}
            >
              <span style={styles.link}>Log in</span>
            </button>
          </span>
        </div>

        <div style={styles.terms}>
          <span style={styles.termsText}>
            By signing up you agree to our{" "}
            <a
              href="https://divinepos.com/terms-conditions/"
              style={{ color: "#1D294E", fontWeight: "500", textDecoration: "none" }}
            >
              Terms of Service
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    padding: 20,
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
  },
  circle: {
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "#94a3b8",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    padding: 40,
    maxWidth: 420,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 28,
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 52,
    width: 160,
    objectFit: "contain",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  input: {
    height: 48,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 16px",
    fontSize: 15,
    color: "#0f172a",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#fff",
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#1D294E",
    borderRadius: 10,
    height: 48,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  linkButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  link: {
    color: "#1D294E",
    fontWeight: "500",
    fontSize: 14,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
    borderTop: "1px solid #f1f5f9",
    width: "100%",
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
    paddingTop: 16,
  },
  terms: {
    display: "flex",
    justifyContent: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
};

export default Signup;
