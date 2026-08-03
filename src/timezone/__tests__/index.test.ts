import { describe, expect, it } from "vitest";
import {
  findTimezone,
  searchTimezones,
  systemTimezoneId,
  toTimezoneEntry,
} from "../index";

describe("searchTimezones", () => {
  it("returns all zones for an empty query", () => {
    expect(searchTimezones("", 200).length).toBeGreaterThan(50);
  });

  it("finds by city name", () => {
    const r = searchTimezones("toronto");
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].city).toBe("Toronto");
  });

  it("finds by alias (New York)", () => {
    const r = searchTimezones("new york");
    expect(r[0].id).toBe("America/New_York");
  });

  it("finds by country name", () => {
    const r = searchTimezones("nepal");
    expect(r.some((x) => x.country === "Nepal")).toBe(true);
  });

  it("resolves a duplicate city via alias (Delhi → Asia/Kolkata)", () => {
    const r = searchTimezones("delhi");
    expect(r[0].id).toBe("Asia/Kolkata");
  });

  it("finds by IANA id prefix", () => {
    const r = searchTimezones("America/Vancouver");
    expect(r[0].id).toBe("America/Vancouver");
  });
});

describe("findTimezone", () => {
  it("looks up a canonical id", () => {
    expect(findTimezone("Asia/Tokyo")?.country).toBe("Japan");
  });

  it("returns undefined for unknown", () => {
    expect(findTimezone("Not/A_Zone")).toBeUndefined();
  });
});

describe("toTimezoneEntry", () => {
  it("produces an entry with local time preview", () => {
    const now = Date.UTC(2026, 0, 15, 12, 0, 0);
    const entry = toTimezoneEntry(
      { id: "Asia/Kolkata", city: "Mumbai", country: "India", aliases: [] },
      now,
      "en",
      24,
    );
    expect(entry.id).toBe("Asia/Kolkata");
    expect(entry.utcOffsetMinutes).toBe(330);
    expect(entry.hasDst).toBe(false);
    expect(entry.localTimeLabel).toContain("17:30");
  });

  it("flags DST-aware zones", () => {
    const now = Date.UTC(2026, 0, 15, 12, 0, 0);
    const entry = toTimezoneEntry(
      {
        id: "America/Toronto",
        city: "Toronto",
        country: "Canada",
        aliases: [],
      },
      now,
      "en",
    );
    expect(entry.hasDst).toBe(true);
  });
});

describe("systemTimezoneId", () => {
  it("returns a non-empty IANA id", () => {
    const id = systemTimezoneId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(1);
  });
});
