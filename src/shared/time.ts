/**
 * OpenTime time utilities.
 *
 * Time is computed from a single `Date` (a wall-clock instant) via Intl /
 * Luxon with an IANA timezone ID. There is deliberately no per-widget timer
 * drift: the UI layer holds one "now" instant and all clocks render from it.
 *
 * The scheduler module (`shared/scheduler.ts`) is the single source that
 * advances `now`; every widget consumes the same instant.
 */

import { DateTime, IANAZone } from "luxon";

export interface TimeParts {
  /** Full timezone-aware DateTime for the instant. */
  dateTime: DateTime;
  /** IANA zone id, e.g. "America/Toronto". */
  zoneId: string;
  /** 12h or 24h cycle. */
  hourCycle: 12 | 24;
  /** True when seconds are requested (gates update frequency). */
  showSeconds: boolean;
  /** Locale used for formatting (defaults to system). */
  locale: string;
}

/** The wall-clock now as a stable value — advanced by the scheduler. */
export type Now = number; // ms epoch

export function isIanaZone(id: string): boolean {
  return IANAZone.isValidZone(id);
}

export function utcOffsetMinutesFor(zoneId: string, instant: number): number {
  const dt = DateTime.fromMillis(instant, { zone: zoneId });
  return dt.offset;
}

export function hasDst(zoneId: string): boolean {
  const zone = IANAZone.create(zoneId);
  if (!zone.isValid) return false;
  // Compare January and July offsets; differing offsets imply DST.
  const jan = DateTime.fromObject({ month: 1, day: 15 }, { zone });
  const jul = DateTime.fromObject({ month: 7, day: 15 }, { zone });
  return jan.offset !== jul.offset;
}

/** Format the time portion in the zone. Uses hour12 semantics per cycle. */
export function formatTime(
  now: number,
  zoneId: string,
  hourCycle: 12 | 24,
  locale: string,
): string {
  const dt = DateTime.fromMillis(now, { zone: zoneId });
  return dt.setLocale(locale).toLocaleString({
    hour: "2-digit",
    minute: "2-digit",
    hour12: hourCycle === 12,
  });
}

/** Format the seconds portion only (for digital clocks with seconds). */
export function formatSeconds(now: number, zoneId: string): string {
  const dt = DateTime.fromMillis(now, { zone: zoneId });
  return dt.toFormat("ss");
}

/** Full date in the zone, locale-aware (e.g. "Sat, Aug 2"). */
export function formatDate(
  now: number,
  zoneId: string,
  locale: string,
): string {
  const dt = DateTime.fromMillis(now, { zone: zoneId });
  return dt.setLocale(locale).toLocaleString({
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * IANA abbreviation (e.g. "EDT"), via Intl. Falls back to the UTC offset when
 * the environment cannot resolve a named abbreviation. `Intl` is preferred
 * over Luxon tokens here because short-zone tokens are not resolved by every
 * Node/WebView build, whereas `Intl.DateTimeFormat#formatToParts` is.
 */
export function zoneAbbreviation(now: number, zoneId: string): string {
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
  const dt = DateTime.fromMillis(now, { zone: zoneId });
  return formatUtcOffset(dt.offset);
}

/** Offset label like "UTC−04:00" or "UTC+05:30". */
export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? "−" : "+";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const mm = m === 0 ? "00" : String(m).padStart(2, "0");
  return `UTC${sign}${String(h).padStart(2, "0")}:${mm}`;
}

/**
 * A human-readable day-change indicator for the world-clock panel.
 * Returns "+1" when the local date is ahead of the reference date, "-1" when
 * behind, and null when on the same date.
 */
export function dayDifference(
  now: number,
  zoneId: string,
  referenceZoneId: string,
): number | null {
  const local = DateTime.fromMillis(now, { zone: zoneId }).toISODate();
  const reference = DateTime.fromMillis(now, {
    zone: referenceZoneId,
  }).toISODate();
  if (!local || !reference) return null;
  const diff = Math.round(
    (Date.parse(local) - Date.parse(reference)) / 86_400_000,
  );
  return diff === 0 ? null : diff;
}

/** True when the given date is a different calendar day in the zone. */
export function isNextDay(
  now: number,
  zoneId: string,
  referenceZoneId: string,
): boolean {
  const diff = dayDifference(now, zoneId, referenceZoneId);
  return diff !== null && diff > 0;
}
