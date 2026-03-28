import firebase from "firebase/compat/app";
import { auth, db } from "./config";

// Rate limiter: max 10 errors per 60 seconds per session
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW_MS = 60_000;
let errorTimestamps: number[] = [];

const canLogError = (): boolean => {
  const now = Date.now();
  errorTimestamps = errorTimestamps.filter(
    (ts) => now - ts < ERROR_LOG_WINDOW_MS
  );
  if (errorTimestamps.length >= ERROR_LOG_LIMIT) return false;
  errorTimestamps.push(now);
  return true;
};

// Core logging function — fire-and-forget
const logErrorToFirestore = (params: {
  message: string;
  stack: string | null;
  source: "window.onerror" | "unhandledrejection" | "ErrorBoundary" | "manual";
  componentStack?: string | null;
  extra?: Record<string, any>;
}): void => {
  if (!canLogError()) return;

  db.collection("systemErrors")
    .add({
      uid: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      message: (params.message || "Unknown error").slice(0, 2000),
      stack: params.stack ? params.stack.slice(0, 2000) : null,
      source: params.source,
      url: window.location.href,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      componentStack: params.componentStack
        ? params.componentStack.slice(0, 2000)
        : null,
      extra: params.extra || {},
    })
    .catch(() => {
      // Silently fail — cannot log errors about logging errors
    });
};

// Attach global window error handlers
export const installGlobalErrorHandlers = (): void => {
  const originalOnError = window.onerror;
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => {
    logErrorToFirestore({
      message: typeof message === "string" ? message : "Unknown error event",
      stack: error?.stack || null,
      source: "window.onerror",
      extra: {
        sourceFile: source || null,
        lineno: lineno || null,
        colno: colno || null,
      },
    });
    if (typeof originalOnError === "function") {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener(
    "unhandledrejection",
    (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      logErrorToFirestore({
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === "string"
              ? reason
              : "Unhandled promise rejection",
        stack: reason instanceof Error ? reason.stack || null : null,
        source: "unhandledrejection",
      });
    }
  );
};

// For React ErrorBoundary usage
export const logErrorFromBoundary = (
  error: Error,
  componentStack: string | null
): void => {
  logErrorToFirestore({
    message: error.message,
    stack: error.stack || null,
    source: "ErrorBoundary",
    componentStack,
  });
};

export default logErrorToFirestore;
