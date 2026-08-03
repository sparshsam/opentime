/**
 * Digital clock renderers.
 *
 * Each design family is a presentational component that reads a `WidgetRecord`
 * (timezone, hour cycle, visibility flags) and its `AppearanceConfig` tokens,
 * then renders the current time. Color variation is driven entirely by tokens —
 * never by per-color components.
 */

import type { CSSProperties } from "react";
import type {
  AppearanceConfig,
  DigitalDesignId,
  WidgetRecord,
} from "@/shared/types";
import { useNow } from "@/shared/useNow";
import {
  formatDate,
  formatSeconds,
  formatTime,
  zoneAbbreviation,
} from "@/shared/time";
import { getFont } from "@/shared/fonts";

export interface ClockRenderProps {
  widget: WidgetRecord;
  /** Override "now" for gallery previews (otherwise real time). */
  previewNow?: number;
  locale?: string;
}

export interface DigitalClockProps extends ClockRenderProps {
  design: DigitalDesignId;
}

/**
 * Shared digital-clock layout. Reads only the fields the design supports and
 * lays them out in the design's arrangement. Kept generic so adding a design
 * is configuration, not new layout logic.
 */
export function DigitalClock({
  widget,
  design,
  previewNow,
  locale = "en",
}: DigitalClockProps) {
  const realNow = useNow(widget.showSeconds);
  const now = previewNow ?? realNow;
  const a = widget.appearance;
  const font = getFont(a.fontStyle);
  const time = formatTime(now, widget.timezoneId, widget.hourCycle, locale);
  const seconds = widget.showSeconds
    ? formatSeconds(now, widget.timezoneId)
    : null;
  const date = widget.showDate
    ? formatDate(now, widget.timezoneId, locale)
    : null;
  const tz = widget.showTimezoneLabel
    ? zoneAbbreviation(now, widget.timezoneId)
    : null;

  const style: CSSProperties = {
    color: a.primaryColor,
    fontFamily: font.stack,
    textAlign: a.alignment,
    transform: `scale(${a.scale})`,
    transformOrigin:
      a.alignment === "start"
        ? "left center"
        : a.alignment === "end"
          ? "right center"
          : "center",
  };

  const render = (() => {
    switch (design) {
      case "classic-led":
        return <LedTime time={time} seconds={seconds} appearance={a} />;
      case "terminal":
        return (
          <TerminalTime time={time} seconds={seconds} date={date} tz={tz} />
        );
      case "editorial":
        return (
          <EditorialTime
            time={time}
            seconds={seconds}
            date={date}
            tz={tz}
            appearance={a}
          />
        );
      case "compact":
        return (
          <CompactTime time={time} seconds={seconds} date={date} tz={tz} />
        );
      case "soft-panel":
        return (
          <SoftPanelTime
            time={time}
            seconds={seconds}
            date={date}
            tz={tz}
            appearance={a}
          />
        );
      case "flip":
        return <FlipTime time={time} seconds={seconds} appearance={a} />;
      case "minimal-digital":
      default:
        return (
          <MinimalTime time={time} seconds={seconds} date={date} tz={tz} />
        );
    }
  })();

  return <div style={style}>{render}</div>;
}

// ── Individual digital design layouts ────────────────────────────────────

function MinimalTime({
  time,
  seconds,
  date,
  tz,
}: {
  time: string;
  seconds: string | null;
  date: string | null;
  tz: string | null;
}) {
  return (
    <div style={{ lineHeight: 1.1 }}>
      <div
        style={{ fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        {time}
        {seconds && (
          <span style={{ fontSize: "1.4rem", opacity: 0.7 }}>:{seconds}</span>
        )}
      </div>
      {(date || tz) && (
        <div
          style={{
            fontSize: "0.85rem",
            opacity: 0.75,
            marginTop: "0.35em",
            display: "flex",
            gap: "0.6em",
            justifyContent: "inherit",
          }}
        >
          {date && <span>{date}</span>}
          {tz && (
            <span
              style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {tz}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function EditorialTime({
  time,
  seconds,
  date,
  tz,
  appearance: a,
}: {
  time: string;
  seconds: string | null;
  date: string | null;
  tz: string | null;
  appearance: AppearanceConfig;
}) {
  return (
    <div style={{ lineHeight: 1.05 }}>
      <div
        style={{
          fontSize: "3.8rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        {time}
        {seconds && (
          <span style={{ fontSize: "1.7rem", opacity: 0.6 }}>:{seconds}</span>
        )}
      </div>
      {(date || tz) && (
        <div
          style={{
            fontSize: "0.95rem",
            color: a.secondaryColor,
            marginTop: "0.45em",
            fontStyle: "italic",
          }}
        >
          {date}
          {date && tz && <span> · </span>}
          {tz && <span>{tz}</span>}
        </div>
      )}
    </div>
  );
}

function LedTime({
  time,
  seconds,
  appearance: a,
}: {
  time: string;
  seconds: string | null;
  appearance: AppearanceConfig;
}) {
  return (
    <div
      style={{
        fontFamily: getFont("segmented").stack,
        lineHeight: 1,
        letterSpacing: "0.04em",
        textShadow:
          a.shadowStrength > 0
            ? `0 0 ${Math.round(8 * a.shadowStrength)}px ${a.primaryColor}`
            : undefined,
      }}
    >
      <span style={{ fontSize: "3rem", fontWeight: 400 }}>
        {time}
        {seconds && (
          <span style={{ fontSize: "1.5rem", opacity: 0.7 }}>:{seconds}</span>
        )}
      </span>
    </div>
  );
}

function TerminalTime({
  time,
  seconds,
  date,
  tz,
}: {
  time: string;
  seconds: string | null;
  date: string | null;
  tz: string | null;
}) {
  return (
    <div style={{ fontFamily: getFont("monospace").stack, lineHeight: 1.15 }}>
      <div
        style={{ fontSize: "2.6rem", fontWeight: 600, letterSpacing: "0.02em" }}
      >
        {time}
        {seconds && (
          <span style={{ fontSize: "1.3rem", opacity: 0.6 }}>:{seconds}</span>
        )}
      </div>
      {(date || tz) && (
        <div
          style={{
            fontSize: "0.8rem",
            opacity: 0.7,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {tz && <span>[{tz}]</span>}
          {tz && date && <span> </span>}
          {date && <span>{date}</span>}
        </div>
      )}
    </div>
  );
}

function SoftPanelTime({
  time,
  seconds,
  date,
  tz,
  appearance: a,
}: {
  time: string;
  seconds: string | null;
  date: string | null;
  tz: string | null;
  appearance: AppearanceConfig;
}) {
  return (
    <div
      style={{
        background: a.backgroundColor,
        border: `1px solid ${a.borderColor ?? "transparent"}`,
        borderRadius: a.cornerRadius,
        boxShadow:
          a.shadowStrength > 0
            ? `0 ${Math.round(6 * a.shadowStrength)}px ${Math.round(16 * a.shadowStrength)}px rgba(0,0,0,${0.18 * a.shadowStrength})`
            : undefined,
        padding: "1rem 1.4rem",
        lineHeight: 1.1,
      }}
    >
      <div style={{ fontSize: "2.8rem", fontWeight: 700 }}>
        {time}
        {seconds && (
          <span style={{ fontSize: "1.3rem", opacity: 0.7 }}>:{seconds}</span>
        )}
      </div>
      {(date || tz) && (
        <div
          style={{
            fontSize: "0.85rem",
            color: a.secondaryColor,
            marginTop: "0.35em",
          }}
        >
          {date}
          {date && tz && " · "}
          {tz && <span style={{ textTransform: "uppercase" }}>{tz}</span>}
        </div>
      )}
    </div>
  );
}

function CompactTime({
  time,
  seconds,
  date,
  tz,
}: {
  time: string;
  seconds: string | null;
  date: string | null;
  tz: string | null;
}) {
  return (
    <div style={{ lineHeight: 1.1 }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>
        {time}
        {seconds && (
          <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>:{seconds}</span>
        )}
      </div>
      {(date || tz) && (
        <div
          style={{
            fontSize: "0.7rem",
            opacity: 0.7,
            marginTop: "0.2em",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {tz ?? date}
        </div>
      )}
    </div>
  );
}

function FlipTime({
  time,
  seconds,
  appearance: a,
}: {
  time: string;
  seconds: string | null;
  appearance: AppearanceConfig;
}) {
  // Split-flap presentation: render each character in a "flap" cell.
  // A subtle flip animation plays when a digit changes, but only when the OS
  // has not requested reduced motion (prefers-reduced-motion). The animation
  // itself is defined in globals.css and keyed off that media query.
  const chars = time.split("");
  return (
    <div
      style={{
        display: "flex",
        gap: Math.max(2, Math.round(a.spacing * 0.35)),
        fontFamily: getFont("geometric-sans").stack,
      }}
    >
      {chars.map((c, i) => (
        <span
          key={`${i}-${c}`}
          className="ot-flap-cell"
          style={{
            background:
              a.backgroundColor === "transparent"
                ? "rgba(17,17,17,0.85)"
                : a.backgroundColor,
            border: `1px solid ${a.borderColor ?? "rgba(255,255,255,0.15)"}`,
            borderRadius: Math.max(2, Math.round(a.cornerRadius * 0.4)),
            fontSize: "2.6rem",
            fontWeight: 700,
            minWidth: "1.4em",
            textAlign: "center",
            padding: "0.1em 0.15em",
            color: a.primaryColor,
            boxShadow:
              a.shadowStrength > 0
                ? `inset 0 1px 0 rgba(255,255,255,0.12), 0 ${Math.round(3 * a.shadowStrength)}px ${Math.round(6 * a.shadowStrength)}px rgba(0,0,0,${0.25 * a.shadowStrength})`
                : undefined,
          }}
        >
          {c}
        </span>
      ))}
      {seconds && (
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: a.secondaryColor,
            paddingLeft: Math.max(2, Math.round(a.spacing * 0.2)),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {seconds}
        </span>
      )}
    </div>
  );
}
