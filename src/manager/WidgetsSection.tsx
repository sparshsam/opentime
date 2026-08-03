/**
 * WidgetsSection — the active clock list in the manager.
 *
 * Lists every widget with preview, label, timezone, local time, design,
 * display, lock and visibility state, plus per-widget actions (edit, show/hide,
 * lock/unlock, duplicate, move to display, remove).
 */

import { useState, type CSSProperties } from "react";
import type { AppSettings, MonitorInfo, WidgetRecord } from "@/shared/types";
import { api } from "@/persistence/api";
import { getDesign } from "@/designs";
import { invoke } from "@tauri-apps/api/core";
import { ClockWidget } from "@/widgets/clock/ClockWidget";
import { EditWidgetDialog } from "./EditWidgetDialog";
import { DateTime } from "luxon";
import { t } from "@/localization";

interface WidgetsSectionProps {
  widgets: WidgetRecord[];
  monitors: MonitorInfo[];
  settings: AppSettings;
  onChange: () => void;
  onCreate: () => void;
}

export function WidgetsSection({
  widgets,
  monitors,
  settings,
  onChange,
  onCreate,
}: WidgetsSectionProps) {
  const [editing, setEditing] = useState<WidgetRecord | null>(null);

  const doAction = async (widget: WidgetRecord, action: string) => {
    switch (action) {
      case "edit":
        setEditing(widget);
        return; // don't call onChange yet
      case "show":
        await api.updateWidget({ id: widget.id, patch: { hidden: false } });
        await invoke("show_widget", { widgetId: widget.id });
        break;
      case "hide":
        await api.updateWidget({ id: widget.id, patch: { hidden: true } });
        await invoke("hide_widget", { widgetId: widget.id });
        break;
      case "lock":
        await api.updateWidget({ id: widget.id, patch: { locked: true } });
        break;
      case "unlock":
        await api.updateWidget({ id: widget.id, patch: { locked: false } });
        break;
      case "duplicate":
        await api.duplicateWidget(widget.id);
        break;
      case "remove":
        if (window.confirm(t("widgets.confirmRemove"))) {
          await api.deleteWidget(widget.id);
          await invoke("destroy_widget_window", { widgetId: widget.id });
        }
        break;
      case "next-display":
        await invoke("move_widget_next_display", { widgetId: widget.id });
        break;
      default:
        break;
    }
    onChange();
  };

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0 }}>{t("widgets.title")}</h2>
        <button onClick={onCreate} style={buttonPrimary}>
          + {t("widgets.add")}
        </button>
      </div>

      {widgets.length === 0 ? (
        <p style={{ color: "var(--ot-text-secondary)", marginTop: 24 }}>
          {t("widgets.empty")}
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 20,
          }}
        >
          {widgets.map((w) => (
            <WidgetRow
              key={w.id}
              widget={w}
              monitors={monitors}
              settings={settings}
              onAction={doAction}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditWidgetDialog
          widget={editing}
          onClose={() => setEditing(null)}
          onSaved={() => onChange()}
        />
      )}
    </section>
  );
}

function WidgetRow({
  widget,
  monitors,
  settings: _settings,
  onAction,
}: {
  widget: WidgetRecord;
  monitors: MonitorInfo[];
  settings: AppSettings;
  onAction: (w: WidgetRecord, action: string) => void;
}) {
  const design = getDesign(widget.designId);
  const now = Date.now();
  const local = DateTime.fromMillis(now, { zone: widget.timezoneId });
  const display = monitors.find((m) => m.displayId === widget.displayId);
  const isWorldPanel = design.family === "world-clock";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        background: "var(--ot-surface)",
        border: "1px solid var(--ot-border)",
        borderRadius: 10,
      }}
    >
      {/* Live preview */}
      <div
        style={{
          width: 120,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 6,
          background:
            widget.appearance.backgroundColor === "transparent"
              ? "rgba(0,0,0,0.3)"
              : widget.appearance.backgroundColor,
        }}
        aria-hidden="true"
      >
        <div style={{ transform: "scale(0.5)", transformOrigin: "center" }}>
          {isWorldPanel ? (
            <span
              style={{ color: widget.appearance.primaryColor, fontSize: 12 }}
            >
              World Clock
            </span>
          ) : (
            <ClockWidget
              widget={{ ...widget, scale: widget.scale }}
              previewNow={now}
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 14 }}>
            {widget.label || widget.timezoneId}
          </strong>
          {widget.hidden && <span style={badge}>hidden</span>}
          {widget.locked && <span style={badge}>locked</span>}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--ot-text-secondary)",
            marginTop: 2,
          }}
        >
          {local.toLocaleString({ hour: "2-digit", minute: "2-digit" })} ·{" "}
          {widget.timezoneId}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--ot-text-tertiary)",
            marginTop: 2,
          }}
        >
          {design.name} ·{" "}
          {display ? display.name : `Display ${widget.displayId}`}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6 }}>
        <ActionButton label="Edit" onClick={() => onAction(widget, "edit")} />
        <ActionButton
          label={widget.hidden ? "Show" : "Hide"}
          onClick={() => onAction(widget, widget.hidden ? "show" : "hide")}
        />
        <ActionButton
          label={widget.locked ? "Unlock" : "Lock"}
          onClick={() => onAction(widget, widget.locked ? "unlock" : "lock")}
        />
        <ActionButton
          label="Duplicate"
          onClick={() => onAction(widget, "duplicate")}
        />
        <ActionButton
          label="Display"
          onClick={() => onAction(widget, "next-display")}
        />
        <ActionButton
          label="Remove"
          danger
          onClick={() => onAction(widget, "remove")}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px",
        borderRadius: 6,
        border: "1px solid var(--ot-border)",
        background: "var(--ot-elevated)",
        color: danger ? "#e88" : "var(--ot-text)",
        cursor: "pointer",
        fontSize: 12,
      }}
    >
      {label}
    </button>
  );
}

const buttonPrimary: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: "#7a004b",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

const badge: CSSProperties = {
  fontSize: 10,
  padding: "2px 6px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.1)",
  color: "var(--ot-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
