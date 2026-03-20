import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import { useAlert } from "react-alert";
import logoImg from "assets/dpos-logo-black.png";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const history = useHistory();
  const alertP = useAlert();

  const submit = () => {
    if (email === "") {
      alertP.error("Please enter an email address");
      return;
    }
    const data = JSON.stringify({
      email: email,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://us-central1-posmate-5fc0a.cloudfunctions.net/sendPasswordResetEmail",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    Axios(config)
      .then(function () {
        alertP.success("We've sent a link to reset your password.");
      })
      .catch(function () {
        alertP.error("There was an error resetting your password.");
      });
    setEmail("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <a href="https://divinepos.com" style={{ textDecoration: "none" }}>
            <img src={logoImg} style={styles.logo} alt="Divine POS" />
          </a>
        </div>

        <div style={styles.titleContainer}>
          <span style={styles.title}>Reset password</span>
          <span style={styles.subtitle}>
            Enter your email to receive a reset link
          </span>
        </div>

        <div style={styles.form}>
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

          <button style={styles.primaryButton} onClick={submit}>
            <span style={styles.primaryButtonText}>Send Reset Link</span>
          </button>
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>
            <button
              onClick={() => history.push("/log-in")}
              style={styles.linkButton}
            >
              <span style={styles.link}>Back to login</span>
            </button>
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
    textAlign: "center",
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
  primaryButton: {
    backgroundColor: "#1470ef",
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
    color: "#1470ef",
    fontWeight: "500",
    fontSize: 14,
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 4,
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
  },
};

export default ResetPassword;
