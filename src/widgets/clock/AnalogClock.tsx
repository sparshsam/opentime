/**
 * Analog clock renderers.
 *
 * All analog designs share a single SVG skeleton and differ only in their
 * markers, numerals, and hand styling — driven by AppearanceConfig tokens and
 * a numeral style. An accessible text equivalent ("8:34 PM") is always present.
 */

import { useMemo } from "react";
import type {
  AnalogDesignId,
  AppearanceConfig,
  WidgetRecord,
} from "@/shared/types";
import { useNow } from "@/shared/useNow";
import { DateTime } from "luxon";
import { formatTime } from "@/shared/time";

export interface AnalogClockProps {
  widget: WidgetRecord;
  previewNow?: number;
  locale?: string;
}

const ROMAN_NUMERALS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];
const ARABIC_NUMERALS = [
  "12",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
];

interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

function anglesFor(now: number, zoneId: string): HandAngles {
  const dt = DateTime.fromMillis(now, { zone: zoneId });
  const h = dt.hour % 12;
  const m = dt.minute;
  const s = dt.second;
  return {
    hour: h * 30 + m * 0.5,
    minute: m * 6 + s * 0.1,
    second: s * 6,
  };
}

export function AnalogClock({
  widget,
  previewNow,
  locale = "en",
}: AnalogClockProps) {
  const realNow = useNow(widget.showSeconds);
  const now = previewNow ?? realNow;
  const a = widget.appearance;
  const design = widget.designId as AnalogDesignId;
  const angles = useMemo(
    () => anglesFor(now, widget.timezoneId),
    [now, widget.timezoneId],
  );

  const size = 220;
  const c = size / 2;
  const r = c - 10;

  const markers = useMemo(() => markerConfig(design, a), [design, a]);

  const hourHand = handStyle(design, a, "hour");
  const minuteHand = handStyle(design, a, "minute");

  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${a.scale})`,
        transformOrigin: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={formatTime(
          now,
          widget.timezoneId,
          widget.hourCycle,
          locale,
        )}
      >
        {/* Face */}
        {a.backgroundColor !== "transparent" && (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill={a.backgroundColor}
            stroke={a.borderColor ?? "transparent"}
            strokeWidth={1.5}
          />
        )}

        {/* Markers */}
        {markers.map((mk, i) => {
          const ang = (i * 30 * Math.PI) / 180;
          const outer = r - 4;
          const inner = r - (mk.minor ? 12 : mk.major ? 16 : 22);
          return (
            <line
              key={i}
              x1={c + outer * Math.sin(ang)}
              y1={c - outer * Math.cos(ang)}
              x2={c + inner * Math.sin(ang)}
              y2={c - inner * Math.cos(ang)}
              stroke={a.markerColor ?? a.primaryColor}
              strokeWidth={mk.minor ? 1.5 : 2.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Numerals */}
        {markerLabels(design, a).map((label, i) => {
          const ang = (i * 30 * Math.PI) / 180 - Math.PI / 2;
          const labelR = r - (design === "classic-analog" ? 26 : 22);
          return (
            <text
              key={i}
              x={c + labelR * Math.cos(ang)}
              y={c + labelR * Math.sin(ang)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={
                design === "classic-analog"
                  ? 16
                  : design === "roman-analog"
                    ? 14
                    : 15
              }
              fontWeight={design === "modern-analog" ? 400 : 600}
              fill={a.markerColor ?? a.primaryColor}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {label}
            </text>
          );
        })}

        {/* Hands */}
        <g transform={`rotate(${angles.hour} ${c} ${c})`}>
          <rect
            x={c - hourHand.thickness / 2}
            y={c - hourHand.length}
            width={hourHand.thickness}
            height={hourHand.length}
            rx={hourHand.thickness / 2}
            fill={a.handColor ?? a.primaryColor}
          />
        </g>
        <g transform={`rotate(${angles.minute} ${c} ${c})`}>
          <rect
            x={c - minuteHand.thickness / 2}
            y={c - minuteHand.length}
            width={minuteHand.thickness}
            height={minuteHand.length}
            rx={minuteHand.thickness / 2}
            fill={a.handColor ?? a.primaryColor}
          />
        </g>
        {widget.showSeconds && (
          <g transform={`rotate(${angles.second} ${c} ${c})`}>
            <rect
              x={c - 1}
              y={c - r + 8}
              width={2}
              height={r - 8}
              rx={1}
              fill={a.secondaryColor ?? "#d33"}
            />
          </g>
        )}

        {/* Center cap */}
        <circle
          cx={c}
          cy={c}
          r={Math.max(3, hourHand.thickness / 1.6)}
          fill={a.handColor ?? a.primaryColor}
        />
      </svg>

      {widget.showTimezoneLabel && (
        <div
          style={{
            textAlign: "center",
            marginTop: "0.4em",
            fontSize: "0.75rem",
            opacity: 0.75,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: a.secondaryColor ?? a.primaryColor,
          }}
        >
          {widget.label}
        </div>
      )}
    </div>
  );
}

// ── Design-specific configuration ─────────────────────────────────────────

interface MarkerSpec {
  major: boolean;
  minor: boolean;
}

function markerConfig(
  design: AnalogDesignId,
  _a: AppearanceConfig,
): MarkerSpec[] {
  const arr: MarkerSpec[] = [];
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) arr.push({ major: true, minor: false });
    else arr.push({ major: false, minor: true });
  }
  // Some designs use minimal markers only.
  if (design === "modern-analog" || design === "numeral-free-analog") {
    return Array.from({ length: 60 }, (_, i) => ({
      major: i % 5 === 0,
      minor: i % 5 !== 0 && design === "modern-analog",
    }));
  }
  return arr;
}

function markerLabels(design: AnalogDesignId, _a: AppearanceConfig): string[] {
  switch (design) {
    case "roman-analog":
      return ROMAN_NUMERALS;
    // Modern: restrained markings, no numerals. Numeral-free: markers only.
    case "modern-analog":
    case "numeral-free-analog":
      return [];
    case "railway-analog":
      return ARABIC_NUMERALS;
    case "classic-analog":
    case "minimal-analog":
    default:
      return ARABIC_NUMERALS;
  }
}

interface HandSpec {
  length: number;
  thickness: number;
}

function handStyle(
  design: AnalogDesignId,
  _a: AppearanceConfig,
  kind: "hour" | "minute" | "second",
): HandSpec {
  const r = 220 / 2 - 10;
  switch (kind) {
    case "hour":
      return {
        length: r * 0.55,
        thickness: design === "modern-analog" ? 4 : 5,
      };
    case "minute":
      return {
        length: r * 0.78,
        thickness: design === "modern-analog" ? 3 : 4,
      };
    case "second":
      return { length: r * 0.86, thickness: 2 };
  }
}
