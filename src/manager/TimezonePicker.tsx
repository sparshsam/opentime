/**
 * TimezonePicker — searchable IANA timezone picker (offline).
 *
 * Search works on the bundled index (city / country / id / alias). Shows the
 * city, country, abbreviation, UTC offset, and a live local-time preview. Fully
 * keyboard navigable (type to filter, arrows + Enter to select, Esc to close).
 */

import { useMemo, useRef, useState } from "react";
import type { TimezoneEntry } from "@/shared/types";
import { searchTimezones, systemTimezoneId, toTimezoneEntry } from "@/timezone";
import { useNow } from "@/shared/useNow";
import { formatUtcOffset } from "@/shared/time";
import { t } from "@/localization";

export function TimezonePicker({
  value,
  onSelect,
  hourCycle = 24,
}: {
  value: string;
  onSelect: (zoneId: string) => void;
  hourCycle?: 12 | 24;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const now = useNow(false);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const rows = query.trim()
      ? searchTimezones(query, 30)
      : searchTimezones("", 30);
    return rows.map((row) => toTimezoneEntry(row, now, "en", hourCycle));
  }, [query, now, hourCycle]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlighted]) {
      e.preventDefault();
      onSelect(results[highlighted].id);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="opentime-tz-list"
        aria-label={t("worldclock.search")}
        placeholder={t("worldclock.search")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: 8,
          border: "1px solid var(--ot-border)",
          background: "var(--ot-elevated)",
          color: "var(--ot-text)",
          fontSize: 13,
        }}
      />

      {open && (
        <div
          ref={listRef}
          id="opentime-tz-list"
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 50,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: 320,
            overflowY: "auto",
            background: "var(--ot-elevated)",
            border: "1px solid var(--ot-border)",
            borderRadius: 10,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            padding: 4,
          }}
        >
          {results.length === 0 && (
            <div
              style={{
                padding: 12,
                color: "var(--ot-text-tertiary)",
                fontSize: 13,
              }}
            >
              No timezones match “{query}”.
            </div>
          )}
          {results.map((entry, i) => (
            <TimezoneRow
              key={entry.id}
              entry={entry}
              selected={entry.id === value}
              highlighted={i === highlighted}
              onMouseEnter={() => setHighlighted(i)}
              onSelect={() => {
                onSelect(entry.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}

      {!open && value && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "var(--ot-text-tertiary)",
          }}
        >
          Current: {value}
          {value === systemTimezoneId() ? " (system)" : ""}
        </div>
      )}
    </div>
  );
}

function TimezoneRow({
  entry,
  selected,
  highlighted,
  onMouseEnter,
  onSelect,
}: {
  entry: TimezoneEntry;
  selected: boolean;
  highlighted: boolean;
  onMouseEnter: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      role="option"
      aria-selected={selected}
      onMouseEnter={onMouseEnter}
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        background: highlighted ? "var(--ot-surface)" : "transparent",
        color: "var(--ot-text)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          {entry.city}, {entry.country}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ot-text-tertiary)",
            fontFamily: "monospace",
          }}
        >
          {entry.id}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
          {entry.localTimeLabel}
        </div>
        <div style={{ fontSize: 11, color: "var(--ot-text-tertiary)" }}>
          {entry.abbreviation} · {formatUtcOffset(entry.utcOffsetMinutes)}
        </div>
      </div>
    </div>
  );
}
