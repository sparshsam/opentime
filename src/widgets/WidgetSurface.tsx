/**
 * WidgetSurface — the interactive shell around a clock widget window.
 *
 * Responsibilities:
 *   - load the widget record for this window
 *   - render the clock via ClockWidget
 *   - drag to reposition (unlocked only)
 *   - resize via corner handle (design-dependent, unlocked only)
 *   - subtle edit-state outline
 *   - context menu with the spec'd actions
 *
 * Window geometry is owned by Rust (window_manager + persistence). Drag/resize
 * report logical coordinates back through tauri commands, which persist and
 * reposition the actual OS window.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { WidgetRecord } from "@/shared/types";
import { api } from "@/persistence/api";
import { ClockWidget } from "./clock/ClockWidget";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface WidgetSurfaceProps {
  widgetId: string;
}

type MenuState = { open: false } | { open: true; x: number; y: number };

export function WidgetSurface({ widgetId }: WidgetSurfaceProps) {
  const [widget, setWidget] = useState<WidgetRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState>({ open: false });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragState = useRef<{ startX: number; startY: number } | null>(null);

  const load = useCallback(async () => {
    try {
      const w = await api.getWidget(widgetId);
      setWidget(w);
      document.body.classList.add("ot-widget");
    } catch (e) {
      setError(String(e));
    }
  }, [widgetId]);

  useEffect(() => {
    load();
    const unlisten = getCurrentWindow().listen("widget-updated", (event) => {
      const payload = event.payload as { widget?: WidgetRecord };
      if (payload?.widget) setWidget(payload.widget);
    });
    return () => {
      document.body.classList.remove("ot-widget");
      unlisten.then((fn) => fn());
    };
  }, [load]);

  if (error)
    return (
      <div style={{ padding: 12, color: "#f66", fontSize: 12 }}>
        OpenTime: {error}
      </div>
    );
  if (!widget) return null;

  const onDragStart = (e: React.MouseEvent) => {
    if (widget.locked) return;
    if (e.button !== 0) return;
    e.preventDefault();
    setDragging(true);
    dragState.current = { startX: e.clientX, startY: e.clientY };
    const move = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const dx = ev.screenX - dragState.current.startX;
      const dy = ev.screenY - dragState.current.startY;
      invoke("drag_widget", { widgetId, dx, dy });
    };
    const up = () => {
      setDragging(false);
      dragState.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResize = (e: React.MouseEvent) => {
    if (widget.locked) return;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const startW = window.innerWidth;
    const startH = window.innerHeight;
    const startX = e.screenX;
    const startY = e.screenY;
    const move = (ev: MouseEvent) => {
      const dw = ev.screenX - startX;
      const dh = ev.screenY - startY;
      invoke("resize_widget", {
        widgetId,
        width: Math.max(120, startW + dw),
        height: Math.max(80, startH + dh),
      });
    };
    const up = () => {
      setResizing(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ open: true, x: e.clientX, y: e.clientY });
  };

  const runMenuAction = async (action: string) => {
    setMenu({ open: false });
    switch (action) {
      case "open-settings":
        await invoke("open_manager");
        break;
      case "toggle-seconds":
        await api.updateWidget({
          id: widget.id,
          patch: { showSeconds: !widget.showSeconds },
        });
        await load();
        break;
      case "toggle-date":
        await api.updateWidget({
          id: widget.id,
          patch: { showDate: !widget.showDate },
        });
        await load();
        break;
      case "lock":
      case "unlock":
        await api.updateWidget({
          id: widget.id,
          patch: { locked: action === "lock" },
        });
        await load();
        break;
      case "duplicate":
        await api.duplicateWidget(widget.id);
        break;
      case "hide":
        await api.updateWidget({ id: widget.id, patch: { hidden: true } });
        await invoke("hide_widget", { widgetId: widget.id });
        break;
      case "remove":
        await invoke("confirm_remove_widget", { widgetId: widget.id });
        break;
      case "move-next-display":
        await invoke("move_widget_next_display", { widgetId: widget.id });
        break;
      case "change-timezone":
      case "change-design":
        // These open the manager (which owns the full editors for v0.2/v0.3).
        await invoke("open_manager", { focusSection: action });
        break;
      default:
        break;
    }
  };

  const editable = !widget.locked;

  return (
    <div
      data-widget-id={widget.id}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: editable && !dragging && !resizing ? "grab" : "default",
        touchAction: "none",
        padding: editable ? 2 : 0,
      }}
      onMouseDown={onDragStart}
      onContextMenu={onContextMenu}
    >
      {/* Edit-state outline (subtle, only when unlocked) */}
      {editable && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "1px dashed rgba(122,0,75,0.5)",
            borderRadius: 8,
            pointerEvents: "none",
            opacity: dragging || resizing ? 0.9 : 0.35,
          }}
          aria-hidden="true"
        />
      )}

      <div style={{ pointerEvents: "none" }}>
        <ClockWidget widget={widget} />
      </div>

      {widget.showTimezoneLabel && (
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 10,
            opacity: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            pointerEvents: "none",
          }}
        >
          {widget.label}
        </div>
      )}

      {editable && (
        <div
          onMouseDown={onResize}
          aria-label="Resize"
          role="button"
          tabIndex={0}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 14,
            height: 14,
            cursor: "nwse-resize",
            background:
              "linear-gradient(135deg, transparent 50%, rgba(122,0,75,0.6) 50%)",
          }}
        />
      )}

      {menu.open && (
        <WidgetMenu
          x={menu.x}
          y={menu.y}
          widget={widget}
          onAction={runMenuAction}
          onClose={() => setMenu({ open: false })}
        />
      )}
    </div>
  );
}

// ── Context menu ──────────────────────────────────────────────────────────

function WidgetMenu({
  x,
  y,
  widget,
  onAction,
  onClose,
}: {
  x: number;
  y: number;
  widget: WidgetRecord;
  onAction: (action: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("click", close);
    window.addEventListener("blur", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("blur", close);
    };
  }, [onClose]);

  const items: { action: string; label: string; disabled?: boolean }[] = [
    { action: "open-settings", label: "Open Settings" },
    { action: "change-timezone", label: "Change Timezone" },
    { action: "change-design", label: "Change Design" },
    { action: "duplicate", label: "Duplicate" },
    {
      action: widget.locked ? "unlock" : "lock",
      label: widget.locked ? "Unlock Position" : "Lock Position",
    },
    {
      action: "toggle-seconds",
      label: `Show Seconds: ${widget.showSeconds ? "On" : "Off"}`,
    },
    {
      action: "toggle-date",
      label: `Show Date: ${widget.showDate ? "On" : "Off"}`,
    },
    { action: "move-next-display", label: "Move to Display" },
    { action: "hide", label: "Hide Widget" },
    { action: "remove", label: "Remove Widget" },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 1000,
        minWidth: 200,
        background: "#1c1c1c",
        border: "1px solid #333",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        padding: 4,
        fontSize: 13,
        color: "#eee",
      }}
    >
      {items.map((item) => (
        <button
          key={item.action}
          role="menuitem"
          disabled={item.disabled}
          onClick={(e) => {
            e.stopPropagation();
            onAction(item.action);
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            color: item.action === "remove" ? "#e88" : "inherit",
            padding: "6px 10px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "inherit",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
