/**
 * World Clock Panel design — a grouped multi-timezone panel.
 *
 * Renders one row per timezone (from `rows`), each with a label, the current
 * time, and an optional date / UTC offset / abbreviation. A day-change
 * indicator (+1 / −1) is shown against the local (first) row's date, and the
 * same information is conveyed in the accessible label so it is never
 * color/visual-only.
 */

import type { AppearanceConfig, WorldClockRow } from "@/shared/types";
import { useNow } from "@/shared/useNow";
import { DateTime } from "luxon";
import {
  dayDifference,
  formatDate,
  formatTime,
  formatUtcOffset,
  zoneAbbreviation,
} from "@/shared/time";

export interface WorldClockPanelProps {
  rows: WorldClockRow[];
  appearance: AppearanceConfig;
  hourCycle: 12 | 24;
  showSeconds: boolean;
  referenceTimezoneId: string;
  locale?: string;
  previewNow?: number;
  /** Optional panel heading (defaults to "WORLD CLOCK"). */
  heading?: string;
}

export function WorldClockPanel({
  rows,
  appearance: a,
  hourCycle,
  showSeconds,
  referenceTimezoneId,
  locale = "en",
  previewNow,
  heading,
}: WorldClockPanelProps) {
  const realNow = useNow(showSeconds);
  const now = previewNow ?? realNow;
  const reference = DateTime.fromMillis(now, { zone: referenceTimezoneId });

  return (
    <div
      style={{
        background:
          a.backgroundColor === "transparent"
            ? "rgba(17,17,17,0.72)"
            : a.backgroundColor,
        border: `1px solid ${a.borderColor ?? "rgba(255,255,255,0.12)"}`,
        borderRadius: a.cornerRadius,
        padding: "0.9rem 1.1rem",
        fontFamily: "Inter, system-ui, sans-serif",
        color: a.primaryColor,
        minWidth: 220,
        transform: `scale(${a.scale})`,
        transformOrigin: "center",
      }}
      role="group"
      aria-label={`${heading ?? "World clock"} — local time ${formatTime(now, referenceTimezoneId, hourCycle, locale)}`}
    >
      {heading && (
        <div
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.65,
            marginBottom: "0.6rem",
          }}
        >
          {heading}
        </div>
      )}

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {rows.map((row) => {
            const diff = dayDifference(
              now,
              row.timezoneId,
              referenceTimezoneId,
            );
            const tz = DateTime.fromMillis(now, { zone: row.timezoneId });
            return (
              <tr
                key={row.timezoneId}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <td
                  style={{
                    padding: "0.28rem 0.6rem 0.28rem 0",
                    fontSize: "0.8rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: a.secondaryColor,
                  }}
                  aria-label={`${row.label}, timezone ${row.timezoneId}`}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    padding: "0.28rem 0.4rem",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                  aria-label={`${formatTime(now, row.timezoneId, hourCycle, locale)}${diff ? `, ${diff > 0 ? "next day" : "previous day"}` : ""}`}
                >
                  {formatTime(now, row.timezoneId, hourCycle, locale)}
                  {showSeconds && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.7,
                        marginLeft: "0.15em",
                      }}
                    >
                      {tz.toFormat("ss")}
                    </span>
                  )}
                </td>
                {diff !== null && (
                  <td
                    style={{
                      padding: "0.28rem 0 0.28rem 0.4rem",
                      fontSize: "0.7rem",
                      opacity: 0.75,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                    aria-hidden="true"
                  >
                    {diff > 0 ? `+${diff}` : `${diff}`}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          gap: "0.8em",
          marginTop: "0.55rem",
          fontSize: "0.68rem",
          opacity: 0.6,
          flexWrap: "wrap",
        }}
      >
        {rows.slice(0, 1).map((row) => (
          <span key={row.timezoneId} aria-hidden="true">
            {row.showAbbreviation && zoneAbbreviation(now, row.timezoneId)}
            {row.showUtcOffset &&
              formatUtcOffset(
                DateTime.fromMillis(now, { zone: row.timezoneId }).offset,
              )}
            {row.showDate && formatDate(now, row.timezoneId, locale)}
          </span>
        ))}
        <span aria-hidden="true" style={{ marginLeft: "auto" }}>
          {reference.toFormat("dd MMM")}
        </span>
      </div>
    </div>
  );
}
