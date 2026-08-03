import { describe, expect, it } from "vitest";
import {
  dayDifference,
  formatDate,
  formatTime,
  utcOffsetMinutesFor,
} from "../time";
import { findTimezone, searchTimezones, toTimezoneEntry } from "@/timezone";

describe("§9.6 timezone correctness", () => {
  it("handles a DST spring-forward (US: 2nd Sunday in March)", () => {
    // US DST 2026 begins Sunday March 8, 02:00 EST → 03:00 EDT.
    const before = Date.UTC(2026, 2, 8, 6, 30, 0); // 01:30 EST
    const after = Date.UTC(2026, 2, 8, 8, 0, 0); // 03:00 EDT (spring forward)
    expect(utcOffsetMinutesFor("America/New_York", before)).toBe(-300); // EST
    expect(utcOffsetMinutesFor("America/New_York", after)).toBe(-240); // EDT
  });

  it("handles a DST fall-back (US: 1st Sunday in November)", () => {
    // US DST 2026 ends Sunday November 1, 02:00 EDT → 01:00 EST.
    const before = Date.UTC(2026, 10, 1, 5, 30, 0); // 01:30 EDT
    const after = Date.UTC(2026, 10, 1, 7, 0, 0); // 02:00 EST (fell back)
    expect(utcOffsetMinutesFor("America/New_York", before)).toBe(-240);
    expect(utcOffsetMinutesFor("America/New_York", after)).toBe(-300);
  });

  it("renders the correct local time across a DST transition", () => {
    // 06:30 UTC on spring-forward day (2:00 EST = 07:00 UTC) → 01:30 EST
    const instant = Date.UTC(2026, 2, 8, 6, 30, 0);
    expect(formatTime(instant, "America/New_York", 24, "en")).toBe("01:30");
    // 08:00 UTC → already past the transition → 04:00 EDT (UTC-4)
    const after = Date.UTC(2026, 2, 8, 8, 0, 0);
    expect(formatTime(after, "America/New_York", 24, "en")).toBe("04:00");
  });

  it("renders a half-hour zone correctly", () => {
    const instant = Date.UTC(2026, 0, 15, 12, 0, 0);
    expect(formatTime(instant, "Asia/Kolkata", 24, "en")).toBe("17:30");
    expect(utcOffsetMinutesFor("Asia/Kolkata", instant)).toBe(330);
  });

  it("renders a quarter-hour zone correctly (Kathmandu +5:45)", () => {
    const instant = Date.UTC(2026, 0, 15, 12, 0, 0);
    expect(formatTime(instant, "Asia/Kathmandu", 24, "en")).toBe("17:45");
    expect(utcOffsetMinutesFor("Asia/Kathmandu", instant)).toBe(345);
  });

  it("renders the Chatham zone in winter (+12:45) and summer (+13:45)", () => {
    // Southern-hemisphere DST: January is summer (+13:45 = 825), July winter (+12:45 = 765).
    const jan = Date.UTC(2026, 0, 15, 0, 0, 0);
    const jul = Date.UTC(2026, 6, 15, 0, 0, 0);
    expect(utcOffsetMinutesFor("Pacific/Chatham", jan)).toBe(825);
    expect(utcOffsetMinutesFor("Pacific/Chatham", jul)).toBe(765);
  });

  it("flips the calendar day across midnight in a zone", () => {
    // 23:30 UTC → in Kolkata it is already the next day.
    const instant = Date.UTC(2026, 0, 15, 23, 30, 0);
    const kolkataDate = formatDate(instant, "Asia/Kolkata", "en");
    const utcDate = formatDate(instant, "UTC", "en");
    expect(kolkataDate).not.toBe(utcDate);
    expect(dayDifference(instant, "Asia/Kolkata", "UTC")).toBe(1);
  });

  it("handles leap years (2024-02-29 exists)", () => {
    // 2024 is a leap year.
    const instant = Date.UTC(2024, 1, 29, 12, 0, 0);
    expect(formatDate(instant, "UTC", "en")).toContain("29");
    // 2026-02-29 must NOT exist — Luxon should not fabricate it.
    const notLeap = Date.UTC(2026, 1, 29, 12, 0, 0);
    const dt = new Date(notLeap);
    expect(dt.getDate()).toBe(1); // rolls to March 1
  });

  it("handles timezones without DST (India, UTC, Arizona)", () => {
    const jan = Date.UTC(2026, 0, 15, 12, 0, 0);
    const jul = Date.UTC(2026, 6, 15, 12, 0, 0);
    expect(utcOffsetMinutesFor("Asia/Kolkata", jan)).toBe(330);
    expect(utcOffsetMinutesFor("Asia/Kolkata", jul)).toBe(330);
    expect(utcOffsetMinutesFor("America/Phoenix", jan)).toBe(-420);
    expect(utcOffsetMinutesFor("America/Phoenix", jul)).toBe(-420);
  });

  it("returns a preview entry with all picker fields", () => {
    const instant = Date.UTC(2026, 0, 15, 12, 0, 0);
    const entry = toTimezoneEntry(
      { id: "Asia/Tokyo", city: "Tokyo", country: "Japan", aliases: ["JST"] },
      instant,
      "en",
      24,
    );
    expect(entry.localTimeLabel).toContain("21:00"); // UTC 12:00 → JST 21:00
    expect(entry.utcOffsetMinutes).toBe(540);
  });

  it("search resolves duplicate city names via aliases", () => {
    // "Delhi" and "Mumbai" both resolve to Asia/Kolkata.
    expect(searchTimezones("delhi")[0].id).toBe("Asia/Kolkata");
    expect(searchTimezones("mumbai")[0].id).toBe("Asia/Kolkata");
  });

  it("findTimezone works for indexed zones", () => {
    expect(findTimezone("Europe/London")?.country).toBe("United Kingdom");
    expect(findTimezone("Not/A_Zone")).toBeUndefined();
  });
});
