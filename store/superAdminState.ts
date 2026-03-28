import { entity } from "simpler-state";

// ─── Types ───

export interface SystemLog {
  id: string;
  type: "signup" | "login" | "logout" | "subscription_change";
  uid: string;
  email: string;
  displayName: string | null;
  metadata: Record<string, any>;
  timestamp: { seconds: number; nanoseconds: number; toDate: () => Date } | null;
  userAgent: string;
  url: string;
}

export interface SystemError {
  id: string;
  uid: string | null;
  email: string | null;
  message: string;
  stack: string | null;
  source: "window.onerror" | "unhandledrejection" | "ErrorBoundary" | "manual";
  url: string;
  route: string;
  userAgent: string;
  timestamp: { seconds: number; nanoseconds: number; toDate: () => Date } | null;
  componentStack: string | null;
  extra: Record<string, any>;
}

export interface AccountSummary {
  uid: string;
  email: string;
  storeName: string;
  ownerName: string;
  phoneNumber: string;
  hasFreeTrial: boolean;
}

export interface SuperAdminOverviewStats {
  totalAccounts: number;
  errorsToday: number;
  loginsToday: number;
  signupsToday: number;
}

// ─── State Entities ───

export const superAdminLogsState = entity<SystemLog[]>([]);
export const setSuperAdminLogsState = (val: SystemLog[]) => {
  superAdminLogsState.set(val);
};

export const superAdminErrorsState = entity<SystemError[]>([]);
export const setSuperAdminErrorsState = (val: SystemError[]) => {
  superAdminErrorsState.set(val);
};

export const superAdminAccountsState = entity<AccountSummary[]>([]);
export const setSuperAdminAccountsState = (val: AccountSummary[]) => {
  superAdminAccountsState.set(val);
};

export const superAdminOverviewState = entity<SuperAdminOverviewStats>({
  totalAccounts: 0,
  errorsToday: 0,
  loginsToday: 0,
  signupsToday: 0,
});
export const setSuperAdminOverviewState = (val: SuperAdminOverviewStats) => {
  superAdminOverviewState.set(val);
};
