# Architecture

OpenTime is a Tauri 2 desktop application with two surfaces: **desktop clock
widgets** and the **OpenTime Manager**. A single Rust core owns persistence,
windows, the tray, the desktop layer, and startup; the React frontend is shared
across windows and boots the right surface from its window label.

This is the entry-point document. Detailed write-ups live under
[`docs/architecture/`](architecture/README.md).

## Two surfaces

| Surface | Type | Role |
|---|---|---|
| Desktop widgets | Borderless, transparent webview windows (one per clock) | The visible clocks on the desktop layer |
| OpenTime Manager | Conventional window | Configuration: widgets, gallery, appearance, startup, general |

Closing the manager hides it to the tray — it never quits OpenTime.

## Module map

```
src-tauri/src/
├── desktop_layer/     # WorkerW reparent + HWND_BOTTOM fallback (Windows) + DPI icons
├── window_manager/    # create/restore/close widget + manager windows
├── display_manager/   # monitor enumeration, DPI, position correction
├── startup/           # HKCU Run sign-in registration
├── shell_monitor/     # Explorer-restart detection + reattachment
├── persistence/       # SQLite connection, migrations, queries
├── commands/          # narrow validated Tauri command surface
└── manager/           # tray construction + menu events
```

```
src/
├── app/               # window boot context resolution
├── manager/           # Manager UI (widgets, gallery, appearance, startup)
├── widgets/clock/     # widget shell + clock renderers
├── designs/           # configuration-driven design registry
├── timezone/          # offline IANA search + entries
├── persistence/       # typed command wrappers
├── localization/      # translation-ready message catalog
└── shared/            # types, time utils, scheduler, presets, fonts, resume
```

## Key invariants

1. **Windows logic is isolated** behind `#[cfg(windows)]` gates in
   `desktop_layer`, `display_manager`, and `startup`. Future macOS/Linux
   support reuses the clock logic unchanged.
2. **Persistence is the source of truth.** Widget windows are disposable views
   over the SQLite database; they are recreated from records on startup.
3. **IANA timezone ids only.** A bare UTC offset is never persisted as a zone.
4. **One coordinated time source.** `shared/scheduler.ts` advances a single
   `now` value per window; seconds-off clocks tick once per minute.
5. **Narrow, validated IPC.** Every Tauri command validates its inputs; no
   arbitrary shell execution.

## Windows desktop layer

Widgets are placed above the wallpaper and below app windows by reparenting
into the Explorer `WorkerW` surface, with an `HWND_BOTTOM` fallback. Explorer
restarts are detected by `shell_monitor` and widgets re-attach automatically.
See [desktop-layer.md](architecture/desktop-layer.md) for the full strategy,
its limitations, and fallback behaviour.

## Time & timezones

All formatting goes through Luxon + Intl with IANA ids, handling DST, half/quarter-
hour offsets, midnight changes, and leap years. See [timezones.md](architecture/timezones.md).

## Widget lifecycle

Creation → edit → persist → restore → hide → remove. See [widget-lifecycle.md](architecture/widget-lifecycle.md).

## Persistence schema

SQLite with `PRAGMA user_version` migrations. The schema already reserves
calendars / alarms / timers / reminders tables for future versions. See [DATA.md](DATA.md).
