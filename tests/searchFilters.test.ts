import { describe, it, expect } from "vitest";
import {
  searchCustomersByDate,
  searchTransactionsByDate,
} from "utils/searchFilters";

describe("searchCustomersByDate", () => {
  // Use local-timezone-aware timestamps (noon local time on each date)
  const june15Noon = new Date("2024-06-15T12:00:00").getTime() / 1000;
  const june16Noon = new Date("2024-06-16T12:00:00").getTime() / 1000;
  const june17Noon = new Date("2024-06-17T12:00:00").getTime() / 1000;

  const customers = [
    {
      name: "Alice",
      phone: "555-0001",
      orders: [],
      id: "1",
      createdAt: { seconds: june15Noon },
    },
    {
      name: "Bob",
      phone: "555-0002",
      orders: [],
      id: "2",
      createdAt: { seconds: june16Noon },
    },
    {
      name: "Charlie",
      phone: "555-0003",
      orders: [],
      id: "3",
      createdAt: { seconds: june17Noon },
    },
  ];

  it("filters customers within date range", () => {
    const result = searchCustomersByDate({
      startDate: "2024-06-15T00:00:00",
      endDate: "2024-06-16T00:00:00",
      customers,
    });
    expect(result).toHaveLength(2);
    expect(result![0].name).toBe("Alice");
    expect(result![1].name).toBe("Bob");
  });

  it("returns undefined when startDate is empty", () => {
    expect(
      searchCustomersByDate({ startDate: "", endDate: "2024-06-16", customers })
    ).toBeUndefined();
  });

  it("returns undefined when endDate is empty", () => {
    expect(
      searchCustomersByDate({ startDate: "2024-06-15", endDate: "", customers })
    ).toBeUndefined();
  });

  it("excludes customers without createdAt", () => {
    const customersWithMissing = [
      ...customers,
      { name: "NoDate", phone: "555-0004", orders: [], id: "4" } as any,
    ];
    const result = searchCustomersByDate({
      startDate: "2024-06-15T00:00:00",
      endDate: "2024-06-17T00:00:00",
      customers: customersWithMissing,
    });
    expect(result).toHaveLength(3);
  });

  it("returns empty array when no customers match", () => {
    const result = searchCustomersByDate({
      startDate: "2025-01-01",
      endDate: "2025-01-02",
      customers,
    });
    expect(result).toHaveLength(0);
  });
});

describe("searchTransactionsByDate", () => {
  const txJune15Noon = new Date("2024-06-15T12:00:00").getTime() / 1000;
  const txJune16Noon = new Date("2024-06-16T12:00:00").getTime() / 1000;

  const transactions = [
    {
      id: "t1",
      date: "2024-06-15T12:00:00",
      method: "inStore",
      cart: [],
      customer: {},
      total: "50.00",
      transNum: "001",
    },
    {
      id: "t2",
      date: { seconds: txJune16Noon },
      method: "delivery",
      cart: [],
      customer: {},
      total: "30.00",
      transNum: "002",
    },
  ] as any;

  it("filters transactions within date range", () => {
    const result = searchTransactionsByDate({
      startDate: "2024-06-15T00:00:00",
      endDate: "2024-06-15T00:00:00",
      transactions,
    });
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe("t1");
  });

  it("returns undefined when dates are empty", () => {
    expect(
      searchTransactionsByDate({
        startDate: "",
        endDate: "",
        transactions,
      })
    ).toBeUndefined();
  });
});
