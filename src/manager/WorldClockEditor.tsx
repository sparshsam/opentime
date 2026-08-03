/**
 * WorldClockEditor — configure the rows of a world-clock-panel widget.
 *
 * Add timezones via the picker, reorder with drag (up/down), toggle per-row
 * date / UTC offset / abbreviation, set custom labels. Persists through the
 * command layer. Fully keyboard accessible.
 */

import { useState } from "react";
import type { WidgetRecord, WorldClockRow } from "@/shared/types";
import { api } from "@/persistence/api";
import { TimezonePicker } from "./TimezonePicker";
import { getDesign } from "@/designs";

export function WorldClockEditor({
  widget,
  onSaved,
}: {
  widget: WidgetRecord;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<WorldClockRow[]>(widget.worldRows);
  const [error, setError] = useState<string | null>(null);

  const isWorldPanel = getDesign(widget.designId).family === "world-clock";
  if (!isWorldPanel) return null;

  const persist = async (next: WorldClockRow[]) => {
    setRows(next);
    setError(null);
    try {
      await api.updateWidget({ id: widget.id, patch: { worldRows: next } });
      onSaved();
    } catch (e) {
      setError(String(e));
    }
  };

  const addZone = (zoneId: string) => {
    if (rows.some((r) => r.timezoneId === zoneId)) return;
    persist([
      ...rows,
      {
        timezoneId: zoneId,
        label: zoneId,
        showDate: false,
        showUtcOffset: false,
        showAbbreviation: false,
      },
    ]);
  };

  const updateRow = (i: number, patch: Partial<WorldClockRow>) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    persist(next);
  };

  const moveRow = (i: number, dir: -1 | 1) => {
    const target = i + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(i, 1);
    next.splice(target, 0, item);
    persist(next);
  };

  const removeRow = (i: number) => {
    persist(rows.filter((_, idx) => idx !== i));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        World Clock Rows
      </div>

      <TimezonePicker
        value={""}
        onSelect={addZone}
        hourCycle={widget.hourCycle}
      />

      {rows.length === 0 && (
        <p
          style={{
            fontSize: 13,
            color: "var(--ot-text-tertiary)",
            marginTop: 8,
          }}
        >
          Add timezones above to populate the panel.
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 12,
        }}
      >
        {rows.map((row, i) => (
          <div
            key={`${row.timezoneId}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              background: "var(--ot-surface)",
              border: "1px solid var(--ot-border)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => moveRow(i, -1)}
                style={arrowBtn(i === 0)}
              >
                ↑
              </button>
              <button
                aria-label="Move down"
                disabled={i === rows.length - 1}
                onClick={() => moveRow(i, 1)}
                style={arrowBtn(i === rows.length - 1)}
              >
                ↓
              </button>
            </div>

            <input
              value={row.label}
              onChange={(e) => updateRow(i, { label: e.target.value })}
              aria-label="Label"
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid var(--ot-border)",
                background: "var(--ot-elevated)",
                color: "var(--ot-text)",
                fontSize: 12,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--ot-text-tertiary)",
                fontFamily: "monospace",
              }}
            >
              {row.timezoneId}
            </span>

            <label
              style={{
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <input
                type="checkbox"
                checked={row.showDate}
                onChange={(e) => updateRow(i, { showDate: e.target.checked })}
              />
              D
            </label>
            <label
              style={{
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <input
                type="checkbox"
                checked={row.showUtcOffset}
                onChange={(e) =>
                  updateRow(i, { showUtcOffset: e.target.checked })
                }
              />
              UTC
            </label>
            <label
              style={{
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <input
                type="checkbox"
                checked={row.showAbbreviation}
                onChange={(e) =>
                  updateRow(i, { showAbbreviation: e.target.checked })
                }
              />
              Abbr
            </label>

            <button
              aria-label="Remove row"
              onClick={() => removeRow(i)}
              style={{
                background: "none",
                border: "none",
                color: "#e88",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ color: "#f66", marginTop: 8, fontSize: 12 }}>{error}</div>
      )}
    </div>
  );
}

const arrowBtn = (disabled: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  color: disabled ? "var(--ot-text-tertiary)" : "var(--ot-text)",
  cursor: disabled ? "default" : "pointer",
  fontSize: 11,
  padding: 0,
  lineHeight: 1.2,
});
