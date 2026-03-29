import firebase from "firebase/compat/app";
import { auth, db } from "./config";

// Rate limiter: max 10 errors per 60 seconds per session
const ERROR_LOG_LIMIT = 10;
const ERROR_LOG_WINDOW_MS = 60_000;
let errorTimestamps: number[] = [];

// Deduplication: don't log the same error message twice within 5 minutes
const DEDUP_WINDOW_MS = 5 * 60_000;
const recentErrors = new Map<string, number>();

const canLogError = (message: string): boolean => {
  const now = Date.now();

  // Rate limit check
  errorTimestamps = errorTimestamps.filter(
    (ts) => now - ts < ERROR_LOG_WINDOW_MS
  );
  if (errorTimestamps.length >= ERROR_LOG_LIMIT) return false;

  // Dedup check — same error message within 5 minutes
  const dedupKey = message.slice(0, 200);
  const lastSeen = recentErrors.get(dedupKey);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return false;

  errorTimestamps.push(now);
  recentErrors.set(dedupKey, now);

  // Clean up old dedup entries
  if (recentErrors.size > 50) {
    for (const [key, ts] of recentErrors) {
      if (now - ts > DEDUP_WINDOW_MS) recentErrors.delete(key);
    }
  }

  return true;
};

// Severity levels for error classification
type ErrorSeverity = "critical" | "high" | "medium" | "low";

const classifyError = (
  message: string,
  source: string
): ErrorSeverity => {
  const msg = message.toLowerCase();

  // Critical: payment, auth, data loss
  if (
    msg.includes("stripe") ||
    msg.includes("payment") ||
    msg.includes("charge") ||
    msg.includes("firebase") && msg.includes("permission") ||
    msg.includes("data loss") ||
    msg.includes("corruption")
  )
    return "critical";

  // High: render crashes, unhandled rejections
  if (source === "ErrorBoundary" || source === "unhandledrejection")
    return "high";

  // Medium: explicit window errors
  if (source === "window.onerror") return "medium";

  return "low";
};

interface ErrorLogParams {
  message: string;
  stack: string | null;
  source:
    | "window.onerror"
    | "unhandledrejection"
    | "ErrorBoundary"
    | "manual";
  componentStack?: string | null;
  extra?: Record<string, any>;
}

// Core logging function — fire-and-forget
const logErrorToFirestore = (params: ErrorLogParams): void => {
  const message = (params.message || "Unknown error").slice(0, 2000);
  if (!canLogError(message)) return;

  const severity = classifyError(message, params.source);

  db.collection("systemErrors")
    .add({
      uid: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      message,
      stack: params.stack ? params.stack.slice(0, 2000) : null,
      source: params.source,
      severity,
      url: window.location.href,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      componentStack: params.componentStack
        ? params.componentStack.slice(0, 2000)
        : null,
      extra: params.extra || {},
      sessionId: getSessionId(),
      appVersion: __APP_VERSION__,
    })
    .catch(() => {
      // Silently fail — cannot log errors about logging errors
    });
};

// Session ID for grouping errors from the same browser session
let _sessionId: string | null = null;
const getSessionId = (): string => {
  if (!_sessionId) {
    _sessionId =
      sessionStorage.getItem("errorSessionId") ||
      Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("errorSessionId", _sessionId);
  }
  return _sessionId;
};

// App version — injected by Vite at build time, fallback to "dev"
declare const __APP_VERSION__: string;

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
      message:
        typeof message === "string" ? message : "Unknown error event",
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

// For manual error logging in catch blocks
export const logError = (
  message: string,
  error?: Error | unknown,
  extra?: Record<string, any>
): void => {
  logErrorToFirestore({
    message,
    stack: error instanceof Error ? error.stack || null : null,
    source: "manual",
    extra: {
      ...extra,
      originalError:
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : undefined,
    },
  });
};

export default logErrorToFirestore;
