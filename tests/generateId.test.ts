import { describe, it, expect } from "vitest";
import generateId from "utils/generateId";

describe("generateId", () => {
  it("generates a string of the requested length", () => {
    expect(generateId(10)).toHaveLength(10);
    expect(generateId(20)).toHaveLength(20);
    expect(generateId(1)).toHaveLength(1);
  });

  it("generates only alphanumeric characters", () => {
    const id = generateId(100);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId(16)));
    expect(ids.size).toBe(100);
  });

  it("handles zero length", () => {
    expect(generateId(0)).toBe("");
  });
});
