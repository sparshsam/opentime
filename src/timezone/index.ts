/**
 * OpenTime timezone data & search.
 *
 * A compact, offline IANA timezone index with city/country metadata and
 * common aliases. Search works entirely on this bundled data — no network.
 *
 * Every entry's `id` is a valid IANA zone identifier. Multiple cities may
 * share one zone (e.g. Mumbai and Delhi both live in Asia/Kolkata); secondary
 * cities are recorded as aliases so search resolves them, while the canonical
 * persisted id remains a single valid IANA zone.
 */

import type { TimezoneEntry } from "@/shared/types";
import { DateTime } from "luxon";

export interface TimezoneMeta {
  id: string;
  city: string;
  country: string;
  /** Alternate city / country / common names used for searching. */
  aliases?: string[];
}

/** Curated IANA zone index. Every `id` is a real, valid IANA zone. */
export const TIMEZONE_INDEX: TimezoneMeta[] = [
  // ── Americas ──
  {
    id: "America/Toronto",
    city: "Toronto",
    country: "Canada",
    aliases: ["Ontario", "Eastern Time"],
  },
  {
    id: "America/Vancouver",
    city: "Vancouver",
    country: "Canada",
    aliases: ["British Columbia", "Pacific Time"],
  },
  {
    id: "America/Montreal",
    city: "Montreal",
    country: "Canada",
    aliases: ["Québec", "Quebec"],
  },
  {
    id: "America/Calgary",
    city: "Calgary",
    country: "Canada",
    aliases: ["Alberta", "Mountain Time"],
  },
  {
    id: "America/Halifax",
    city: "Halifax",
    country: "Canada",
    aliases: ["Atlantic Time"],
  },
  {
    id: "America/St_Johns",
    city: "St. John's",
    country: "Canada",
    aliases: ["Newfoundland", "-03:30"],
  },
  {
    id: "America/New_York",
    city: "New York",
    country: "United States",
    aliases: ["Manhattan", "Brooklyn", "Eastern Time"],
  },
  {
    id: "America/Los_Angeles",
    city: "Los Angeles",
    country: "United States",
    aliases: ["California", "San Francisco", "Pacific Time"],
  },
  {
    id: "America/Chicago",
    city: "Chicago",
    country: "United States",
    aliases: ["Illinois", "Central Time"],
  },
  {
    id: "America/Denver",
    city: "Denver",
    country: "United States",
    aliases: ["Colorado", "Mountain Time"],
  },
  {
    id: "America/Phoenix",
    city: "Phoenix",
    country: "United States",
    aliases: ["Arizona", "Mountain Time", "no DST"],
  },
  {
    id: "America/Anchorage",
    city: "Anchorage",
    country: "United States",
    aliases: ["Alaska"],
  },
  {
    id: "Pacific/Honolulu",
    city: "Honolulu",
    country: "United States",
    aliases: ["Hawaii", "HST"],
  },
  {
    id: "America/Mexico_City",
    city: "Mexico City",
    country: "Mexico",
    aliases: ["CDMX"],
  },
  {
    id: "America/Sao_Paulo",
    city: "São Paulo",
    country: "Brazil",
    aliases: ["Sao Paulo", "Brasilia"],
  },
  {
    id: "America/Rio_Branco",
    city: "Rio Branco",
    country: "Brazil",
    aliases: ["Acre"],
  },
  {
    id: "America/Bogota",
    city: "Bogotá",
    country: "Colombia",
    aliases: ["Bogota"],
  },
  { id: "America/Lima", city: "Lima", country: "Peru" },
  { id: "America/Santiago", city: "Santiago", country: "Chile" },
  {
    id: "America/Buenos_Aires",
    city: "Buenos Aires",
    country: "Argentina",
    aliases: ["Argentina"],
  },
  { id: "America/Caracas", city: "Caracas", country: "Venezuela" },
  {
    id: "America/Panama",
    city: "Panama City",
    country: "Panama",
    aliases: ["EST"],
  },
  { id: "America/Havana", city: "Havana", country: "Cuba" },
  // ── Europe ──
  {
    id: "Europe/London",
    city: "London",
    country: "United Kingdom",
    aliases: ["England", "GMT", "BST"],
  },
  {
    id: "Europe/Paris",
    city: "Paris",
    country: "France",
    aliases: ["CET", "CEST"],
  },
  {
    id: "Europe/Berlin",
    city: "Berlin",
    country: "Germany",
    aliases: ["Munich", "Frankfurt", "CET"],
  },
  {
    id: "Europe/Madrid",
    city: "Madrid",
    country: "Spain",
    aliases: ["Barcelona"],
  },
  { id: "Europe/Rome", city: "Rome", country: "Italy", aliases: ["Milan"] },
  { id: "Europe/Amsterdam", city: "Amsterdam", country: "Netherlands" },
  { id: "Europe/Brussels", city: "Brussels", country: "Belgium" },
  { id: "Europe/Vienna", city: "Vienna", country: "Austria" },
  {
    id: "Europe/Zurich",
    city: "Zurich",
    country: "Switzerland",
    aliases: ["Geneva"],
  },
  { id: "Europe/Stockholm", city: "Stockholm", country: "Sweden" },
  { id: "Europe/Oslo", city: "Oslo", country: "Norway" },
  { id: "Europe/Copenhagen", city: "Copenhagen", country: "Denmark" },
  { id: "Europe/Helsinki", city: "Helsinki", country: "Finland" },
  { id: "Europe/Warsaw", city: "Warsaw", country: "Poland" },
  {
    id: "Europe/Prague",
    city: "Prague",
    country: "Czechia",
    aliases: ["Czech Republic"],
  },
  { id: "Europe/Budapest", city: "Budapest", country: "Hungary" },
  { id: "Europe/Athens", city: "Athens", country: "Greece" },
  {
    id: "Europe/Istanbul",
    city: "Istanbul",
    country: "Türkiye",
    aliases: ["Turkey", "Ankara"],
  },
  { id: "Europe/Moscow", city: "Moscow", country: "Russia" },
  { id: "Europe/Dublin", city: "Dublin", country: "Ireland", aliases: ["GMT"] },
  { id: "Europe/Lisbon", city: "Lisbon", country: "Portugal" },
  { id: "Europe/Kyiv", city: "Kyiv", country: "Ukraine", aliases: ["Kiev"] },
  { id: "Europe/Bucharest", city: "Bucharest", country: "Romania" },
  // ── Africa ──
  { id: "Africa/Cairo", city: "Cairo", country: "Egypt", aliases: ["EET"] },
  {
    id: "Africa/Johannesburg",
    city: "Johannesburg",
    country: "South Africa",
    aliases: ["Cape Town", "SAST"],
  },
  { id: "Africa/Lagos", city: "Lagos", country: "Nigeria", aliases: ["WAT"] },
  { id: "Africa/Nairobi", city: "Nairobi", country: "Kenya", aliases: ["EAT"] },
  { id: "Africa/Casablanca", city: "Casablanca", country: "Morocco" },
  { id: "Africa/Accra", city: "Accra", country: "Ghana", aliases: ["GMT"] },
  {
    id: "Africa/Addis_Ababa",
    city: "Addis Ababa",
    country: "Ethiopia",
    aliases: ["EAT"],
  },
  // ── Asia ──
  {
    id: "Asia/Kolkata",
    city: "Mumbai",
    country: "India",
    aliases: [
      "Bombay",
      "Delhi",
      "New Delhi",
      "Bangalore",
      "Chennai",
      "IST",
      "+05:30",
    ],
  },
  {
    id: "Asia/Tokyo",
    city: "Tokyo",
    country: "Japan",
    aliases: ["Osaka", "Kyoto", "JST"],
  },
  {
    id: "Asia/Shanghai",
    city: "Shanghai",
    country: "China",
    aliases: ["Beijing", "CST", "China"],
  },
  {
    id: "Asia/Hong_Kong",
    city: "Hong Kong",
    country: "Hong Kong",
    aliases: ["HKT"],
  },
  {
    id: "Asia/Singapore",
    city: "Singapore",
    country: "Singapore",
    aliases: ["SGT"],
  },
  {
    id: "Asia/Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    aliases: ["Abu Dhabi", "GST"],
  },
  { id: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia" },
  {
    id: "Asia/Bangkok",
    city: "Bangkok",
    country: "Thailand",
    aliases: ["ICT"],
  },
  { id: "Asia/Seoul", city: "Seoul", country: "South Korea", aliases: ["KST"] },
  { id: "Asia/Taipei", city: "Taipei", country: "Taiwan" },
  { id: "Asia/Manila", city: "Manila", country: "Philippines" },
  {
    id: "Asia/Jakarta",
    city: "Jakarta",
    country: "Indonesia",
    aliases: ["WIB"],
  },
  {
    id: "Asia/Karachi",
    city: "Karachi",
    country: "Pakistan",
    aliases: ["PKT"],
  },
  { id: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh", aliases: ["BST"] },
  { id: "Asia/Colombo", city: "Colombo", country: "Sri Lanka" },
  {
    id: "Asia/Kathmandu",
    city: "Kathmandu",
    country: "Nepal",
    aliases: ["NPT", "+05:45"],
  },
  { id: "Asia/Tehran", city: "Tehran", country: "Iran", aliases: ["IRST"] },
  { id: "Asia/Baghdad", city: "Baghdad", country: "Iraq" },
  {
    id: "Asia/Jerusalem",
    city: "Jerusalem",
    country: "Israel",
    aliases: ["Tel Aviv", "IST"],
  },
  { id: "Asia/Beirut", city: "Beirut", country: "Lebanon" },
  { id: "Asia/Tbilisi", city: "Tbilisi", country: "Georgia" },
  { id: "Asia/Yerevan", city: "Yerevan", country: "Armenia" },
  { id: "Asia/Almaty", city: "Almaty", country: "Kazakhstan" },
  { id: "Asia/Ulaanbaatar", city: "Ulaanbaatar", country: "Mongolia" },
  // ── Oceania ──
  {
    id: "Australia/Sydney",
    city: "Sydney",
    country: "Australia",
    aliases: ["AEST", "AEDT"],
  },
  { id: "Australia/Melbourne", city: "Melbourne", country: "Australia" },
  {
    id: "Australia/Brisbane",
    city: "Brisbane",
    country: "Australia",
    aliases: ["AEST"],
  },
  {
    id: "Australia/Perth",
    city: "Perth",
    country: "Australia",
    aliases: ["AWST"],
  },
  {
    id: "Australia/Adelaide",
    city: "Adelaide",
    country: "Australia",
    aliases: ["ACST"],
  },
  {
    id: "Australia/Darwin",
    city: "Darwin",
    country: "Australia",
    aliases: ["ACST"],
  },
  {
    id: "Pacific/Auckland",
    city: "Auckland",
    country: "New Zealand",
    aliases: ["Wellington", "NZST", "NZDT"],
  },
  {
    id: "Pacific/Chatham",
    city: "Chatham Islands",
    country: "New Zealand",
    aliases: ["CHAST", "+12:45"],
  },
  { id: "Pacific/Fiji", city: "Suva", country: "Fiji" },
  {
    id: "Atlantic/Reykjavik",
    city: "Reykjavik",
    country: "Iceland",
    aliases: ["GMT"],
  },
];

/** Local system zone (surfaced first in the picker). */
export function systemTimezoneId(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== "Etc/Unknown") return tz;
  } catch {
    /* fall through */
  }
  return "UTC";
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Search the index by city, country, id, or alias. Empty query → all. */
export function searchTimezones(query: string, limit = 40): TimezoneMeta[] {
  const q = normalize(query);
  if (!q) return [...TIMEZONE_INDEX].slice(0, limit);
  const scored = TIMEZONE_INDEX.map((row) => {
    const hay = normalize(
      [row.id, row.city, row.country, ...(row.aliases ?? [])].join(" "),
    );
    const idMatch = normalize(row.id).startsWith(q);
    const cityStarts = normalize(row.city).startsWith(q);
    const anyMatch = hay.includes(q);
    const score = idMatch
      ? 0
      : cityStarts
        ? 1
        : anyMatch
          ? 2
          : Number.POSITIVE_INFINITY;
    return { row, score };
  })
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
  return scored.map((x) => x.row);
}

function offsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? "−" : "+";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function resolveAbbreviation(zoneId: string, now: number): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: zoneId,
      timeZoneName: "short",
    }).formatToParts(now);
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    if (
      name &&
      name !== "GMT" &&
      !name.startsWith("GMT") &&
      !name.startsWith("+") &&
      !name.startsWith("-")
    ) {
      return name;
    }
  } catch {
    /* invalid zone */
  }
  return null;
}

/** Build a TimezoneEntry for the picker UI at a given instant. */
export function toTimezoneEntry(
  row: TimezoneMeta,
  now: number,
  locale = "en",
  hourCycle: 12 | 24 = 24,
): TimezoneEntry {
  const dt = DateTime.fromMillis(now, { zone: row.id });
  const short = resolveAbbreviation(row.id, now);
  const hasDst = (() => {
    const jan = DateTime.fromObject({ month: 1, day: 15 }, { zone: row.id });
    const jul = DateTime.fromObject({ month: 7, day: 15 }, { zone: row.id });
    return jan.offset !== jul.offset;
  })();
  return {
    id: row.id,
    city: row.city,
    country: row.country,
    abbreviation: short ?? offsetLabel(dt.offset),
    utcOffsetMinutes: dt.offset,
    localTimeLabel: dt.setLocale(locale).toLocaleString({
      hour: "2-digit",
      minute: "2-digit",
      hour12: hourCycle === 12,
    }),
    hasDst,
  };
}

/** Look up a single canonical entry by IANA id (falls back to a bare entry). */
export function findTimezone(id: string): TimezoneMeta | undefined {
  return TIMEZONE_INDEX.find((r) => r.id === id);
}
