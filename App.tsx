import React from "react";
import AppRouter from "router/Router";
import { positions, Provider as AlertProvider } from "react-alert";

const options = {
  timeout: 5000,
  position: positions.TOP_CENTER,
  containerStyle: {
    zIndex: 100000,
  },
};

const alertColors: Record<string, string> = {
  success: "#151515",
  error: "#ff0000",
  info: "#151515",
};

const BaseIcon = ({ color, pushRight = true, children }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: pushRight ? 20 : 0, minWidth: 24 }}
  >
    {children}
  </svg>
);

const SuccessIcon = () => (
  <BaseIcon color="#31B404">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </BaseIcon>
);

const ErrorIcon = () => (
  <BaseIcon color="#FF0040">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </BaseIcon>
);

const InfoIcon = () => (
  <BaseIcon color="#2E9AFE">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="8" />
  </BaseIcon>
);

const CloseIcon = () => (
  <BaseIcon color="#FFFFFF" pushRight={false}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

const CustomAlertTemplate = ({ style, options, message, close }: any) => (
  <div
    style={{
      ...style,
      backgroundColor: alertColors[options.type] || "#151515",
      color: "white",
      padding: "16px 24px",
      borderRadius: 12,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      fontFamily: "Arial, sans-serif",
      maxWidth: 450,
      minWidth: 300,
      boxSizing: "border-box",
      marginTop: 20,
    }}
  >
    {options.type === "info" && <InfoIcon />}
    {options.type === "success" && <SuccessIcon />}
    {options.type === "error" && <ErrorIcon />}
    <span style={{ flex: 2, fontSize: 15, lineHeight: 1.4 }}>{message}</span>
    <button
      onClick={close}
      style={{
        marginLeft: 16,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <CloseIcon />
    </button>
  </div>
);

const App = () => (
  <AlertProvider template={CustomAlertTemplate} {...options}>
    <AppRouter />
  </AlertProvider>
);

export default App;
