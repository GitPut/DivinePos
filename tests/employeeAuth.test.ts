import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock simpler-state and firebase before importing
vi.mock("store/appState", () => ({
  employeesState: {
    get: vi.fn(() => []),
  },
}));
vi.mock("services/firebase/config", () => ({
  auth: { currentUser: { uid: "test-uid" } },
  db: {
    collection: () => ({
      doc: () => ({
        collection: () => ({
          add: vi.fn(() => Promise.resolve()),
        }),
      }),
    }),
  },
}));
vi.mock("firebase/compat/app", () => ({
  default: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => "SERVER_TIMESTAMP",
      },
    },
  },
}));

import { verifyEmployeePin } from "utils/employeeAuth";
import { employeesState } from "store/appState";

describe("verifyEmployeePin", () => {
  beforeEach(() => {
    vi.mocked(employeesState.get).mockReturnValue([
      {
        name: "John",
        pin: "1234",
        id: "emp1",
        permissions: {
          accessBackend: true,
          discount: true,
          customPayment: false,
          manageOrders: true,
        },
      },
      {
        name: "Jane",
        pin: "5678",
        id: "emp2",
        permissions: {
          accessBackend: false,
          discount: false,
          customPayment: false,
          manageOrders: false,
        },
      },
      {
        name: "NoPerms",
        pin: "0000",
        id: "emp3",
      },
    ] as any);
  });

  it("returns employee when PIN and permission match", () => {
    const result = verifyEmployeePin("1234", "accessBackend");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("John");
  });

  it("returns null for wrong PIN", () => {
    expect(verifyEmployeePin("9999", "accessBackend")).toBeNull();
  });

  it("returns null when employee lacks the permission", () => {
    expect(verifyEmployeePin("1234", "customPayment")).toBeNull();
  });

  it("returns null when employee has no permissions object", () => {
    expect(verifyEmployeePin("0000", "accessBackend")).toBeNull();
  });

  it("returns null for empty PIN", () => {
    expect(verifyEmployeePin("", "accessBackend")).toBeNull();
  });

  it("checks specific permissions correctly", () => {
    expect(verifyEmployeePin("1234", "discount")).not.toBeNull();
    expect(verifyEmployeePin("5678", "discount")).toBeNull();
    expect(verifyEmployeePin("1234", "manageOrders")).not.toBeNull();
    expect(verifyEmployeePin("5678", "manageOrders")).toBeNull();
  });
});
