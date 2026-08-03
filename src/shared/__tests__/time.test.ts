import { describe, expect, it } from "vitest";
import {
  dayDifference,
  formatTime,
  hasDst,
  isNextDay,
  utcOffsetMinutesFor,
  zoneAbbreviation,
} from "../time";

// Fixed instants that exercise DST boundaries and offset edges.
// 2026-01-15 12:00 UTC (winter), 2026-07-15 12:00 UTC (summer).
const JAN_2026 = Date.UTC(2026, 0, 15, 12, 0, 0);
const JUL_2026 = Date.UTC(2026, 6, 15, 12, 0, 0);

describe("formatTime", () => {
  it("formats 24-hour time", () => {
    // UTC 12:00 → in UTC still 12:00
    expect(formatTime(JAN_2026, "UTC", 24, "en")).toBe("12:00");
  });

  it("formats 12-hour time with PM", () => {
    // UTC 12:00 is 12:00 PM in UTC
    expect(formatTime(JAN_2026, "UTC", 12, "en")).toMatch(/12:00/);
  });

  it("applies a non-UTC zone offset", () => {
    // UTC 12:00 on Jan 15 → Asia/Kolkata is UTC+5:30 → 17:30
    expect(formatTime(JAN_2026, "Asia/Kolkata", 24, "en")).toBe("17:30");
  });

  it("handles half-hour offsets", () => {
    // Asia/Kathmandu is UTC+5:45
    expect(formatTime(JAN_2026, "Asia/Kathmandu", 24, "en")).toBe("17:45");
  });
});

describe("utcOffsetMinutesFor", () => {
  it("returns the winter offset for Toronto", () => {
    expect(utcOffsetMinutesFor("America/Toronto", JAN_2026)).toBe(-300); // EST
  });

  it("returns the summer (DST) offset for Toronto", () => {
    expect(utcOffsetMinutesFor("America/Toronto", JUL_2026)).toBe(-240); // EDT
  });

  it("returns a half-hour offset for India", () => {
    expect(utcOffsetMinutesFor("Asia/Kolkata", JAN_2026)).toBe(330);
  });

  it("returns a quarter-hour offset for Kathmandu", () => {
    expect(utcOffsetMinutesFor("Asia/Kathmandu", JAN_2026)).toBe(345);
  });
});

describe("hasDst", () => {
  it("detects DST for Toronto", () => {
    expect(hasDst("America/Toronto")).toBe(true);
  });

  it("reports no DST for India", () => {
    expect(hasDst("Asia/Kolkata")).toBe(false);
  });

  it("reports no DST for UTC", () => {
    expect(hasDst("UTC")).toBe(false);
  });
});

describe("dayDifference", () => {
  it("returns null for the same day", () => {
    expect(
      dayDifference(JAN_2026, "America/Toronto", "America/Toronto"),
    ).toBeNull();
  });

  it("flags a forward day-change", () => {
    // 2026-01-15 12:00 UTC is 15:00 in Kolkata and ~10:00 EST on the same date.
    // Use a late-UTC instant so Kolkata rolls into the next day.
    const late = Date.UTC(2026, 0, 15, 23, 0, 0); // Kolkata = Jan 16 04:30
    expect(dayDifference(late, "Asia/Kolkata", "UTC")).toBe(1);
  });

  it("flags a backward day-change", () => {
    // UTC 2026-01-15 02:00 → Toronto is still Jan 14 21:00
    const early = Date.UTC(2026, 0, 15, 2, 0, 0);
    expect(dayDifference(early, "America/Toronto", "UTC")).toBe(-1);
  });

  it("isNextDay follows dayDifference", () => {
    const late = Date.UTC(2026, 0, 15, 23, 0, 0);
    expect(isNextDay(late, "Asia/Kolkata", "UTC")).toBe(true);
    expect(isNextDay(late, "UTC", "UTC")).toBe(false);
  });
});

describe("zoneAbbreviation", () => {
  it("returns EDT for Toronto in summer", () => {
    expect(zoneAbbreviation(JUL_2026, "America/Toronto")).toBe("EDT");
  });

  it("returns IST or an offset fallback for Kolkata", () => {
    // CLDR data may or may not expose the ambiguous "IST" abbreviation.
    const abbr = zoneAbbreviation(JAN_2026, "Asia/Kolkata");
    expect(["IST", "UTC+05:30"]).toContain(abbr);
  });
});
