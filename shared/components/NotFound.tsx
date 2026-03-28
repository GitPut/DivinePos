import React from "react";
import { useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  const history = useHistory();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.code}>404</span>
        <span style={styles.title}>Page not found</span>
        <span style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </span>
        <button style={styles.btn} onClick={() => history.push("/")}>
          <FiArrowLeft size={16} color="#fff" />
          <span style={styles.btnText}>Go back</span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 48,
  },
  code: {
    fontSize: 64,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: 320,
  },
  btn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: "10px 24px",
    backgroundColor: "#1D294E",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
};

export default NotFound;
