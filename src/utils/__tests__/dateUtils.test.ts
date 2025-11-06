import { describe, expect, it } from "vitest";
import { parseTime } from "../dateUtils";

describe("dateUtils", () => {
  describe("parseTime", () => {
    it("should parse valid date string to timestamp", () => {
      const isoString = "2024-01-01T00:00:00Z";
      const timestamp = parseTime(isoString);
      expect(timestamp).toBeGreaterThan(0);
    });

    it("should return 0 for invalid date string", () => {
      const timestamp = parseTime("invalid-date");
      expect(timestamp).toBe(0);
    });

    it("should return the number if input is a number", () => {
      const timestamp = parseTime(1000000);
      expect(timestamp).toBe(1000000);
    });
  });
});
