import React from "react";
import { logErrorFromBoundary } from "services/firebase/errorLogging";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logErrorFromBoundary(error, info.componentStack || null);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              gap: 16,
            }}
          >
            <span
              style={{ fontSize: 18, fontWeight: "700", color: "#121212" }}
            >
              Something went wrong.
            </span>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px",
                backgroundColor: "#1c294e",
                color: "#fff",
                fontWeight: "600",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
