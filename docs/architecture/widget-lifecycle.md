# Widget Lifecycle

This document describes the full lifecycle of an OpenTime clock widget — from
creation through editing, persistence, hiding, and removal.

## Creation

1. The manager or tray triggers **Add Clock** → the `add_widget` command.
2. Rust builds a `WidgetRecord` with defaults: the configured default design,
   the local system zone (IANA), the default hour cycle, and a safe position
   near the top-right of the primary display.
3. The record is inserted into SQLite.
4. `window_manager::create_widget_window` opens a borderless, transparent,
   tool-window webview labeled `widget-<uuid>`.
5. On Windows, the window is attached to the desktop layer (WorkerW reparent)
   and registered with the shell monitor.

The widget window boots `index.html`, resolves its widget id from the window
label, and loads its record via `get_widget`.

## Editing

- **Manager** → the manager updates the record through `update_widget`
  (a whitelisted JSON patch) and emits `widget-updated` so the live window
  re-renders.
- **Widget context menu** → toggles seconds/date, lock/unlock, duplicate, hide,
  or remove directly through commands.
- **Design switching** → the gallery applies a design, preserving compatible
  settings and resetting incompatible ones (e.g. seconds on a design that does
  not support it).

## Persistence

- Every mutation writes to SQLite via the command layer.
- Positions are stored in **logical pixels** (`logical_x/y/width/height`) so
  DPI scaling changes never cause drift.
- The record is the source of truth; windows are disposable views over it.

## Restore

- **App restart / sign-in** → `restore_all_widgets` reads all widgets and
  recreates each window, attaching it to the desktop layer.
- **Explorer restart** → the shell monitor notices the WorkerW is gone and
  re-attaches the widget.
- **Invalid position** → `correct_position` moves the widget safely onto the
  primary display without destroying its stored placement.

## Hide / Show

- Hiding persists `hidden = true` and hides the window; showing reverses it.
- Hidden widgets are still listed in the manager and can be re-shown.

## Removal

1. The manager confirms with the user.
2. `delete_widget` removes the row from SQLite.
3. `destroy_widget_window` detaches from the desktop layer and closes the
   window.

Quitting from the tray closes all widget windows cleanly; state is already
persisted, so nothing is lost.
