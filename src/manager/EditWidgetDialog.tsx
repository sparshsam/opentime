/**
 * EditWidgetDialog — edit a widget's timezone, design, labels, and display
 * options from the manager. Used for both new and existing widgets.
 *
 * Preserves compatible settings when the design changes and safely resets
 * incompatible ones (seconds/date/timezone-label only supported by some
 * designs). All changes persist through the command layer.
 */

import { useState } from "react";
import type { WidgetRecord } from "@/shared/types";
import { getDesign } from "@/designs";
import { designsByFamily } from "@/designs";
import { api } from "@/persistence/api";
import { TimezonePicker } from "./TimezonePicker";
import { WorldClockEditor } from "./WorldClockEditor";

export function EditWidgetDialog({
  widget,
  onClose,
  onSaved,
}: {
  widget: WidgetRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [timezoneId, setTimezoneId] = useState(widget.timezoneId);
  const [designId, setDesignId] = useState<WidgetRecord["designId"]>(
    widget.designId,
  );
  const [label, setLabel] = useState(widget.label);
  const [hourCycle, setHourCycle] = useState(widget.hourCycle);
  const [showSeconds, setShowSeconds] = useState(widget.showSeconds);
  const [showDate, setShowDate] = useState(widget.showDate);
  const [showTzLabel, setShowTzLabel] = useState(widget.showTimezoneLabel);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const design = getDesign(designId);
  // Incompatible flags are auto-reset when the design doesn't support them.
  const canSeconds = design.capabilities.seconds;
  const canDate = design.capabilities.date;
  const canTzLabel = design.capabilities.timezoneLabel;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateWidget({
        id: widget.id,
        patch: {
          timezoneId,
          designId,
          label: label.trim() || timezoneId,
          hourCycle,
          showSeconds: canSeconds ? showSeconds : false,
          showDate: canDate ? showDate : false,
          showTimezoneLabel: canTzLabel ? showTzLabel : false,
        },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Edit ${widget.label}`}
        style={{
          width: 440,
          maxHeight: "86vh",
          overflowY: "auto",
          background: "var(--ot-elevated)",
          border: "1px solid var(--ot-border)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Edit Clock</h3>

        <Field label="Label">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Home, London Office"
            style={input}
          />
        </Field>

        <Field label="Timezone">
          <TimezonePicker
            value={timezoneId}
            onSelect={setTimezoneId}
            hourCycle={hourCycle}
          />
        </Field>

        <Field label="Design">
          <select
            value={designId}
            onChange={(e) =>
              setDesignId(e.target.value as WidgetRecord["designId"])
            }
            style={input}
          >
            {[
              ...designsByFamily("digital"),
              ...designsByFamily("analog"),
              ...designsByFamily("world-clock"),
            ].map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.family})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Hour cycle">
          <div style={{ display: "flex", gap: 8 }}>
            <label style={radioChip(hourCycle === 12)}>
              <input
                type="radio"
                name="hour"
                checked={hourCycle === 12}
                onChange={() => setHourCycle(12)}
              />
              12-hour
            </label>
            <label style={radioChip(hourCycle === 24)}>
              <input
                type="radio"
                name="hour"
                checked={hourCycle === 24}
                onChange={() => setHourCycle(24)}
              />
              24-hour
            </label>
          </div>
        </Field>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 12,
          }}
        >
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={showSeconds}
              disabled={!canSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Show seconds
            {!canSeconds && (
              <em style={{ opacity: 0.5, marginLeft: 6 }}>
                (not supported by this design)
              </em>
            )}
          </label>
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={showDate}
              disabled={!canDate}
              onChange={(e) => setShowDate(e.target.checked)}
            />
            Show date
          </label>
          <label style={checkRow}>
            <input
              type="checkbox"
              checked={showTzLabel}
              disabled={!canTzLabel}
              onChange={(e) => setShowTzLabel(e.target.checked)}
            />
            Show timezone label
          </label>
        </div>

        {design.id === "world-clock-panel" && (
          <WorldClockEditor widget={widget} onSaved={() => onSaved()} />
        )}

        {error && (
          <div style={{ color: "#f66", marginTop: 12, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button onClick={onClose} style={ghost}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={primary}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "var(--ot-text-secondary)",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--ot-border)",
  background: "var(--ot-surface)",
  color: "var(--ot-text)",
  fontSize: 13,
};

const checkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

const radioChip = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
  borderRadius: 999,
  border: `1px solid ${active ? "var(--ot-accent)" : "var(--ot-border)"}`,
  background: active ? "rgba(122,0,75,0.15)" : "var(--ot-surface)",
  cursor: "pointer",
  fontSize: 13,
});

const ghost: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid var(--ot-border)",
  background: "transparent",
  color: "var(--ot-text)",
  cursor: "pointer",
};

const primary: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: 8,
  border: "none",
  background: "var(--ot-accent)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};
