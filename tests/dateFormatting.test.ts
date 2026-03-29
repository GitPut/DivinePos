import { describe, it, expect } from "vitest";
import { parseDate } from "utils/dateFormatting";

describe("parseDate", () => {
  // ─── Date object input ───

  it("returns the same Date when given a Date object", () => {
    const d = new Date("2024-06-15T12:00:00Z");
    expect(parseDate(d)).toEqual(d);
  });

  // ─── String input ───

  it("parses a valid date string", () => {
    const result = parseDate("2024-06-15T12:00:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe("2024-06-15T12:00:00.000Z");
  });

  it("returns null for an invalid date string", () => {
    expect(parseDate("not-a-date")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseDate("")).toBeNull();
  });

  // ─── Firestore Timestamp-like input ───

  it("parses an object with numeric seconds", () => {
    const timestamp = { seconds: 1718452800 }; // 2024-06-15T12:00:00Z
    const result = parseDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(1718452800 * 1000);
  });

  it("parses an object with string seconds", () => {
    const timestamp = { seconds: "1718452800" };
    const result = parseDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(1718452800 * 1000);
  });

  it("handles zero seconds", () => {
    const result = parseDate({ seconds: 0 });
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(0);
  });

  it("handles missing seconds gracefully", () => {
    const result = parseDate({ seconds: "" });
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(0);
  });
});
