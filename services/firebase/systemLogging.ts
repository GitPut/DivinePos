import firebase from "firebase/compat/app";
import { auth, db } from "./config";

type SystemLogType = "login" | "logout" | "subscription_change";

export const logSystemEvent = async (
  type: SystemLogType,
  metadata?: Record<string, any>
): Promise<void> => {
  const user = auth.currentUser;

  try {
    await db.collection("systemLogs").add({
      type,
      uid: user?.uid || "unknown",
      email: user?.email || "unknown",
      displayName: user?.displayName || null,
      metadata: metadata || {},
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  } catch {
    // Silently fail
  }
};
