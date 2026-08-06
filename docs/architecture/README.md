# OpenTime Architecture

> Entry point: [docs/Architecture.md](../Architecture.md). This directory holds
> the detailed write-ups referenced from there.

OpenTime is a Tauri 2 desktop application with two distinct surfaces:

1. **Desktop widgets** — one borderless, transparent webview window per clock,
   placed on the Windows desktop layer.
2. **OpenTime Manager** — a conventional configuration window for widgets,
   settings, the gallery, and startup.

A single Rust core owns persistence, windows, the tray, the desktop layer, and
startup. The React frontend is shared: each window boots into the surface its
label dictates.

## Module layout

```
src-tauri/src/
├── desktop_layer/     # WorkerW reparent + HWND_BOTTOM fallback (Windows)
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
├── manager/           # Manager UI (widgets, gallery, settings, startup)
├── widgets/clock/     # widget shell + clock renderers
├── designs/           # configuration-driven design registry
├── settings/          # settings UI
├── tray/              # (reserved) tray state mapping
├── startup/           # startup UI
├── timezone/          # offline IANA search + entries
├── persistence/       # typed command wrappers
├── localization/      # translation-ready message catalog
└── shared/            # types, time utils, scheduler, presets, fonts
```

## Design principles

- **One coordinated time source.** The `TimeScheduler` advances a single
  `now` value; every clock renders from it. No per-clock timers, no drift.
- **Windows logic isolated.** Everything Win32-specific lives in
  `desktop_layer`, `display_manager`, and `startup` behind `#[cfg(windows)]`
  gates, so macOS/Linux can be added without touching clock logic.
- **Persistence is the source of truth.** The manager and widget windows are
  views over the SQLite state; windows are recreated from records on startup.
- **Narrow IPC.** A small, validated command set; no arbitrary shell execution,
  no unchecked filesystem access.

See [desktop-layer.md](desktop-layer.md) for the Windows widget strategy and
[timezones.md](timezones.md) for time handling.
