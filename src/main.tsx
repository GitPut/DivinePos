import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import App from "../App";
import { installGlobalErrorHandlers } from "services/firebase/errorLogging";
import ErrorBoundary from "shared/components/ui/ErrorBoundary";

// Install global error handlers before React renders
installGlobalErrorHandlers();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
